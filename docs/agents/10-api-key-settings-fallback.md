# Agent: API Key Settings + Offline Fallback Mode

## Goal

Three deliverables in one agent:

1. **API key settings panel** — let the user paste a CoinGecko Demo API key into the UI; persist it and use it for all subsequent API calls, removing the 30 req/min anonymous limit.
2. **Offline/fallback mode** — when CoinGecko returns 429 or is unavailable, fall back to stale Supabase cache (already populated by prior successful fetches) or to Binance public endpoints for price data. CoinCodex scraping is an option but carries ToS risk (see note below).
3. **Persistent client-side cache** — the coin table currently clears on every page revisit (React state lost on navigation). Seed the table from `localStorage` immediately on mount so data appears instantly, then refresh in the background.

---

## Background

Without a CoinGecko API key, the free tier allows ~30 req/min per IP. A single page load (dashboard + coin detail) can burn 2–3 tokens, and rate limits hit fast during development/demo. The solution is two-layered:

- Let power users supply their own key (zero cost, just registration at coingecko.com/api)
- Let everyone else get degraded-but-functional data from stale cache or Binance

**CoinCodex scraping note**: CoinCodex ToS prohibits scraping and their pages are JS-rendered (require headless browser). Rejected as primary fallback. If included as experimental option, use a server-side Puppeteer/Playwright fetch only for fields unavailable from Binance, clearly gated behind a feature flag.

---

## Part 1 — API Key Settings Panel

### Where to store the key

Store in a `HttpOnly` cookie named `cgk` so the server-side Next.js code can read it on every request without exposing it to client JS (XSS protection).

- Client sets the cookie via a `setApiKeyAction(key: string)` server action
- Server reads it with `cookies().get('cgk')?.value` in `coingecko.ts`
- TTL: session cookie (no `Max-Age`) — user re-enters on new session. Optionally add `Max-Age: 2592000` (30 days) with a "Remember me" checkbox.

### UI

Add a settings button (gear icon) in the top-right of the global `<nav>` (or wherever the header is). Clicking it opens a modal dialog (shadcn `<Dialog>`).

**Dialog content:**
```
CoinGecko API Key
[input type="password" placeholder="CG-xxxxxxxxxxxxxxxx"]
[Save key]  [Clear key]

Get a free Demo key at coingecko.com/api
```

On save: call `setApiKeyAction(key)`, close dialog, show a toast "API key saved".  
On clear: call `setApiKeyAction('')`, show "API key cleared. Anonymous limits apply."

### Files to create/modify

| File | Change |
|------|--------|
| `src/app/actions.ts` | Add `setApiKeyAction(key: string)` — validates format, sets cookie |
| `src/lib/api/coingecko.ts` | `headers()` reads cookie via `cookies()` from `next/headers` (server-side) |
| `src/components/ApiKeyModal.tsx` | New client component: Dialog with controlled input + save/clear buttons |
| `src/components/NavBar.tsx` | Add gear icon button that opens `ApiKeyModal` |
| `src/app/layout.tsx` | Include `NavBar` if not already present |

### `setApiKeyAction` spec

```typescript
'use server'
import { cookies } from 'next/headers'

export async function setApiKeyAction(key: string): Promise<void> {
  const store = await cookies()
  if (!key) {
    store.delete('cgk')
    return
  }
  // CoinGecko Demo keys are "CG-" followed by alphanumerics
  if (!/^CG-[A-Za-z0-9]{20,60}$/.test(key)) {
    throw new Error('Invalid CoinGecko API key format')
  }
  store.set('cgk', key, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}
```

### `headers()` update in coingecko.ts

```typescript
import { cookies } from 'next/headers'

async function headers(): Promise<HeadersInit> {
  // cookies() requires async context in Next.js 15+
  const envKey = process.env.COINGECKO_API_KEY
  if (envKey) return { 'x-cg-demo-api-key': envKey }
  try {
    const store = await cookies()
    const cookieKey = store.get('cgk')?.value
    if (cookieKey) return { 'x-cg-demo-api-key': cookieKey }
  } catch {
    // Outside request context (e.g. generateStaticParams) — no cookie available
  }
  return {}
}
```

