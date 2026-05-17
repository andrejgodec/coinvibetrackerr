import { supabase } from './client'
import type { Coin, CoinDetail, OHLCVPoint } from '@/types/coin'

// --- coin_cache ---

export async function getCachedCoins(maxAgeSeconds: number): Promise<Coin[] | null> {
  const cutoff = new Date(Date.now() - maxAgeSeconds * 1000).toISOString()
  const { data, error } = await supabase
    .from('coin_cache')
    .select('data, fetched_at')
    .gte('fetched_at', cutoff)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  // data.data is jsonb — Supabase returns it as parsed JS object
  return data.data as Coin[]
}

export async function upsertCoinCache(coins: Coin[]): Promise<void> {
  const { error } = await supabase
    .from('coin_cache')
    .upsert(
      coins.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        data: coin,
        fetched_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )
  if (error) throw error
}

export async function getCachedCoin(id: string): Promise<CoinDetail | null> {
  const { data } = await supabase
    .from('coin_cache')
    .select('data')
    .eq('id', id)
    .single()
  return data ? (data.data as CoinDetail) : null
}

export async function upsertCoinDetail(coin: CoinDetail): Promise<void> {
  const { error } = await supabase
    .from('coin_cache')
    .upsert(
      {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        data: coin,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  if (error) throw error
}

// --- watchlist ---

export async function getWatchlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('coin_id')
    .eq('user_id', userId)
    .order('added_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(row => row.coin_id)
}

export async function addToWatchlist(userId: string, coinId: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist')
    .upsert({ user_id: userId, coin_id: coinId }, { onConflict: 'user_id,coin_id' })
  if (error) throw error
}

export async function removeFromWatchlist(userId: string, coinId: string): Promise<void> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('coin_id', coinId)
  if (error) throw error
}

// --- ohlcv_cache ---

export async function getCachedOHLCV(
  coinId: string,
  days: number,
  maxAgeSeconds: number
): Promise<OHLCVPoint[] | null> {
  const cutoff = new Date(Date.now() - maxAgeSeconds * 1000).toISOString()
  const { data, error } = await supabase
    .from('ohlcv_cache')
    .select('data, fetched_at')
    .eq('coin_id', coinId)
    .eq('range_days', days)
    .gte('fetched_at', cutoff)
    .maybeSingle()

  if (error || !data) return null
  return data.data as OHLCVPoint[]
}

export async function upsertOHLCV(
  coinId: string,
  days: number,
  data: OHLCVPoint[]
): Promise<void> {
  const { error } = await supabase
    .from('ohlcv_cache')
    .upsert(
      { coin_id: coinId, range_days: days, data, fetched_at: new Date().toISOString() },
      { onConflict: 'coin_id,range_days' }
    )
  if (error) throw error
}
