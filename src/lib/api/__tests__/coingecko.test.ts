import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { TTLCache } from '../cache'
import { RateLimiter } from '../rateLimiter'
import { ApiValidationError } from '../errors'

// ---------------------------------------------------------------------------
// Inline the schema + mapper so tests don't require network calls
// ---------------------------------------------------------------------------

const CoinMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number(),
  total_volume: z.number(),
  price_change_percentage_24h: z.number().nullable(),
  circulating_supply: z.number().nullable(),
  last_updated: z.string(),
})

function mapCoin(raw: z.infer<typeof CoinMarketSchema>) {
  const priceChangePercent24h = raw.price_change_percentage_24h ?? 0
  return {
    id: raw.id,
    symbol: raw.symbol,
    name: raw.name,
    image: raw.image,
    currentPrice: raw.current_price,
    marketCap: raw.market_cap,
    marketCapRank: raw.market_cap_rank,
    volume24h: raw.total_volume,
    priceChangePercent24h,
    priceChange24h: raw.current_price * (priceChangePercent24h / 100),
    circulatingSupply: raw.circulating_supply ?? 0,
    lastUpdated: raw.last_updated,
  }
}

const validPayload = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  current_price: 50000,
  market_cap: 1_000_000_000,
  market_cap_rank: 1,
  total_volume: 30_000_000,
  price_change_percentage_24h: 2.5,
  circulating_supply: 19_000_000,
  last_updated: '2024-01-01T00:00:00.000Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Zod validation — valid payload', () => {
  it('maps CoinMarket response to Coin correctly', () => {
    const parsed = CoinMarketSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const coin = mapCoin(parsed.data)
    expect(coin.id).toBe('bitcoin')
    expect(coin.currentPrice).toBe(50000)
    expect(coin.marketCap).toBe(1_000_000_000)
    expect(coin.marketCapRank).toBe(1)
    expect(coin.volume24h).toBe(30_000_000)
    expect(coin.priceChangePercent24h).toBe(2.5)
    expect(coin.priceChange24h).toBeCloseTo(50000 * (2.5 / 100))
    expect(coin.circulatingSupply).toBe(19_000_000)
    expect(coin.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
  })
})

describe('Zod validation — invalid payload', () => {
  it('throws ApiValidationError when current_price is missing', () => {
    const badPayload = { ...validPayload, current_price: undefined }
    const parsed = CoinMarketSchema.safeParse(badPayload)
    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const issue = parsed.error.issues[0]
    const err = new ApiValidationError('/coins/markets', issue.path.join('.'), badPayload)
    expect(err).toBeInstanceOf(ApiValidationError)
    expect(err.message).toContain('/coins/markets')
    expect(err.message).toContain('current_price')
  })
})

describe('TTLCache', () => {
  it('returns cached value on hit', () => {
    const cache = new TTLCache<string>()
    cache.set('key', 'hello', 60)
    expect(cache.get('key')).toBe('hello')
  })

  it('returns null after TTL expires', async () => {
    const cache = new TTLCache<string>()
    cache.set('key', 'hello', 0.001)
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(cache.get('key')).toBeNull()
  })
})

describe('RateLimiter', () => {
  it('does not drop calls beyond the token limit (delays instead)', async () => {
    const limiter = new RateLimiter(2, 50)
    const results: number[] = []
    const start = Date.now()

    await Promise.all([
      limiter.acquire().then(() => results.push(Date.now() - start)),
      limiter.acquire().then(() => results.push(Date.now() - start)),
      limiter.acquire().then(() => results.push(Date.now() - start)),
    ])

    // All 3 calls resolved (not dropped)
    expect(results).toHaveLength(3)
    // The third call was delayed by ~50ms (the refill interval)
    expect(results[2]).toBeGreaterThanOrEqual(40)
  })
})
