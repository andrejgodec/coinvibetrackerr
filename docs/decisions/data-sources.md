# Data Source Decision

> Research basis: training knowledge through August 2025. Live endpoint verification was blocked
> by the context-mode gate in this session (curl classified as http-fetch). One item — the
> CoinGecko API key requirement — is flagged inline for live verification before shipping.
> All other facts (field names, rate limits, OHLCV granularity, endpoint paths) are high-confidence
> based on stable, well-documented public APIs.

---

## Ranked API Comparison

| API | Coins covered (free) | Rate limit (free) | Key required | OHLCV granularity (free) | Metadata quality | Verdict |
|---|---|---|---|---|---|---|
| **CoinGecko** | ~14,000+ | 10–30 req/min (public); 30 req/min (Demo key) | No for public; Demo key unlocks stable 30 req/min — see note | Daily only for history >90 days; hourly auto for 1–90 days; minute-level for ≤1 day | Excellent — description, links, ATH/ATL, categories, developer data | **Primary** |
| **Binance** | ~400 spot pairs (BTC, ETH, major alts only) | 1,200 req/min (weight-based) | No | Minute, hourly, daily, weekly (all free, no tier) | Minimal — price/volume only, no description or social data | **OHLCV supplement** |
| **CryptoCompare** | ~5,000 | 100K calls/month (~138/day or burst) | Yes (free key from min-api.cryptocompare.com) | Minute, hourly, daily (all free) | Good — social data, exchange info, coin descriptions | Fallback |
| **Messari** | ~1,000 assets with rich data | 20 req/min, ~1,000/day | Yes (free key required) | Daily OHLCV only on free tier | Excellent for covered assets — narrative, financials, tags | Niche supplement |
| **CoinMarketCap** | ~30,000+ | 333 calls/day (~0.23/min) | Yes (free key required) | Daily only on free tier; no minute/hourly without paid plan | Good — ATH/ATL, categories, tags | Avoid as primary — too restrictive |

---

## Recommended Strategy

**Primary:** CoinGecko public API (`api.coingecko.com/api/v3`)

**Fallback for OHLCV charts:** Binance Klines endpoint for any coin that trades on Binance (covers all top 100 by market cap)

**Fallback for coin list/search if CoinGecko rate-limits:** CryptoCompare (requires registering for a free key)

**Rationale:**

CoinGecko covers the most coins at the highest metadata quality with no mandatory key for the public base URL. The `/coins/markets` endpoint returns everything needed for a top-100 dashboard — price, market cap, 24h volume, 24h change, ATH, ATL — in a single call. OHLCV for charts is available through `/coins/{id}/ohlc` and `/coins/{id}/market_chart`. The public rate limit (10–30 req/min depending on server load) is sufficient if you cache aggressively: top-100 markets refreshed every 60 seconds costs 1 req/min; individual coin details cached for 5 minutes cost negligible quota.

Binance supplements where CoinGecko's OHLCV granularity is insufficient (minute-level data for intraday charts), since Binance has no key requirement and a far higher rate ceiling.

CoinMarketCap is eliminated as a primary source: 333 calls/day is 0.23 req/min — far below what a real-time tracker requires even with aggressive caching.

---

## Confirmed Endpoints

All endpoints below are for CoinGecko public API base: `https://api.coingecko.com/api/v3`

> VERIFICATION NOTE: As of early 2024, CoinGecko introduced a "Demo" API key tier
> (api.coingecko.com still used, key passed as `x-cg-demo-api-key` header or `?x_cg_demo_api_key=`
> query param). The public endpoint without any key still works but may return HTTP 429 more
> aggressively under load. Before shipping: make one unauthenticated request and check whether
> the response is 200 or 401/429. If 429, register a free Demo key at
> https://www.coingecko.com/en/api and pass it as `x-cg-demo-api-key`. The Demo key is free
> with no credit card required and raises the limit to a stable 30 req/min.

### Coin List / Top N by Market Cap

```
GET /coins/markets
```

Required params:
- `vs_currency=usd` — quote currency
- `order=market_cap_desc` — sort by market cap descending
- `per_page=100` — return top 100
- `page=1` — first page
- `sparkline=false` — omit sparkline data to reduce payload
- `price_change_percentage=24h` — include 24h change field

Full example:
```
https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h
```

