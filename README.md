# CoinVibeTracker

> Real-time cryptocurrency dashboard built with Next.js 16, Supabase, and CoinGecko.
> Track prices, charts, and market data for thousands of coins — no account required.

Built as an open-source vibe coding project for crypto enthusiasts. Every feature was implemented using AI agent briefs — see [docs/VIBE_CODING.md](docs/VIBE_CODING.md) to contribute the same way.

---

## Two Editions

CoinVibeTracker ships in two editions depending on how you want to run it:

| | Full Edition | Lightweight Edition |
|---|---|---|
| **Deployment** | Self-hosted (Podman / Docker) | GitHub Pages (free, zero infra) |
| **Branch** | `main` | `pages` |
| **Data fetching** | Server-side (SSR + Server Actions) | Client-side (browser → CoinGecko) |
| **API key storage** | `HttpOnly` cookie — not exposed to JS | `localStorage` |
| **Offline fallback** | Supabase stale cache + Binance | `localStorage` only |
| **Database** | Supabase (PostgreSQL) | None required |
| **Setup cost** | Supabase project + env vars | None — just enable GitHub Pages |
| **Best for** | Production, self-hosted, contributors | Quick demo, zero-config hosting |

**Not sure which to use?** Start with the Lightweight Edition — no accounts, no config, live in 2 minutes. Switch to the Full Edition when you need server-side caching or the Supabase fallback.

---

## Features

Both editions include:

- **Live price table** — top 100 coins with price, 24h change, market cap, volume, sparkline; auto-refreshes every 30 s
- **Market summary bar** — total market cap, 24h volume, BTC dominance, active coins at a glance
- **Search & filter** — instant client-side search across the full coin list
- **Coin detail pages** — dedicated page per coin at `/coin/[id]` with:
  - Price header with 24h high/low and market rank
  - Stats panel: market cap, circulating/total/max supply, ATH/ATL
  - Interactive OHLCV chart (1D / 7D / 30D / 1Y) — TradingView Lightweight Charts
  - Unit converter — input an amount in USD or crypto, get the other
  - Latest news feed
  - Community links (Twitter/X, Reddit, Telegram, Discord)
  - About section with coin description
- **API key settings** — paste your free CoinGecko Demo key in the settings panel (gear icon)
- **Persistent client cache** — coin table seeds instantly from `localStorage` on every page visit

Full Edition only:

- **Offline / stale-cache fallback** — when CoinGecko is rate-limited or unreachable, serves stale data from Supabase with an amber banner, refreshes price from Binance spot API
- **HttpOnly cookie for API key** — key never exposed to client-side JavaScript

---

## Quick Start — Full Edition (`main`)

