-- coin_cache: stores the last fetched top-coins snapshot
create table if not exists coin_cache (
  id          text primary key,
  symbol      text not null,
  name        text not null,
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

create index if not exists coin_cache_fetched_at_idx on coin_cache (fetched_at desc);

-- watchlist: per-user saved coins (anon device id or auth uid)
create table if not exists watchlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  coin_id     text not null,
  added_at    timestamptz not null default now(),
  unique (user_id, coin_id)
);

-- ohlcv_cache: cached chart data keyed by coin + range
create table if not exists ohlcv_cache (
  coin_id     text not null,
  range_days  int not null,
  data        jsonb not null,
  fetched_at  timestamptz not null default now(),
  primary key (coin_id, range_days)
);

-- RLS: enable on watchlist only
alter table watchlist enable row level security;

-- Policy: users can only read their own watchlist rows
create policy "watchlist_user_select" on watchlist
  for select using (user_id = auth.uid()::text or user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: users can only insert their own watchlist rows
create policy "watchlist_user_insert" on watchlist
  for insert with check (user_id = auth.uid()::text or user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: users can only delete their own watchlist rows
create policy "watchlist_user_delete" on watchlist
  for delete using (user_id = auth.uid()::text or user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- coin_cache and ohlcv_cache: public read, no RLS (server writes via service role key)