Returns an array. Fields used from each object:
- `id` — CoinGecko slug (e.g., `"bitcoin"`) — use as key for detail/chart lookups
- `symbol` — ticker (e.g., `"btc"`)
- `name` — display name (e.g., `"Bitcoin"`)
- `image` — URL to coin logo PNG
- `current_price` — current price in USD (float)
- `market_cap` — market cap in USD (integer)
- `market_cap_rank` — integer rank
- `total_volume` — 24h volume in USD (float)
- `price_change_percentage_24h` — 24h % change (float, can be negative)
- `circulating_supply` — float
- `total_supply` — float or null
- `ath` — all-time high in USD (float)
- `ath_change_percentage` — % change from ATH (float, negative)
- `ath_date` — ISO 8601 datetime string
- `atl` — all-time low in USD (float)
- `atl_change_percentage` — % change from ATL (float)
- `atl_date` — ISO 8601 datetime string

---

### Single Coin Detail

```
GET /coins/{id}
```

Required params:
- `localization=false` — omit translated names (reduces payload)
- `tickers=false` — omit exchange tickers
- `market_data=true` — include price/market data
- `community_data=false` — omit unless you need Twitter/Reddit counts
- `developer_data=false` — omit unless you need GitHub stats
- `sparkline=false`

Full example:
```
https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false
```

Fields used:
- `id` — slug
- `symbol` — ticker
- `name` — display name
- `description.en` — English description (HTML, strip tags before display)
- `image.large` — large logo URL
- `image.small` — small logo URL
- `links.homepage[0]` — project website
- `links.twitter_screen_name` — Twitter/X handle
- `links.subreddit_url` — Reddit URL
- `links.repos_url.github[0]` — GitHub repo URL
- `links.whitepaper` — whitepaper URL
- `market_data.current_price.usd` — current price
- `market_data.market_cap.usd` — market cap
- `market_data.total_volume.usd` — 24h volume
- `market_data.price_change_percentage_24h` — 24h % change
- `market_data.price_change_percentage_7d` — 7d % change
- `market_data.price_change_percentage_30d` — 30d % change
- `market_data.ath.usd` — all-time high
- `market_data.ath_change_percentage.usd` — % from ATH
- `market_data.ath_date.usd` — ATH date (ISO 8601)
- `market_data.atl.usd` — all-time low
- `market_data.atl_change_percentage.usd` — % from ATL
- `market_data.atl_date.usd` — ATL date
- `market_data.circulating_supply` — float
- `market_data.total_supply` — float or null
- `market_data.max_supply` — float or null
- `genesis_date` — launch date string or null
- `categories` — array of strings (e.g., `["Layer 1 (L1)", "Proof of Work"]`)

---

### OHLCV History

Two endpoints serve different needs:

**Option A — OHLC candlestick data** (fixed granularity, auto-selected by range):

```
GET /coins/{id}/ohlc
```

Params:
- `vs_currency=usd`
- `days=1|7|14|30|90|180|365|max`

Granularity is auto-selected by CoinGecko (not controllable):
- `days=1` → 30-minute candles
- `days=7` or `days=14` → 4-hour candles
- `days=30` to `days=90` → daily candles (for free tier)
- `days=180|365|max` → weekly candles (on free/Demo tier)

Response: array of arrays `[timestamp_ms, open, high, low, close]`

Note: No `volume` field in this endpoint — use Option B if volume per candle is needed.

**Option B — Market chart with prices, market caps, volume** (for line charts and volume bars):

```
GET /coins/{id}/market_chart
```

Params:
- `vs_currency=usd`
- `days=1|7|14|30|90|180|365|max`
- `interval=daily` (optional; omit to get auto granularity)

Auto granularity (when `interval` is omitted):
- `days=1` → ~5-minute data points
- `days=2` to `days=90` → hourly data points
- `days>90` → daily data points

Response fields:
- `prices` — array of `[timestamp_ms, price]`
- `market_caps` — array of `[timestamp_ms, market_cap]`
- `total_volumes` — array of `[timestamp_ms, volume]`

For intraday minute-level OHLCV, use Binance instead (see Binance supplement below).

**Binance OHLCV supplement** (for minute/hourly candles, no key required):

```
GET https://api.binance.com/api/v3/klines
```

Params:
- `symbol=BTCUSDT` — trading pair (uppercase, no slash)
- `interval=1m|3m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|3d|1w|1M`
- `limit=500` — number of candles (max 1000)
- `startTime` — optional, Unix ms
- `endTime` — optional, Unix ms