Requires a free [Supabase](https://supabase.com) project for the database cache.

### Option A — Podman container (recommended)

```bash
git clone https://github.com/andrejgodec/coinvibetrackerr
cd coinvibetrackerr
cp .env.example .env.local   # fill in Supabase keys
./podman-run.sh
```

### Option B — Local dev server

```bash
git clone https://github.com/andrejgodec/coinvibetrackerr
cd coinvibetrackerr
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000

### Environment Variables (Full Edition)

Copy `.env.example` to `.env.local`:

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | [supabase.com](https://supabase.com) → project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | same location |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | same location (service role, not anon) |
| `COINGECKO_API_KEY` | No | [coingecko.com/api](https://www.coingecko.com/api) — free Demo key |

**No CoinGecko key?** The app runs on the anonymous free tier (30 req/min). Enter your key at runtime via the settings panel — no restart or redeploy required.

---

## Quick Start — Lightweight Edition (`pages` branch)

No database, no backend, no config. Runs entirely in the browser.

### Deploy to GitHub Pages (2 minutes)

1. Fork this repository
2. Switch to the `pages` branch
3. Go to **Settings → Pages → Source → GitHub Actions**
4. Push any commit to `pages` to trigger the first deploy

Live at: `https://YOUR_USERNAME.github.io/coinvibetrackerr/`

### Run locally

```bash
git clone -b pages https://github.com/andrejgodec/coinvibetrackerr
cd coinvibetrackerr
npm install
npm run dev
```

Open http://localhost:3000 — no `.env` file needed.

### CoinGecko API key (optional)

Without a key the app uses the anonymous free tier (30 req/min), which is enough for personal use. To raise the limit: click the gear icon in the nav and paste your free [CoinGecko Demo key](https://www.coingecko.com/api). It is saved to `localStorage` and used for all subsequent requests.

---

## Tech Stack

### Full Edition

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (App Router) | Server components, server actions, ISR |
| Language | TypeScript | Strict mode, Zod for runtime validation |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark-mode-first, zinc palette |
| Charts | TradingView Lightweight Charts v5 | OHLCV candlestick + line |
| Database | Supabase (PostgreSQL) | Coin cache, coin detail cache |
| Primary data | CoinGecko API | Prices, market data, metadata, news |
| Fallback data | Binance Spot API | Price fallback when CoinGecko is unavailable |
| Container | Podman (multi-stage, non-root) | `node:20-alpine`, uid 1001 |
| CI | GitHub Actions | Lint + build + container smoke test |

### Lightweight Edition (differences)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (`output: export`) | Static export — no Node server |
| Data fetching | Client-side fetch (browser) | Direct CoinGecko calls from the browser |
| API key storage | `localStorage` | No server to set cookies |
| Database | None | localStorage for client cache only |
| Hosting | GitHub Pages | Free static hosting via GitHub Actions |

---

## Project Structure

```
coinvibetrackerr/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard — top 100 coins
│   │   ├── coin/[id]/page.tsx    # Coin detail page
│   │   ├── actions.ts            # Server actions (Full Edition only)
│   │   └── layout.tsx            # Root layout — NavBar + Footer
│   ├── components/
│   │   ├── CoinTable.tsx         # Main price table with client-side polling
│   │   ├── CoinChart.tsx         # TradingView chart wrapper
│   │   ├── CoinHeader.tsx        # Coin name, price, 24h change
│   │   ├── CoinStats.tsx         # Market cap, supply, ATH/ATL
│   │   ├── CoinConverter.tsx     # USD ↔ crypto unit converter
│   │   ├── CoinNews.tsx          # Latest news feed
│   │   ├── CoinCommunity.tsx     # Social links
│   │   ├── CoinAbout.tsx         # Coin description
│   │   ├── MarketSummary.tsx     # Global market stats bar
│   │   ├── SearchBar.tsx         # Client-side coin search
│   │   ├── ApiKeyModal.tsx       # CoinGecko API key settings dialog
│   │   ├── NavBar.tsx            # Top navigation
│   │   └── Footer.tsx            # Documentation, resources, legal
│   ├── lib/
│   │   ├── api/
│   │   │   ├── coingecko.ts      # Server-side CoinGecko client (Full Edition)
│   │   │   ├── coingecko-client.ts  # Browser-safe CoinGecko client (Lightweight)
│   │   │   ├── binance.ts        # Binance spot price + klines fallback
│   │   │   ├── news.ts           # News aggregation
│   │   │   ├── cache.ts          # In-memory TTL cache
│   │   │   ├── rateLimiter.ts    # Token bucket rate limiter
│   │   │   └── errors.ts         # Typed API errors
│   │   └── db/
│   │       ├── client.ts         # Supabase client (Full Edition only)
│   │       └── queries.ts        # coin_cache + coin_detail_cache queries
│   └── types/
│       └── coin.ts               # Shared TypeScript types
├── docs/
│   ├── agents/                   # Agent task briefs (how the app was built)
│   └── VIBE_CODING.md            # Guide to contributing with Claude Code
├── Containerfile                 # Multi-stage Podman/Docker build (Full Edition)
├── podman-run.sh                 # Build + run helper script
└── .env.example                  # Environment variable template (Full Edition)
```

---

## Database Schema (Full Edition)

**`coin_cache`** — top-100 list snapshots
```sql
id          text primary key   -- coin id (e.g. "bitcoin")
symbol      text
name        text
data        jsonb              -- full Coin object
fetched_at  timestamptz
```

**`coin_detail_cache`** — individual coin detail snapshots
```sql
id          text primary key   -- coin id
data        jsonb              -- full CoinDetail object
updated_at  timestamptz
```

Both tables are written fire-and-forget on every successful API response and read as a fallback when CoinGecko is unavailable.

---

## Development

```bash
npm run dev      # start dev server at :3000
npm run build    # production build
npm run lint     # ESLint
npm test         # Vitest unit tests
```

Tests live in `src/lib/api/__tests__/`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests welcome on both branches.

If you use Claude Code or another AI assistant, read [docs/VIBE_CODING.md](docs/VIBE_CODING.md) — every feature in this repo has a corresponding agent brief in `docs/agents/` that you can use as a starting point.

---

## Roadmap

- [x] CoinGecko API client with rate limiting and TTL cache
- [x] Dashboard: top 100 coins table with 30 s polling
- [x] Coin detail page with chart, stats, converter, news, community
- [x] Search and filter
- [x] CoinGecko API key settings panel (runtime, no redeploy)
- [x] Offline fallback: Supabase stale cache + Binance spot price (Full Edition)
- [x] Persistent client-side localStorage cache
- [x] Podman container + GitHub Actions CI
- [x] Footer with documentation, resources, and legal
- [x] Lightweight Edition for GitHub Pages (`pages` branch)
- [ ] Watchlist (localStorage or Supabase, no auth required)
- [ ] DeFiLlama integration (TVL, protocol data)
- [ ] Price alerts (browser notifications)
- [ ] Portfolio tracker

---

## License

MIT — see [LICENSE](LICENSE).

> Data provided by [CoinGecko](https://www.coingecko.com) and [Binance](https://www.binance.com).
> Prices are for informational purposes only and do not constitute financial advice.
