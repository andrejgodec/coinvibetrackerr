# Agent: Data Source Research

## Goal

Evaluate all viable data sources for cryptocurrency tracking and produce a ranked recommendation with concrete integration specs. This agent outputs a decision doc — no code is written.

## Deliverable

`docs/decisions/data-sources.md` containing:
1. Ranked list of APIs/scrapers with rate limits, cost, and data coverage
2. Recommended primary + fallback strategy
3. Exact API endpoints for: coin list, price ticker, OHLCV history, coin metadata
4. Sample response shapes (trimmed) for each chosen endpoint
5. Rate limit management strategy (caching TTLs per endpoint)

## Research Tasks

### APIs to Evaluate

| Source | URL | Free Tier |
|--------|-----|-----------|
| CoinGecko | https://api.coingecko.com/api/v3 | 50 req/min, no key needed |
| CryptoCompare | https://min-api.cryptocompare.com | 100K calls/month free |
| CoinMarketCap | https://coinmarketcap.com/api | 333 calls/day free |
| Binance | https://api.binance.com/api/v3 | No key, high limits |
| Messari | https://messari.io/api | 20 req/min free |

### Scraping Targets (fallback only)

- CoinCodex (https://coincodex.com) — structure the scraper to match CoinGecko's response shape
- CoinMarketCap public pages — last resort

### Questions to Answer

1. Which API covers the most coins with free tier?
2. What is the minimum polling interval to stay within free limits for 100 coins?
3. Does CoinGecko free tier require an API key? What headers?
4. What OHLCV granularity is available for free (hourly? daily?)?
5. Does CoinCodex block headless browsers? What selectors hold price data?

## Acceptance Criteria

- Recommended strategy survives 100 coin dashboard at 30s refresh without hitting paid tiers
- All endpoints confirmed live (not just documented)
- Scraper fallback scoped to read-only price history only