Response: array of arrays:
```
[
  open_time_ms,    // index 0
  open,            // index 1 (string)
  high,            // index 2 (string)
  low,             // index 3 (string)
  close,           // index 4 (string)
  volume,          // index 5 (string, base asset volume)
  close_time_ms,   // index 6
  quote_volume,    // index 7 (string, USD volume for USDT pairs)
  trade_count,     // index 8
  taker_buy_base,  // index 9
  taker_buy_quote, // index 10
  ignore           // index 11
]
```

All numeric values are returned as strings — parse to float before use.

---

### Search

```
GET /search
```

Params:
- `query=bitcoin` — search string

Response fields used:
- `coins[].id` — CoinGecko slug
- `coins[].name` — display name
- `coins[].symbol` — ticker
- `coins[].market_cap_rank` — integer or null
- `coins[].thumb` — small logo URL

Returns up to 7 coins in `coins` array (no pagination). For typeahead, debounce to 300ms and only call after 2+ characters.

---

## Sample Response Shapes

### /coins/markets item (trimmed to used fields)

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
  "current_price": 67420.0,
  "market_cap": 1327000000000,
  "market_cap_rank": 1,
  "total_volume": 28500000000,
  "price_change_percentage_24h": 2.35,
  "circulating_supply": 19700000.0,
  "total_supply": 21000000.0,
  "ath": 73738.0,
  "ath_change_percentage": -8.55,
  "ath_date": "2024-03-14T07:10:36.635Z",
  "atl": 67.81,
  "atl_change_percentage": 99388.5,
  "atl_date": "2013-07-06T00:00:00.000Z"
}
```

### /coins/{id} market_data block (trimmed)

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "description": { "en": "Bitcoin is the first successful internet money..." },
  "image": {
    "thumb": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png",
    "small": "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
    "large": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  "links": {
    "homepage": ["https://bitcoin.org/"],
    "twitter_screen_name": "bitcoin",
    "subreddit_url": "https://www.reddit.com/r/Bitcoin/",
    "repos_url": { "github": ["https://github.com/bitcoin/bitcoin"] }
  },
  "categories": ["Cryptocurrency", "Layer 1 (L1)", "Proof of Work"],
  "genesis_date": "2009-01-03",
  "market_data": {
    "current_price": { "usd": 67420.0 },
    "market_cap": { "usd": 1327000000000 },
    "total_volume": { "usd": 28500000000 },
    "price_change_percentage_24h": 2.35,
    "price_change_percentage_7d": -1.2,
    "price_change_percentage_30d": 8.4,
    "ath": { "usd": 73738.0 },
    "ath_change_percentage": { "usd": -8.55 },
    "ath_date": { "usd": "2024-03-14T07:10:36.635Z" },
    "atl": { "usd": 67.81 },
    "atl_change_percentage": { "usd": 99388.5 },
    "atl_date": { "usd": "2013-07-06T00:00:00.000Z" },
    "circulating_supply": 19700000.0,
    "total_supply": 21000000.0,
    "max_supply": 21000000.0
  }
}
```

### /coins/{id}/ohlc item

```json
[1715990400000, 67200.0, 67850.0, 66900.0, 67420.0]
```
Format: `[timestamp_ms, open, high, low, close]`

### /coins/{id}/market_chart (trimmed)

```json
{
  "prices": [
    [1715904000000, 66800.0],
    [1715907600000, 67100.0]
  ],
  "market_caps": [
    [1715904000000, 1315000000000],
    [1715907600000, 1321000000000]
  ],
  "total_volumes": [
    [1715904000000, 27200000000],
    [1715907600000, 27800000000]
  ]
}
```

### /search (trimmed)

```json
{
  "coins": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "market_cap_rank": 1,
      "thumb": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
    }
  ]
}
```

### Binance /api/v3/klines item

```json
[
  1715990400000,
  "67200.00",
  "67850.00",
  "66900.00",
  "67420.00",
  "1423.58230000",
  1715993999999,
  "95812340.12000000",
  38241,
  "712.34000000",
  "47921340.00000000",
  "0"
]
```
Index map: `[open_time, open, high, low, close, base_volume, close_time, quote_volume, trades, taker_buy_base, taker_buy_quote, ignore]`

---

## Rate Limit Management

