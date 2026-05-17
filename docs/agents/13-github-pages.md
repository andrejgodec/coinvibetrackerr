# Agent: GitHub Pages Deployment

## Goal

Deploy CoinVibeTracker as a static site to GitHub Pages via GitHub Actions.

GitHub Pages serves only static files — no Node.js server runs. This requires switching
from `output: 'standalone'` to `output: 'export'` and migrating all server-side
data fetching (Server Actions, SSR) to client-side fetches. Supabase and the
HttpOnly cookie API key are server-only features and must be replaced.

---

## What Changes and Why

| Current | After migration | Why |
|---------|-----------------|-----|
| `output: 'standalone'` | `output: 'export'` | Pages can't run a Node server |
| Server Actions in `actions.ts` | Direct client-side `fetch()` | Server Actions require a server |
| HttpOnly cookie for API key | `localStorage` | Cookies require a server to set |
| SSR dashboard (`async` server component) | Client component with `useEffect` | No server to run SSR |
| SSR coin detail page | Static shell + client-side fetch | Same reason |
| Supabase server writes | Removed | No server context; localStorage handles client cache |
| `next/image` remote optimization | `unoptimized: true` | Pages can't run the image optimizer |

The API key loses `HttpOnly` protection — it will be readable by JS. This is acceptable
for a free CoinGecko Demo key (no billing, no personal data).

CoinGecko's API supports CORS, so direct browser fetches work without a proxy.

---

## Prerequisites

- GitHub repository exists at `github.com/andrejgodec/coinvibetrackerr`
- GitHub Pages enabled: repo Settings → Pages → Source: **GitHub Actions**

---

## Deliverables

| File | Change |
|------|--------|
| `next.config.ts` | `output: 'export'`, `basePath`, `trailingSlash`, `images.unoptimized` |
| `src/lib/api/coingecko-client.ts` | New — browser-safe CoinGecko client (reads key from localStorage) |
| `src/app/page.tsx` | Convert to client component — fetch on mount |
| `src/app/coin/[id]/page.tsx` | Static shell + client-side fetch on mount |
| `src/app/actions.ts` | Delete — no longer needed |
| `src/components/ApiKeyModal.tsx` | Store key in `localStorage` instead of server action |
| `src/components/CoinTable.tsx` | Import from `coingecko-client` instead of server action |
| `src/components/SearchBar.tsx` | Import from `coingecko-client` instead of server action |
| `src/components/ChartSection.tsx` | Import from `coingecko-client` instead of server action |
| `.github/workflows/pages.yml` | New — build + deploy to Pages on push to `main` |

---

## Step 1 — `next.config.ts`

The `basePath` must match the repository name (GitHub Pages serves at
`https://username.github.io/reponame/`).

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/coinvibetrackerr',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
    ],
  },
}

export default nextConfig
```

---

## Step 2 — `src/lib/api/coingecko-client.ts` (new file)

Browser-safe CoinGecko client. Reads the API key from `localStorage` at call time.
No server imports (`cookies`, `next/headers`) — this file can be imported by client components.

```typescript
import type { Coin, CoinDetail, OHLCVPoint, CoinSearchResult } from '@/types/coin'

const BASE = 'https://api.coingecko.com/api/v3'

function getHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const key = localStorage.getItem('cgk')
  return key ? { 'x-cg-demo-api-key': key } : {}
}

async function cgFetch(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: getHeaders() })
  if (res.status === 429) throw new Error('rate_limit')
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`coingecko_${res.status}`)
  return res.json()
}

