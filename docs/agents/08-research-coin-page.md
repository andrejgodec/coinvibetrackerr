# Agent: Research — Competitor Coin Detail Pages

## Goal

Browse real competitor coin detail pages and document exactly what sections, data points, and UI patterns they show. Output a spec doc that drives Agent 09 implementation.

## Sites to Visit (bitcoin as test coin)

1. CoinGecko — https://www.coingecko.com/en/coins/bitcoin
2. CoinMarketCap — https://coinmarketcap.com/currencies/bitcoin/
3. CoinCodex — https://coincodex.com/crypto/bitcoin/

## Deliverable

`docs/decisions/coin-page-spec.md` — structured spec of what to build, derived from competitor research.

## Sections to Document Per Site

For each site capture:
- Page layout order (top to bottom)
- Data points shown (price, market cap, supply, etc.)
- Chart type and range options
- News / social feed presence
- Links section (website, whitepaper, socials)
- Any unique features worth copying
- Any features to skip (ads, premium gates, clutter)

## Output Format

`docs/decisions/coin-page-spec.md` with:
1. Competitor comparison table
2. Recommended feature set for our coin page (MVP)
3. Section-by-section layout spec
4. Data fields to fetch from CoinGecko API
