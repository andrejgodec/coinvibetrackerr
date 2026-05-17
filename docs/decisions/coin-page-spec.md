# Coin Detail Page Spec

> Research basis: training knowledge through August 2025 of CoinGecko, CoinMarketCap, and CoinCodex
> Bitcoin pages. These are stable, heavily-documented products — section names, data fields,
> and layout patterns are high-confidence. Premium-gated or ad-only features are flagged.
> Free news API options are sourced from public documentation.

---

## 1. Competitor Comparison Table

| Site | Top sections (top → bottom) | Chart type | Time ranges | News feed | Unique standout |
|---|---|---|---|---|---|
| **CoinGecko** | Header+price → Chart → Market stats → Converter → Markets (exchanges) → Historical data table → About+links → Community data → Developer data | Line (default) + Candlestick toggle | 1D 7D 1M 3M 1Y MAX | No feed; links to external news | Trust Score on exchanges; on-chain data panel; converter widget |
| **CoinMarketCap** | Header+price → Chart → Key stats sidebar → Market pairs → Historical data | Line (default) + Candlestick toggle | 1D 7D 1M 3M 1Y YTD ALL | News tab (crypto news aggregation) | Fear & Greed Index widget; "Watchlist" prominence; CMC rank badge |
| **CoinCodex** | Header+price → Price prediction banner → Chart → Price statistics → Exchanges | Line | 1W 1M 3M 6M 1Y | No | Price prediction widget (AI-labeled); short/long-term signals |

---

## 2. Site-by-Site Feature Breakdown

### 2.1 CoinGecko — bitcoin page