Update all `cgFetch` calls to `await headers()`.

---

## Part 2 — Offline / Stale-Cache Fallback

### Strategy

When `getCoinDetail` or `getTopCoins` throws `ApiRateLimitError` or any network error:

1. **Check Supabase `coin_cache`** — if a row exists for the requested coin/list, return it with a `stale: true` flag and a "Data may be outdated" banner in the UI.
2. **Binance fallback for price** — fetch current price from `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT` (no key, 1200 weight/min). Merge into stale Supabase data to update the price field.
3. **Hard fail** — if Supabase also has no data, throw `CoinUnavailableError` and show the existing error UI.

### Binance price fallback

```typescript
// src/lib/api/binance.ts — add:
export async function getSpotPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
    if (!res.ok) return null
    const { price } = await res.json() as { price: string }
    return parseFloat(price)
  } catch {
    return null
  }
}
```

### Fallback flow in coingecko.ts

```typescript
export async function getCoinDetail(id: string): Promise<CoinDetail> {
  // 1. Try in-memory TTL cache
  const cached = detailCache.get(`detail-${id}`)
  if (cached) return cached

  try {
    // 2. Try CoinGecko API
    return await fetchCoinDetailFromApi(id)
  } catch (err) {
    if (err instanceof CoinNotFoundError) throw err

    // 3. Try Supabase stale cache
    const stale = await getCachedCoin(id)  // from src/lib/db/queries.ts
    if (stale) {
      // Optionally freshen price from Binance
      const binanceSymbol = coinIdToBinanceSymbol(id)
      if (binanceSymbol) {
        const livePrice = await getSpotPrice(binanceSymbol)
        if (livePrice) stale.currentPrice = livePrice
      }
      stale._stale = true  // add to CoinDetail type
      return stale
    }

    throw err
  }
}
```

### `_stale` field

Add `_stale?: true` to `CoinDetail` in `src/types/coin.ts`.

In `src/app/coin/[id]/page.tsx`, if `coin._stale`, render a banner above `CoinHeader`:

```tsx
{coin._stale && (
  <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
    Showing cached data — CoinGecko API unavailable. Prices may be outdated.
  </div>
)}
```

Similarly for `getTopCoins` → check `coin_cache` table for any rows, return them with stale flag.

### Supabase query needed

`getCachedCoin(id: string)` — add to `src/lib/db/queries.ts`:

```typescript
export async function getCachedCoin(id: string): Promise<CoinDetail | null> {
  const { data } = await supabase
    .from('coin_cache')
    .select('data')
    .eq('id', id)
    .single()
  return data ? (data.data as CoinDetail) : null
}
```

Note: `coin_cache` currently stores `Coin[]` blobs (top 100 list), not individual `CoinDetail` rows. Either:
- Add a separate `coin_detail_cache` table, OR
- Upsert `CoinDetail` into `coin_cache` on every successful `getCoinDetail` call

Simpler: upsert on success. Add `upsertCoinDetail(coin: CoinDetail)` to `queries.ts` that writes `{ id: coin.id, data: coin, updated_at: now }` to `coin_cache`.

---

## Part 3 — Persistent Client-Side Cache (localStorage)

### Problem

`CoinTable` stores coins in React state (`useState`). Every time the user navigates away and returns, the state is empty and the table shows a loading skeleton until the 30s poll fires or the page refetches. With rate limits, that refetch may fail.

### Solution

Use `localStorage` key `cvt_coins_cache` to persist the last known coin list and timestamp. On mount, seed the table immediately from localStorage before any network call, then replace with fresh data when it arrives.

### Spec

**Cache shape** (stored as JSON in `localStorage['cvt_coins_cache']`):
```typescript
interface CoinsCache {
  coins: Coin[]
  cachedAt: number  // Unix ms
}
```

**Write**: after every successful `fetchTopCoinsAction` response in `CoinTable.tsx`, write to localStorage.

