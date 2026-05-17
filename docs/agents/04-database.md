# Agent: Database Schema + Supabase Setup

## Goal

Create the Supabase schema, migrations, and typed query helpers for: coin cache, watchlist, and API response caching.

## Prerequisites

- Supabase project created (user action required — provide `SUPABASE_URL` and keys)
- Project scaffold complete

## Tables to Create

### `coin_cache`
Stores the last fetched top-coins snapshot. Avoids re-fetching on every page load.

```sql
create table coin_cache (
  id          text primary key,        -- coingecko id
  symbol      text not null,
  name        text not null,
  data        jsonb not null,           -- full Coin object
  fetched_at  timestamptz not null default now()
);

create index on coin_cache (fetched_at desc);
```

### `watchlist`
Per-user (or per-device via fingerprint for anonymous) saved coins.

```sql
create table watchlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,            -- anon device id or auth uid
  coin_id     text not null,
  added_at    timestamptz not null default now(),
  unique (user_id, coin_id)
);
```

### `ohlcv_cache`
Cached chart data keyed by coin + range.

```sql
create table ohlcv_cache (
  coin_id     text not null,
  range_days  int not null,
  data        jsonb not null,
  fetched_at  timestamptz not null default now(),
  primary key (coin_id, range_days)
);
```

## Query Helpers (`src/lib/db/`)

```typescript
// coin_cache
getCachedCoins(maxAgeSeconds: number): Promise<Coin[] | null>
upsertCoinCache(coins: Coin[]): Promise<void>

// watchlist
getWatchlist(userId: string): Promise<string[]>   // returns coin ids
addToWatchlist(userId: string, coinId: string): Promise<void>
removeFromWatchlist(userId: string, coinId: string): Promise<void>

// ohlcv_cache
getCachedOHLCV(coinId: string, days: number, maxAgeSeconds: number): Promise<OHLCVPoint[] | null>
upsertOHLCV(coinId: string, days: number, data: OHLCVPoint[]): Promise<void>
```

## Row-Level Security

Enable RLS on `watchlist`:
- Users can only read/write their own rows (`user_id = auth.uid()` or a device token claim)
- `coin_cache` and `ohlcv_cache` are public read, server-write only

## Acceptance Criteria

- Migration SQL runs cleanly via `supabase db push`
- All helper functions typed and return correct shapes
- RLS policies tested: cross-user read blocked, own-user read passes
- `getCachedCoins(60)` returns null when cache is older than 60 seconds