export async function clientGetTopCoins(limit = 100): Promise<Coin[]> {
  const data = await cgFetch(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true`
  ) as Record<string, unknown>[]
  return data.map(mapCoin)
}

export async function clientGetCoinDetail(id: string): Promise<CoinDetail> {
  const data = await cgFetch(
    `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`
  ) as Record<string, unknown>
  return mapCoinDetail(data)
}

export async function clientGetCoinHistory(id: string, days: 1 | 7 | 30 | 365): Promise<OHLCVPoint[]> {
  const data = await cgFetch(`/coins/${id}/ohlc?vs_currency=usd&days=${days}`) as number[][]
  return data.map(([time, open, high, low, close]) => ({ time, open, high, low, close }))
}

export async function clientSearchCoins(query: string): Promise<CoinSearchResult[]> {
  if (query.length < 2) return []
  const data = await cgFetch(`/search?query=${encodeURIComponent(query)}`) as { coins: Record<string, unknown>[] }
  return data.coins.slice(0, 10).map(c => ({
    id: c.id as string,
    name: c.name as string,
    symbol: (c.symbol as string).toUpperCase(),
    thumb: c.thumb as string,
  }))
}

// --- mappers (mirror the shapes in coingecko.ts) ---

function mapCoin(d: Record<string, unknown>): Coin {
  return {
    id: d.id as string,
    symbol: (d.symbol as string).toUpperCase(),
    name: d.name as string,
    image: d.image as string,
    currentPrice: d.current_price as number,
    marketCap: d.market_cap as number,
    marketCapRank: d.market_cap_rank as number,
    totalVolume: d.total_volume as number,
    priceChangePercentage24h: d.price_change_percentage_24h as number,
    sparklineIn7d: { price: ((d.sparkline_in_7d as Record<string, unknown>)?.price as number[]) ?? [] },
  }
}

function mapCoinDetail(d: Record<string, unknown>): CoinDetail {
  const md = d.market_data as Record<string, unknown>
  const get = (obj: Record<string, unknown>, key: string): number =>
    ((obj[key] as Record<string, unknown>)?.usd as number) ?? 0
  return {
    id: d.id as string,
    symbol: ((d.symbol as string) ?? '').toUpperCase(),
    name: d.name as string,
    image: (d.image as Record<string, string>)?.large ?? '',
    description: ((d.description as Record<string, string>)?.en ?? '').replace(/<[^>]+>/g, ''),
    currentPrice: get(md, 'current_price'),
    marketCap: get(md, 'market_cap'),
    marketCapRank: d.market_cap_rank as number,
    totalVolume: get(md, 'total_volume'),
    high24h: get(md, 'high_24h'),
    low24h: get(md, 'low_24h'),
    priceChangePercentage24h: (md.price_change_percentage_24h as number) ?? 0,
    priceChangePercentage7d: (md.price_change_percentage_7d as number) ?? 0,
    priceChangePercentage30d: (md.price_change_percentage_30d as number) ?? 0,
    circulatingSupply: (md.circulating_supply as number) ?? 0,
    totalSupply: (md.total_supply as number) ?? null,
    maxSupply: (md.max_supply as number) ?? null,
    ath: get(md, 'ath'),
    athChangePercentage: (md.ath_change_percentage as Record<string, number>)?.usd ?? 0,
    athDate: (md.ath_date as Record<string, string>)?.usd ?? '',
    atl: get(md, 'atl'),
    atlChangePercentage: (md.atl_change_percentage as Record<string, number>)?.usd ?? 0,
    atlDate: (md.atl_date as Record<string, string>)?.usd ?? '',
    links: {
      homepage: ((d.links as Record<string, string[]>)?.homepage ?? []).filter(Boolean),
      twitter: (d.links as Record<string, string>)?.twitter_screen_name ?? '',
      reddit: (d.links as Record<string, string>)?.subreddit_url ?? '',
      telegram: (d.links as Record<string, string>)?.telegram_channel_identifier ?? '',
    },
    genesisDate: (d.genesis_date as string) ?? null,
    categories: (d.categories as string[]) ?? [],
  }
}
```

---

## Step 3 — `src/app/page.tsx` — convert to client component

Remove the `async` server component. Fetch on mount using `clientGetTopCoins`.
Preserve the localStorage seed pattern from the existing `CoinTable` — the table
already handles polling internally, so the page only needs to pass `initialCoins`.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { CoinTable } from '@/components/CoinTable'
import { SearchBar } from '@/components/SearchBar'
import { MarketSummary } from '@/components/MarketSummary'
import { clientGetTopCoins } from '@/lib/api/coingecko-client'
import type { Coin } from '@/types/coin'

export default function HomePage() {
  const [coins, setCoins] = useState<Coin[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('cvt_coins_cache')
      return raw ? (JSON.parse(raw) as { coins: Coin[] }).coins : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    clientGetTopCoins(100).then(fresh => {
      setCoins(fresh)
      localStorage.setItem('cvt_coins_cache', JSON.stringify({ coins: fresh, cachedAt: Date.now() }))
    }).catch(() => {})
  }, [])

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">CoinVibeTracker</h1>
          <SearchBar />
        </div>
        <MarketSummary coins={coins} />
        <CoinTable initialCoins={coins} />
      </div>
    </main>
  )
}
```

Remove `export const revalidate = 60` — ISR does not work with static export.

---

## Step 4 — `src/app/coin/[id]/page.tsx` — static shell + client fetch

Remove `force-dynamic` and the server-side data fetching. Generate static HTML shells
for the top 100 coins (so the page exists for Google/bots), then hydrate with live data
on mount. Coins outside the top 100 also get the shell (via `dynamicParams: false`
is NOT set — unknown params will 404 at build, so keep `generateStaticParams` returning
top 100 and add a client-side fallback).

```tsx
'use client'  // whole file becomes a client component

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { clientGetCoinDetail, clientGetCoinHistory } from '@/lib/api/coingecko-client'
import { getCoinNews } from '@/lib/api/news'
import { CoinHeader } from '@/components/CoinHeader'
import { ChartSection } from '@/components/ChartSection'
import { CoinStats } from '@/components/CoinStats'
import { CoinAbout } from '@/components/CoinAbout'
import { CoinNews } from '@/components/CoinNews'
import { CoinCommunity } from '@/components/CoinCommunity'
import { CoinConverter } from '@/components/CoinConverter'
import Link from 'next/link'
import type { CoinDetail, NewsArticle, OHLCVPoint } from '@/types/coin'

