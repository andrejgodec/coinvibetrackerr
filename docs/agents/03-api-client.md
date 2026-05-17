# Agent: API Client + Data Pipeline

## Goal

Implement the CoinGecko API client with rate limiting, response caching, Zod validation, and typed output. CoinCodex scraper fallback is a stretch goal within this agent.

## Prerequisites

- `docs/decisions/data-sources.md` exists (exact endpoints and response shapes)
- Project scaffold complete (`npm run build` passes)

## Implementation Tasks

### 1. CoinGecko Client (`src/lib/api/coingecko.ts`)

Implement these functions:

```typescript
// List of top N coins by market cap with price, volume, market cap, 24h change
getTopCoins(limit: number, page: number): Promise<Coin[]>

// Single coin full details: description, links, market data
getCoinDetail(id: string): Promise<CoinDetail>

// OHLCV for chart: days = 1 | 7 | 30 | 365
getCoinHistory(id: string, days: 1 | 7 | 30 | 365): Promise<OHLCVPoint[]>

// Search coins by query string
searchCoins(query: string): Promise<CoinSearchResult[]>
```

Requirements:
- Rate limiter: max 40 req/min (buffer under 50 free limit)
- All responses validated with Zod schemas before returning
- Failed Zod parse throws a typed `ApiValidationError`, not a generic Error
- 60s in-memory cache for `getTopCoins`, 5min for `getCoinDetail`, 10min for `getCoinHistory`
- `COINGECKO_API_KEY` env var used as `x-cg-demo-api-key` header when present

### 2. Types (`src/types/coin.ts`)

```typescript
interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  volume24h: number
  priceChange24h: number
  priceChangePercent24h: number
  circulatingSupply: number
  lastUpdated: string
}

interface OHLCVPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CoinDetail extends Coin {
  description: string
  homepage: string
  twitterHandle: string
  githubUrl: string
  ath: number
  atl: number
}
```

### 3. CoinCodex Scraper — Fallback (`src/lib/scraper/coincodex.ts`)

Implement only `getTopCoins(limit: number)` as a Playwright-based fallback.
- Triggered only when CoinGecko throws a rate-limit error (429)
- Returns same `Coin[]` shape — caller doesn't know it's scraped
- Respects `robots.txt` — abort if `/markets` is disallowed
- Runs headless Chromium, parses the coin table, maps to `Coin` type

### 4. Tests

Write unit tests (Jest or Vitest) for:
- Zod schema validation (valid and invalid payloads)
- Rate limiter: 41st call within 1 minute is delayed, not dropped
- Cache: second call within TTL returns cached result without fetch

## Acceptance Criteria

- `getTopCoins(100, 1)` returns 100 typed coins without error in dev
- Invalid API response throws `ApiValidationError` with field path
- 100 coins refresh every 30s stays under free rate limit
- All unit tests pass