**Price section**
- Large current price (USD default, currency switcher in nav)
- 24h % change badge (green/red)
- 24h high / 24h low
- ATH with date and % below ATH
- ATL with date and % above ATL
- Market cap + market cap rank (#1)
- Fully diluted valuation (FDV) = max_supply × price
- 24h trading volume
- Circulating supply / total supply / max supply with a visual progress bar (circulating vs max)
- Volume / Market cap ratio

**Chart**
- Recharts-style line chart, toggles to candlestick
- Time ranges: 24H, 7D, 1M, 3M, 1Y, MAX
- Volume bars overlaid at bottom (separate axis)
- No moving averages on free tier; log scale toggle
- Currency selector (BTC, ETH, USD, EUR, …)

**Converter widget**
- Enter amount in USD → shows BTC equivalent (and vice versa)
- Inline, no account required

**Markets (exchange) section**
- Table: Exchange name, pair, price, spread, 24h volume, volume %, Trust Score badge
- Paginated; typically 10-20 rows visible
- Links to exchange listing

**Historical data table**
- Date | Open | High | Low | Close | Volume | Market Cap
- Paginated by day, last 365 days

**About section**
- Long HTML description (Wikipedia-style)
- Tags / categories (e.g., "Layer 1", "Proof of Work", "Store of Value")
- Links: Website, Whitepaper, GitHub, Twitter, Reddit, Telegram, Explorer(s)
- Genesis date / launch date
- Contract address (for ERC-20 tokens)

**Community data**
- Twitter followers, Reddit subscribers, Reddit posts/comments 48h
- Telegram members (if available)
- Shown as plain numbers, no sentiment analysis

**Developer data**
- GitHub stars, forks, watchers, issues, pull requests, commits (4 weeks / 1 year)
- Only on detail page, not on list page

**What to skip**
- Exchange Trust Score panel (requires CoinGecko's proprietary scoring logic)
- "Earn" / staking yield widget (premium partner data)
- Price alerts (requires account)
- Portfolio tracker integration (requires account)

---

### 2.2 CoinMarketCap — bitcoin page

**Price section**
- Large price, 24h % change
- Price range bar (24h low ↔ 24h high, dot showing current price)
- 52-week low / 52-week high (same bar style)
- Market cap + rank badge
- 24h volume (with % change vs yesterday)
- FDV
- Circulating / total / max supply
- Dominance % (BTC's share of total crypto market cap)
- Market cap / FDV ratio

**Chart**
- Line default, candlestick toggle
- Volume bars in sub-panel
- Zoom ranges: 1D, 7D, 1M, 3M, 1Y, YTD, ALL
- No technical indicators on free tier

**News tab**
- Aggregated crypto news articles (title, source, timestamp, thumbnail)
- 10-20 articles, scrollable
- Sources: CoinDesk, CryptoPotato, Decrypt, etc.
- This is a tab alongside the chart, not a separate page section

**Market pairs section**
- Exchange | Pair | Price | +2% Depth | -2% Depth | Volume | Volume % | Liquidity score
- More data than CoinGecko (depth data is distinctive)

**About section**
- Description (shorter than CoinGecko)
- Links: Website, Explorer, Whitepaper, Source Code
- Tags

**Unique features**
- Fear & Greed Index sidebar widget (market-wide sentiment, 0-100)
- CMC rank badge is more prominent than CoinGecko
- "Add to Watchlist" is front-and-center (requires account)
- Conversion tool (same concept as CoinGecko converter)
- "Similar coins" carousel at bottom

**What to skip**
- Fear & Greed data requires CMC proprietary index (no free API equivalent)
- Market depth data (+2% / -2%) not available on CoinGecko free tier
- CMC Gravity (prediction metric) — proprietary, premium
- Price alerts, portfolio — account-gated

---

### 2.3 CoinCodex — bitcoin page

**Price section**
- Current price, 24h % change
- Low/High for 24h and 52-week
- Market cap, volume, circulating supply — basic set, no FDV
- Less data density than CoinGecko or CMC

**Chart**
- Line chart only (no candlestick on free view)
- Time ranges: 1W, 1M, 3M, 6M, 1Y (no 24H range)
- No volume overlay

**Price prediction banner**
- AI-labeled short/long term signal ("Bullish" / "Bearish" / "Neutral")
- 30-day price prediction with a range
- Positioned prominently above or near the chart
- Likely draws clicks but is not reliable; skip

**Price statistics table**
- Current price, 24h change, 7d change, 30d change, YTD change
- ATH / ATL with dates
- Relatively clean, similar to what we already have in CoinStats

**What to skip**
- Price prediction widget (unreliable, attracts low-quality traffic expectations)
- No real unique data advantage over CoinGecko
- No news, no community data, no developer data

---

## 3. Recommended MVP Feature Set (ranked by user value)

Rank is based on: user value delivered vs implementation cost, feasibility on CoinGecko free API.

| Rank | Feature | Rationale |
|---|---|---|
| 1 | **Price header** — price, 24h %, 7d %, 30d %, market cap, volume, rank | Core info every user expects; already partially built |
| 2 | **Interactive chart** — line + candlestick toggle, time ranges 1D/7D/1M/3M/1Y/MAX, volume bars | The chart is the primary reason users visit coin pages |
| 3 | **Price range bars** — 24h low/high bar with current price dot; 52-week low/high bar | CoinMarketCap's clearest UX win; quick visual context |
| 4 | **Market stats panel** — FDV, circulating/total/max supply with progress bar, vol/mcap ratio | Fills the sidebar; all data is in the CoinGecko detail endpoint |
| 5 | **ATH/ATL block** — ATH price+date+% below, ATL price+date+% above | Users check this constantly to assess entry points |
| 6 | **Currency converter widget** — enter USD or coin amount, swap | Low effort, high UX value; no API call needed (just math) |
| 7 | **About section** — description (stripped HTML), categories/tags, links (website/whitepaper/github/twitter/reddit) | Users want context without leaving the page |
| 8 | **News feed** — 5-10 recent articles from a free news API | Differentiator vs CoinGecko's lack of inline news; adds session depth |
| 9 | **Community stats** — Twitter followers, Reddit subscribers | Already in CoinGecko response; two numbers, low effort |
| 10 | **Developer stats** — GitHub stars, forks, commits 4w | Niche but useful for technical users; in CoinGecko response |

**Not in MVP (skip entirely):**
- Exchange market pairs table (complex, adds little for casual users)
- Historical data table (paginated OHLCV table — chart is better)
- Price predictions (unreliable, misleads users)
- Liquidity / market depth (not available free)
- Fear & Greed Index (proprietary, no free equivalent)

---

## 4. Section-by-Section Layout Spec (top to bottom)

### Section 1: Coin Header (exists — `CoinHeader.tsx`)

Extend to include:

```
[Logo 48px] [Name] [Symbol badge] [Market cap rank badge #1]
[Price large] [24h % badge] [7d % badge] [30d % badge]
[Price range bar: 24h low ─●─ 24h high]
[Price range bar: 52w low ─────●── 52w high]
```

- Price range bars are the key addition. The dot position = (current - low) / (high - low) × 100%.
- 52-week range requires `market_data.high_52_weeks` and `market_data.low_52_weeks` — see API fields section.

---

### Section 2: Chart (exists — `ChartSection.tsx` / `CoinChart.tsx`)

Extend to include:

```
[Time range tabs: 1D | 7D | 1M | 3M | 1Y | MAX]   [Line | Candle toggle]
[Price chart — full width]
[Volume bars — sub-panel below chart, ~20% height]
```

- Candlestick uses `/coins/{id}/ohlc` endpoint (already in `getCoinHistory` or similar).
- Volume bars use `total_volumes` from `/coins/{id}/market_chart`.
- For 1D, use Binance klines (1h interval, 24 candles) for better granularity.

---

### Section 3: Market Stats (exists — `CoinStats.tsx`)

Current stats + add:

```
Market Cap          $1.32T     (#1)
Fully Diluted Val   $1.42T
24h Volume          $28.5B
Vol / Market Cap    0.021
Circulating Supply  19.7M BTC  [████████████░░] 93.8% of max
Total Supply        21M BTC
Max Supply          21M BTC
```

- FDV = `market_data.fully_diluted_valuation.usd` (CoinGecko computes it; field exists)
- Supply progress bar: `circulating_supply / max_supply × 100`

---

### Section 4: ATH / ATL Block (new — add below or inside `CoinStats.tsx`)

```
All-Time High    $73,738    -8.5%    Mar 14, 2024
All-Time Low     $67.81     +99,388%  Jul 6, 2013
```

- Compact 2-row table. Already have all fields from existing `CoinStats`.
- Confirm it's visible and not buried.

---

### Section 5: Currency Converter (new — small inline widget)

```
[  1       ] BTC  ⇄  [  $67,420  ] USD
```

- Pure client-side math: `usd_amount = btc_amount × current_price`
- No API call. Just two controlled inputs with cross-update.
- Fits in the stats sidebar column.

---

### Section 6: News Feed (new — `CoinNews.tsx`)

```
[Article thumbnail] [Title]                    [Source] [2h ago]
[Article thumbnail] [Title]                    [Source] [4h ago]
... (5-8 articles)
[View more →]
```

- Tabbed alongside or below chart on desktop; stacked on mobile.
- See Section 6 for free API options.

---

### Section 7: About (exists — `CoinAbout.tsx`)

Extend to include:

```
[Description — first 3 sentences, expandable]

Categories:  [Layer 1]  [Proof of Work]  [Store of Value]

Links:  [🌐 Website]  [📄 Whitepaper]  [💻 GitHub]  [𝕏 Twitter]  [Reddit]

Genesis Date:  January 3, 2009
```

- Strip HTML tags from `description.en` before rendering.
- Categories from `categories` array.
- Links from `links.*` fields.

---

### Section 8: Community & Developer Stats (new — optional panel)

```
Community                 Developer
Twitter    1.2M follows   GitHub Stars   74,000
Reddit     5.8M members   Forks          36,000
                          Commits (4w)   142
```

- Requires `community_data=true` and `developer_data=true` in the `/coins/{id}` request.
- Low API cost (same endpoint, two extra query params).
- Place at the bottom — interesting but not critical-path.

---

## 5. CoinGecko API Fields Needed Per Section

All fields are from `GET /coins/{id}` unless noted.

### Section 1: Coin Header

| Field path | Used for |
|---|---|
| `name` | Display name |
| `symbol` | Ticker badge |
| `image.large` | Logo |
| `market_cap_rank` | Rank badge |
| `market_data.current_price.usd` | Price |
| `market_data.price_change_percentage_24h` | 24h % badge |
| `market_data.price_change_percentage_7d` | 7d % badge |
| `market_data.price_change_percentage_30d` | 30d % badge |
| `market_data.high_24h.usd` | 24h high (range bar) |
| `market_data.low_24h.usd` | 24h low (range bar) |
| `market_data.ath.usd` | 52-week bar (proxy: use ATH as upper bound if 52w not available) |
| `market_data.atl.usd` | 52-week bar lower bound |

Note: CoinGecko does not expose a `high_52_weeks` / `low_52_weeks` field on the free tier.
52-week range must be computed from `market_chart` data (`days=365`, extract min/max of `prices`).
For MVP, use `atl` and `ath` as the outer bounds of the 52-week bar — this is a reasonable approximation and requires no extra API call.

### Section 2: Chart

| Endpoint | Params | Fields used |
|---|---|---|
| `GET /coins/{id}/ohlc` | `vs_currency=usd&days=7` (or 1/30/90/365/max) | `[timestamp, open, high, low, close]` array |
| `GET /coins/{id}/market_chart` | `vs_currency=usd&days=7` | `prices[]`, `total_volumes[]` |
| `GET https://api.binance.com/api/v3/klines` | `symbol=BTCUSDT&interval=1h&limit=24` | `[0]=open_time, [1]=open, [2]=high, [3]=low, [4]=close, [5]=volume` |

### Section 3: Market Stats

| Field path | Used for |
|---|---|
| `market_data.market_cap.usd` | Market cap |
| `market_data.fully_diluted_valuation.usd` | FDV |
| `market_data.total_volume.usd` | 24h volume |
| `market_data.circulating_supply` | Circulating supply + progress bar |
| `market_data.total_supply` | Total supply |
| `market_data.max_supply` | Max supply + progress bar denominator |

Vol/MarketCap ratio: `total_volume.usd / market_cap.usd` — computed client-side.

### Section 4: ATH / ATL

| Field path | Used for |
|---|---|
| `market_data.ath.usd` | ATH price |
| `market_data.ath_change_percentage.usd` | % below ATH |
| `market_data.ath_date.usd` | ATH date |
| `market_data.atl.usd` | ATL price |
| `market_data.atl_change_percentage.usd` | % above ATL |
| `market_data.atl_date.usd` | ATL date |

### Section 5: Converter

| Field path | Used for |
|---|---|
| `market_data.current_price.usd` | Conversion rate (no API call during interaction) |

### Section 6: News Feed

No CoinGecko field. Separate API — see Section 6 below.

### Section 7: About

| Field path | Used for |
|---|---|
| `description.en` | Description text (strip HTML tags) |
| `categories` | Category tags array |
| `links.homepage[0]` | Website URL |
| `links.whitepaper` | Whitepaper URL |
| `links.repos_url.github[0]` | GitHub URL |
| `links.twitter_screen_name` | Twitter handle → `https://twitter.com/{handle}` |
| `links.subreddit_url` | Reddit URL |
| `genesis_date` | Launch date |

### Section 8: Community & Developer Stats

Requires adding `community_data=true&developer_data=true` to the existing `/coins/{id}` call.

| Field path | Used for |
|---|---|
| `community_data.twitter_followers` | Twitter followers count |
| `community_data.reddit_subscribers` | Reddit subscribers count |
| `community_data.reddit_average_posts_48h` | Reddit activity |
| `community_data.reddit_average_comments_48h` | Reddit activity |
| `developer_data.stars` | GitHub stars |
| `developer_data.forks` | GitHub forks |
| `developer_data.commit_count_4_weeks` | Recent commit activity |
| `developer_data.pull_request_contributors` | Contributor count |

---

## 6. Free News API Options

### Option A: CryptoPanic (recommended)

- **URL:** `https://cryptopanic.com/api/v1/posts/`
- **Free tier:** 1,000 requests/day, no credit card
- **Auth:** API key in query param (`?auth_token=YOUR_KEY`)
- **Coin filter:** `?currencies=BTC` — filters to Bitcoin news
- **Response fields:** `results[].title`, `results[].url`, `results[].source.title`, `results[].published_at`, `results[].currencies[].code`
- **Content types:** `?kind=news` (news articles), `?kind=media` (videos/podcasts)
- **Quality:** Aggregates from CoinDesk, Decrypt, CoinTelegraph, Blockworks, The Block and ~200 other sources
- **Latency:** Typically 5-15 min behind live
- **Verdict:** Best free option. Filter by `currencies=BTC` or coin symbol to get coin-specific news.

Full example:
```
GET https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_KEY&currencies=BTC&kind=news&public=true
```

### Option B: Messari News

- **URL:** `https://data.messari.io/api/v1/news/{asset-slug}`
- **Free tier:** 20 req/min, ~1,000/day — no key required for basic endpoints
- **Response fields:** `data[].title`, `data[].url`, `data[].published_at`, `data[].author.name`
- **Coverage:** Curated, higher editorial quality than CryptoPanic but fewer articles
- **Coin filter:** Built into endpoint path (`/news/bitcoin`)
- **Verdict:** Good quality, lower volume. Works without a key. Use as fallback if CryptoPanic is rate-limited.

Full example:
```
GET https://data.messari.io/api/v1/news/bitcoin
```

### Option C: CoinGecko Status Updates (not real news)

CoinGecko's `/coins/{id}/status_updates` endpoint returns project-published announcements, not editorial news. Too sparse and low-quality for a news feed. Skip.

### Option D: NewsAPI.org (general news, not crypto-specific)

- **Free tier:** 100 requests/day, developer key required
- Query: `q=bitcoin&sortBy=publishedAt`
- Source quality is inconsistent — surfaces mainstream finance outlets but misses crypto-native sources
- **Verdict:** Use only if CryptoPanic and Messari both fail. Lower crypto signal, harder to filter noise.

### Recommended Implementation

1. Primary: CryptoPanic (`currencies=BTC&kind=news&public=true`)
2. Fallback: Messari (`/api/v1/news/bitcoin`)
3. Cache response for 15 minutes (news does not change by the second)
4. Show 5-8 articles max on the coin page; link to source with `target="_blank"`
5. Strip UTM params from URLs before display (CryptoPanic appends tracking)

---

## 7. What Competitors Do That Is Not Worth Copying

| Feature | Site | Reason to skip |
|---|---|---|
| Exchange market pairs table | CoinGecko, CMC | Complex, requires exchange data; low value for casual users |
| Market depth (+2% / -2%) | CMC | Not available on CoinGecko free tier |
| Trust Score on exchanges | CoinGecko | Proprietary scoring, no open equivalent |
| Fear & Greed Index | CMC | CMC proprietary index, no free equivalent |
| Price predictions / AI signals | CoinCodex | Unreliable; damages user trust when wrong |
| Staking yield / Earn widget | CoinGecko | Partner commercial content |
| Portfolio tracker | All | Requires auth, out of scope |
| Price alerts | All | Requires auth + push infrastructure |
| Historical OHLCV table | CoinGecko | Chart is better UX; table adds no insight |
| Similar coins carousel | CMC | Low signal, high noise for most users |
| CMC/CoinGecko rank badge prominence | Both | Our page doesn't need to market CMC/CG brand |