// Keep generateStaticParams so build produces HTML shells for top 100
// Must be in a separate server file OR use the 'use client' page with a
// companion generateStaticParams export — in Next.js 15+, export it from
// the same file only if not using 'use client'.
// Solution: create a separate src/app/coin/[id]/generateStaticParams.ts
// that re-exports the function, and keep the page as a pure client component
// with no generateStaticParams (Next.js will treat unknown routes as 404).

export default function CoinPage() {
  const { id } = useParams<{ id: string }>()
  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [history, setHistory] = useState<OHLCVPoint[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [error, setError] = useState<'not_found' | 'rate_limit' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    Promise.all([
      clientGetCoinDetail(id),
      clientGetCoinHistory(id, 7),
    ])
      .then(([coinData, histData]) => {
        setCoin(coinData)
        setHistory(histData)
        setLoading(false)
        // fetch news separately — non-blocking
        getCoinNews(coinData.symbol).then(setNews).catch(() => {})
      })
      .catch((err: Error) => {
        setError(err.message === 'not_found' ? 'not_found' : 'rate_limit')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Loading...</div>
      </main>
    )
  }

  if (error === 'not_found') {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-200 font-medium">Coin not found</p>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← Back to markets</Link>
        </div>
      </main>
    )
  }

  if (error || !coin) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-200 font-medium">Rate limit reached</p>
          <p className="text-zinc-400 text-sm">Wait a moment and refresh, or add a CoinGecko API key in settings.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100">
          ← Back to markets
        </Link>
        <CoinHeader coin={coin} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ChartSection coinId={coin.id} initialData={history} />
            <CoinNews articles={news} />
            <CoinAbout coin={coin} />
            <CoinCommunity coin={coin} />
          </div>
          <div className="space-y-4">
            <CoinStats coin={coin} />
            <CoinConverter coinSymbol={coin.symbol} priceUsd={coin.currentPrice} />
          </div>
        </div>
      </div>
    </main>
  )
}
```

Because `generateStaticParams` cannot coexist with `'use client'` in the same file,
add a thin layout file at `src/app/coin/[id]/layout.tsx` (server component) that
exports `generateStaticParams`:

```typescript
// src/app/coin/[id]/layout.tsx
import { getTopCoins } from '@/lib/api/coingecko'

