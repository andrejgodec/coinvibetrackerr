# Agent: Frontend — Coin Detail Page + Chart

## Goal

Build the `/coin/[id]` detail page: price chart, stats panel, and coin metadata.

## Prerequisites

- API client: `getCoinDetail`, `getCoinHistory` implemented
- Dashboard page complete (reuse components where possible)

## Page: `src/app/coin/[id]/page.tsx`

Server component. Fetches `getCoinDetail(id)` and initial chart data (`getCoinHistory(id, 7)`) server-side.

### Layout (top to bottom)

1. **Header strip**: coin image, name, symbol, current price, 24h badge
2. **Chart** (full width): OHLCV candlestick or line chart
3. **Range selector**: `1D | 7D | 30D | 1Y` tabs — switches chart data (client fetch on tab click)
4. **Stats grid** (2-col on desktop, 1-col mobile):
   - Market cap + rank
   - 24h volume
   - Circulating supply
   - ATH + ATL with dates
5. **About section**: coin description (markdown rendered), homepage link, Twitter, GitHub

### Chart Component (`src/components/CoinChart.tsx`)

Use `lightweight-charts` (TradingView library) for the candlestick chart.
- Dark theme matching site
- Crosshair tooltip showing OHLCV values
- Line chart fallback if OHLCV not available (history API returns prices only for some coins)
- Loading skeleton while fetching range change

### Range Switching

Client component wrapping the chart. On tab click:
1. Show skeleton overlay on chart
2. Fetch new range via Server Action
3. Replace chart data

### `generateStaticParams`

Pre-render top 100 coin pages at build time:
```typescript
export async function generateStaticParams() {
  const coins = await getTopCoins(100, 1)
  return coins.map(c => ({ id: c.id }))
}
```

Revalidate every 5 minutes (`export const revalidate = 300`).

## Acceptance Criteria

- `/coin/bitcoin` loads without error
- Chart renders with correct OHLCV data for default 7D range
- Range tabs switch chart data without full page reload
- All stat values display with correct formatting (currency, large numbers abbreviated: 1.2B, 4.5T)
- Description truncates at 300 chars with "Read more" expand
- Back button (breadcrumb) returns to dashboard
- Page is statically generated for top 100, dynamic for the rest
