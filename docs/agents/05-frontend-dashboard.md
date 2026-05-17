# Agent: Frontend — Dashboard + Coin Table

## Goal

Build the main dashboard page: a sortable, searchable table of top 100 coins with live price updates, and a global search bar.

## Prerequisites

- API client working (`getTopCoins`, `searchCoins`)
- shadcn/ui initialized
- Tailwind configured

## Pages + Components

### `src/app/page.tsx` — Dashboard

Server component. Fetches top 100 coins via `getTopCoins(100, 1)` on the server. Passes data to client components. No client-side fetching on initial load.

Auto-refreshes: client-side polling every 30s via `setInterval` + React state update.

### Components to Build

#### `CoinTable` (`src/components/CoinTable.tsx`)
Client component.

Columns:
| # | Coin | Price | 24h % | Market Cap | Volume 24h | Action |
|---|------|-------|--------|------------|------------|--------|

- Click column header → sort asc/desc
- Price and % change colored: green if positive, red if negative
- Coin row links to `/coin/[id]`
- "Add to watchlist" star icon in Action column (toggles)
- Virtualized if list > 50 rows (use `@tanstack/react-virtual`)

#### `PriceCell` (`src/components/PriceCell.tsx`)
Shows price with flash animation (green/red) when value changes.
- Accepts `value: number` and `prevValue: number | null`
- Flashes for 800ms then returns to neutral

#### `SearchBar` (`src/components/SearchBar.tsx`)
- Debounced input (300ms)
- Calls `searchCoins(query)` server action
- Dropdown results list: coin image + name + symbol, links to detail page
- Keyboard nav: arrow keys + enter

#### `MarketSummary` (`src/components/MarketSummary.tsx`)
Top of page. Shows:
- Total market cap
- 24h volume
- BTC dominance
- Number of coins tracked

### Styling Rules

- Dark mode first (no light mode toggle needed yet)
- Font: system-ui or Geist
- Coin images: 24×24px, rounded
- Mobile: table collapses to show only coin, price, 24h% on small screens

## Acceptance Criteria

- Dashboard loads top 100 coins in under 2s (LCP)
- Sorting by any column works correctly
- Search returns results within 500ms of typing stop
- Table refreshes price data every 30s without full page reload
- Watchlist toggle persists across refresh (localStorage for now)
- Zero layout shift on price update flash
- Lighthouse performance score ≥ 80 on mobile