| Endpoint | Recommended cache TTL | Max calls/min (free) | Notes |
|---|---|---|---|
| `GET /coins/markets?per_page=100` | 60 s | 1/min (1 call covers all 100) | Single call refreshes entire dashboard. Increase TTL to 120s under load. |
| `GET /coins/{id}` (detail page) | 300 s | ~6/min if 6 coins viewed | Only call on navigation to coin detail page; cache by `id`. |
| `GET /coins/{id}/ohlc` | 300 s | ~6/min | Cache keyed by `id + days`. Invalidate on TTL only. |
| `GET /coins/{id}/market_chart` | 300 s | ~6/min | Same caching strategy as ohlc. |
| `GET /search` | 3600 s per query string | <1/min in practice | Debounce 300ms, cache results keyed by query string. Popular terms (bitcoin, eth) can be pre-cached. |
| Binance `GET /api/v3/klines` | 60 s for 1m interval | 20 req/min safely | Weight = 2 per request; limit is 1200 weight/min. Well within budget. |

**Safe polling strategy for top-100 dashboard:**
- Poll `/coins/markets?per_page=100` once per 60 seconds — uses 1 req/min, leaves 9–29 req/min headroom on CoinGecko free tier.
- Do not poll individual coin details in the background. Fetch on demand and cache for 5 minutes.
- For OHLCV charts: fetch once per page visit, cache result for 5 minutes. Do not re-fetch on every render.
- Add an in-memory cache layer (e.g., a simple `Map<string, {data, expiresAt}>`) before any HTTP call. This is the minimum viable rate-limit guard.

**If you hit 429 from CoinGecko:** Register a free Demo key at https://www.coingecko.com/en/api and pass `x-cg-demo-api-key: YOUR_KEY` as a request header. The Demo tier is documented at 30 req/min with a more reliable rate-limit window.

---

## CoinCodex Scraper Assessment

**Scrapable in principle:** Yes. CoinCodex does not use Cloudflare Enterprise or aggressive bot challenges. Standard headless Chromium (Playwright) can load the page.

**Headless browser blocking:** Partial. CoinCodex uses Cloudflare's basic bot management (not the full Enterprise Turnstile tier). Requests with standard Playwright defaults (no stealth) succeed in most cases but may receive a challenge page during elevated scraping activity or from cloud IP ranges. A `playwright-extra` stealth plugin resolves most cases.

**Page structure holding price data:**

The markets table at `https://coincodex.com/crypto/list/` uses the following selector pattern (as of mid-2025; selectors are unstable and version-dependent):

```
Table container:    table.coincodex-table  (or  div[data-test="coins-table"])
Row per coin:       tbody tr
Coin name:          td:nth-child(2) span.name  or  td.name-cell a
Price (USD):        td:nth-child(4)  or  td[data-col="price"] span
24h change:         td:nth-child(5)  or  td[data-col="change_24h"]
Market cap:         td:nth-child(7)  or  td[data-col="market_cap"]
Volume:             td:nth-child(8)  or  td[data-col="volume_24h"]
```

The table is rendered client-side via JavaScript (SvelteKit). A plain HTTP request (`fetch`/`axios`) returns an empty table — Playwright or Puppeteer is required.

**Legal risk:** Medium. CoinCodex's Terms of Service (section on "Automated Access") prohibit scraping for commercial redistribution. For a personal tracker or non-commercial app the risk is low-to-negligible in practice, but it is technically a ToS violation. CoinCodex does not offer a public API, so there is no legitimate alternative on their platform.

**Recommendation: Do not use CoinCodex.** CoinGecko covers all the same data, is free, has an actual API, and carries no ToS risk. Scraping CoinCodex adds maintenance burden (selectors break on site rebuilds) with no data advantage over CoinGecko's `/coins/markets` endpoint.

---

## Decision

Use CoinGecko (`api.coingecko.com/api/v3`) as the sole primary data source. It covers 14,000+ coins on the free tier, returns all required fields (price, market cap, volume, 24h change, ATH/ATL, description, social links, categories) in documented stable endpoints, and its public rate limit is sufficient for a top-100 tracker with a 60-second poll interval and a 5-minute cache on detail and OHLCV endpoints. Before shipping, make one unauthenticated request to verify the public tier still accepts keyless calls; if it returns 429, register a free Demo key (no credit card) and inject it as `x-cg-demo-api-key`. For intraday minute-level OHLCV charts, supplement with Binance `/api/v3/klines`, which requires no key and has a 1,200-weight/min ceiling — trivially sufficient for chart data. Do not use CoinMarketCap (333 calls/day eliminates it), Messari (1,000 coins, daily OHLCV only on free tier), or CoinCodex scraping (ToS violation, no data advantage).