export async function generateStaticParams() {
  try {
    const coins = await getTopCoins(100, 1)
    return coins.map(c => ({ id: c.id }))
  } catch {
    return []
  }
}

export default function CoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

This generates static HTML shells for the top 100 coins at build time. The client
component then fetches live data on mount.

---

## Step 5 — `src/components/ApiKeyModal.tsx` — localStorage instead of server action

Replace the `setApiKeyAction` server action call with direct `localStorage` writes.

```typescript
// In the save handler:
function handleSave() {
  if (!inputKey) {
    localStorage.removeItem('cgk')
    // show toast "API key cleared"
  } else {
    if (!/^CG-[A-Za-z0-9]{20,60}$/.test(inputKey)) {
      // show validation error
      return
    }
    localStorage.setItem('cgk', inputKey)
    // show toast "API key saved"
  }
  onClose()
}
```

Remove the import of `setApiKeyAction`.

---

## Step 6 — `src/components/CoinTable.tsx` and `SearchBar.tsx`

Both currently call server actions imported from `@/app/actions`. Replace with client API:

- `fetchTopCoinsAction()` → `clientGetTopCoins(100)` from `@/lib/api/coingecko-client`
- `searchCoinsAction(query)` → `clientSearchCoins(query)` from `@/lib/api/coingecko-client`

---

## Step 7 — `src/components/ChartSection.tsx`

Replace `fetchCoinHistoryAction` with `clientGetCoinHistory` from `@/lib/api/coingecko-client`.

---

## Step 8 — Delete `src/app/actions.ts`

No longer needed. All data fetching is client-side.

---

## Step 9 — `.github/workflows/pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build
        env:
          COINGECKO_API_KEY: ${{ secrets.COINGECKO_API_KEY }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: out/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deploy
```

Note: `COINGECKO_API_KEY` is used only at **build time** (for `generateStaticParams`).
Runtime API calls in the browser use the key from `localStorage`.

---

## Step 10 — Enable GitHub Pages

In the GitHub repository:
1. Settings → Pages → Source: **GitHub Actions**
2. (Optional) Add `COINGECKO_API_KEY` in Settings → Secrets → Actions

Push to `main` to trigger the first deployment. The site will be live at:
`https://andrejgodec.github.io/coinvibetrackerr/`

---

## Implementation Order

1. Update `next.config.ts`
2. Create `src/lib/api/coingecko-client.ts`
3. Convert `src/app/page.tsx` to client component
4. Add `src/app/coin/[id]/layout.tsx` with `generateStaticParams`
5. Convert `src/app/coin/[id]/page.tsx` to client component
6. Update `ApiKeyModal.tsx` to use localStorage
7. Update `CoinTable.tsx` — replace server action import
8. Update `SearchBar.tsx` — replace server action import
9. Update `ChartSection.tsx` — replace server action import
10. Delete `src/app/actions.ts`
11. Run `npm run build` — verify `out/` directory is generated
12. Create `.github/workflows/pages.yml`
13. Push to `main`

---

## Acceptance Criteria

- [ ] `npm run build` produces an `out/` directory (static export)
- [ ] `out/index.html` exists (dashboard page)
- [ ] `out/coin/bitcoin/index.html` exists (static shell for bitcoin)
- [ ] No TypeScript errors (`npm run build` passes type check)
- [ ] Opening `out/index.html` via a static server loads the coin table from CoinGecko
- [ ] Navigating to `/coin/bitcoin` loads coin detail data
- [ ] Entering a CoinGecko API key in settings persists across page refreshes (localStorage)
- [ ] GitHub Actions workflow deploys successfully to Pages
- [ ] Live URL `https://andrejgodec.github.io/coinvibetrackerr/` opens the dashboard

## Known Limitations After Migration

| Feature | Status |
|---------|--------|
| API key security | Stored in localStorage (readable by JS) — acceptable for free Demo key |
| Offline stale cache | Removed (no Supabase server writes). localStorage still seeds on revisit |
| Coin pages for coins outside top 100 | Client-rendered with loading state (no static shell) |
| ISR / background revalidation | Not available on GitHub Pages — data is always fetched from browser |
