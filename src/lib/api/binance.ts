import { z } from 'zod'
import type { OHLCVPoint } from '@/types/coin'
import { TTLCache } from './cache'
import { ApiValidationError } from './errors'

const BASE = 'https://api.binance.com/api/v3'
const cache = new TTLCache<OHLCVPoint[]>()

const KlineSchema = z.tuple([
  z.number(),  // open_time
  z.string(),  // open
  z.string(),  // high
  z.string(),  // low
  z.string(),  // close
  z.string(),  // base volume
  z.number(),  // close_time
  z.string(),  // quote volume
  z.number(),  // trades
  z.string(),  // taker buy base
  z.string(),  // taker buy quote
  z.string(),  // ignore
])

export async function getSpotPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/ticker/price?symbol=${symbol}`)
    if (!res.ok) return null
    const { price } = await res.json() as { price: string }
    return parseFloat(price)
  } catch {
    return null
  }
}

export async function getKlines(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d',
  limit: number
): Promise<OHLCVPoint[]> {
  const cacheKey = `${symbol}-${interval}-${limit}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const url = `${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance ${res.status}`)
  const raw = await res.json()

  const parsed = z.array(KlineSchema).safeParse(raw)
  if (!parsed.success) {
    throw new ApiValidationError('/klines', parsed.error.issues[0].path.join('.'), raw)
  }

  const data: OHLCVPoint[] = parsed.data.map(k => ({
    timestamp: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[7]),
  }))

  cache.set(cacheKey, data, 60)
  return data
}