**Read**: in the `useEffect` that initializes state, check localStorage first:
```typescript
useEffect(() => {
  const raw = localStorage.getItem('cvt_coins_cache')
  if (raw) {
    const { coins, cachedAt } = JSON.parse(raw) as CoinsCache
    // Show stale data immediately; stale indicator if >5 min old
    setCoins(coins)
    if (Date.now() - cachedAt > 5 * 60 * 1000) setIsStale(true)
  }
  // Then fetch fresh data
  fetchTopCoinsAction().then(fresh => {
    setCoins(fresh)
    setIsStale(false)
    localStorage.setItem('cvt_coins_cache', JSON.stringify({ coins: fresh, cachedAt: Date.now() }))
  }).catch(() => {}) // already showing cached data; swallow
}, [])
```

**Stale indicator**: if `isStale`, show a subtle amber dot or "cached" badge next to the table header timestamp. Do not hide or disable the table.

**TTL**: no hard expiry — always show cached data. Let users see something rather than a blank table. Fresh data replaces it when available.

**Files to modify**: `src/components/CoinTable.tsx` only.

### Server-side cache writes (feeds the Supabase fallback in Part 2)

Currently `getTopCoins` and `getCoinDetail` never write to Supabase — the `upsertCoinCache` and `upsertCoinDetail` functions exist but are never called. Wire them up:

In `src/lib/api/coingecko.ts`:
- After a successful `getTopCoins` response: call `upsertCoinCache(data)` (fire-and-forget, don't await — never block the response)
- After a successful `getCoinDetail` response: call `upsertCoinDetail(data)` (fire-and-forget)

```typescript
// fire-and-forget pattern — never throws into the caller
void upsertCoinCache(data).catch(() => {})
```

This ensures Supabase always has a recent snapshot, so the Part 2 stale fallback actually has data to serve.

---

## Part 4 — CoinCodex Scraping (Optional / Experimental)

**Only implement if explicitly requested.** Risks:
- ToS violation
- Requires Playwright server-side (adds ~300MB to image)
- JS-rendered pages mean HTML-only fetch won't work

If implemented, gate behind `ENABLE_COINCODEX_SCRAPE=true` env var. Scrape only fields not available from Binance: description, ATH, supply. Cache aggressively (24h TTL). Do not scrape on every request.

---

## Acceptance Criteria

- [ ] Gear icon in nav opens API key modal
- [ ] Entering a valid CoinGecko Demo key and saving → subsequent API calls use it, rate limit errors stop
- [ ] Clearing the key → anonymous mode resumes
- [ ] With no key and CoinGecko rate-limited → stale Supabase data renders with amber banner
- [ ] With no key and no Supabase data → existing "Rate limit reached" message shown
- [ ] Binance spot price refreshes the stale price field when available
- [ ] `_stale` field does not appear in serialized API responses to the client
- [ ] On page revisit, coin table populates instantly from localStorage before any network call
- [ ] Stale localStorage data (>5 min) shows an amber "cached" indicator
- [ ] After a successful fetch, localStorage is updated and stale indicator clears
- [ ] `upsertCoinCache` and `upsertCoinDetail` are called (fire-and-forget) on every successful API response
- [ ] `npm run build` passes
- [ ] No `COINGECKO_API_KEY` env var required to run the container

## Implementation Order

1. Add `_stale` to `CoinDetail` type
2. Add `getCachedCoin` + `upsertCoinDetail` to `queries.ts`
3. Add `getSpotPrice` to `binance.ts`
4. Refactor `getCoinDetail` to extract `fetchCoinDetailFromApi` + add fallback chain
5. Wire `upsertCoinCache` / `upsertCoinDetail` fire-and-forget in `coingecko.ts`
6. Update `coingecko.ts` `headers()` to read cookie
7. Add `setApiKeyAction` to `actions.ts`
8. Build `ApiKeyModal` component
9. Wire `NavBar` with gear icon
10. Add stale banner to coin detail page
11. Add localStorage seed + write to `CoinTable.tsx`
12. Verify build
