import { z } from 'zod'
import { cookies } from 'next/headers'
import type { Coin, CoinDetail, OHLCVPoint, CoinSearchResult } from '@/types/coin'
import { TTLCache } from './cache'
import { RateLimiter } from './rateLimiter'
import { ApiValidationError, ApiRateLimitError, CoinNotFoundError } from './errors'
import { getKlines, getSpotPrice } from './binance'
import { upsertCoinCache, upsertCoinDetail, getCachedCoin } from '@/lib/db/queries'

const BASE = 'https://api.coingecko.com/api/v3'
const limiter = new RateLimiter(40, 60_000)
const topCoinsCache = new TTLCache<Coin[]>()
const detailCache = new TTLCache<CoinDetail>()
const historyCache = new TTLCache<OHLCVPoint[]>()
const searchCache = new TTLCache<CoinSearchResult[]>()

async function headers(): Promise<HeadersInit> {
  const envKey = process.env.COINGECKO_API_KEY
  if (envKey) return { 'x-cg-demo-api-key': envKey }
  try {
    const store = await cookies()
    const cookieKey = store.get('cgk')?.value
    if (cookieKey) return { 'x-cg-demo-api-key': cookieKey }
  } catch {
    // Outside request context (generateStaticParams) — no cookie available
  }
  return {}
}

async function cgFetch(path: string, coinId?: string): Promise<unknown> {
  await limiter.acquire()
  const res = await fetch(`${BASE}${path}`, { headers: await headers() })
  if (res.status === 429) throw new ApiRateLimitError('coingecko')
  if (res.status === 404 && coinId) throw new CoinNotFoundError(coinId)
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${path}`)
  return res.json()
}

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

function mapCoin(raw: z.infer<typeof CoinMarketSchema>): Coin {
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

// Loose schema — only validate the fields we actually use
const CoinDetailResponseSchema = z.object({
  id: z.string(),
  market_data: z.any(),
})

const OHLCRowSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
])

const SearchResponseSchema = z.object({
  coins: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      symbol: z.string(),
      market_cap_rank: z.number().nullable(),
      thumb: z.string(),
    })
  ),
})

const BINANCE_MAP: Record<string, string> = {
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  binancecoin: 'BNBUSDT',
  solana: 'SOLUSDT',
  ripple: 'XRPUSDT',
  cardano: 'ADAUSDT',
  avalanche: 'AVAXUSDT',
  dogecoin: 'DOGEUSDT',
  polkadot: 'DOTUSDT',
  chainlink: 'LINKUSDT',
  litecoin: 'LTCUSDT',
  'shiba-inu': 'SHIBUSDT',
  uniswap: 'UNIUSDT',
  polygon: 'MATICUSDT',
  tron: 'TRXUSDT',
}

function coinIdToBinanceSymbol(id: string): string | null {
  return BINANCE_MAP[id] ?? null
}

async function fetchCoinGeckoOHLC(id: string, days: number): Promise<OHLCVPoint[]> {
  const path = `/coins/${id}/ohlc?vs_currency=usd&days=${days}`
  const raw = await cgFetch(path)

  const parsed = z.array(OHLCRowSchema).safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new ApiValidationError(`/coins/${id}/ohlc`, issue.path.join('.'), raw)
  }

  return parsed.data.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
    volume: 0,
  }))
}

async function getBinanceKlines(symbol: string): Promise<OHLCVPoint[]> {
  // 96 x 15m candles = 24 hours of intraday data
  return getKlines(symbol, '15m', 96)
}

export async function getTopCoins(limit: number, page: number): Promise<Coin[]> {
  const cacheKey = `top-${limit}-${page}`
  const cached = topCoinsCache.get(cacheKey)
  if (cached) return cached

  const path = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`
  const raw = await cgFetch(path)

  const parsed = z.array(CoinMarketSchema).safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new ApiValidationError('/coins/markets', issue.path.join('.'), raw)
  }

  const data = parsed.data.map(mapCoin)
  topCoinsCache.set(cacheKey, data, 60)
  void upsertCoinCache(data).catch(() => {})
  return data
}

async function fetchCoinDetailFromApi(id: string): Promise<CoinDetail> {
  const path = `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`
  const raw = await cgFetch(path, id)

  const parsed = CoinDetailResponseSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new ApiValidationError(`/coins/${id}`, issue.path.join('.'), raw)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any
  const md = r.market_data ?? {}
  const priceChangePercent24h = md.price_change_percentage_24h ?? 0

  const data: CoinDetail = {
    id: r.id,
    symbol: r.symbol ?? '',
    name: r.name ?? '',
    image: r.image?.large ?? '',
    currentPrice: md.current_price?.usd ?? 0,
    marketCap: md.market_cap?.usd ?? 0,
    marketCapRank: r.market_cap_rank ?? 0,
    volume24h: md.total_volume?.usd ?? 0,
    priceChange24h: md.price_change_24h ?? 0,
    priceChangePercent24h,
    priceChange7d: md.price_change_percentage_7d ?? 0,
    priceChange30d: md.price_change_percentage_30d ?? 0,
    circulatingSupply: md.circulating_supply ?? 0,
    totalSupply: md.total_supply ?? null,
    maxSupply: md.max_supply ?? null,
    fullyDilutedValuation: md.fully_diluted_valuation?.usd ?? null,
    high24h: md.high_24h?.usd ?? 0,
    low24h: md.low_24h?.usd ?? 0,
    lastUpdated: md.last_updated ?? '',
    description: r.description?.en ?? '',
    homepage: r.links?.homepage?.[0] ?? '',
    whitepaperUrl: r.links?.whitepaper ?? '',
    twitterHandle: r.links?.twitter_screen_name ?? '',
    githubUrl: r.links?.repos_url?.github?.[0] ?? '',
    redditUrl: r.links?.subreddit_url ?? '',
    genesisDate: r.genesis_date ?? null,
    categories: r.categories ?? [],
    ath: md.ath?.usd ?? 0,
    atl: md.atl?.usd ?? 0,
    athDate: md.ath_date?.usd ?? '',
    atlDate: md.atl_date?.usd ?? '',
    twitterFollowers: r.community_data?.twitter_followers ?? null,
    redditSubscribers: r.community_data?.reddit_subscribers ?? null,
    githubStars: r.developer_data?.stars ?? null,
    githubForks: r.developer_data?.forks ?? null,
    githubCommits4w: r.developer_data?.commit_count_4_weeks ?? null,
  }

  void upsertCoinDetail(data).catch(() => {})
  return data
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  const cacheKey = `detail-${id}`
  const cached = detailCache.get(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchCoinDetailFromApi(id)
    detailCache.set(cacheKey, data, 300)
    return data
  } catch (err) {
    if (err instanceof CoinNotFoundError) throw err

    const stale = await getCachedCoin(id)
    if (stale) {
      const binanceSymbol = coinIdToBinanceSymbol(id)
      if (binanceSymbol) {
        const livePrice = await getSpotPrice(binanceSymbol)
        if (livePrice) stale.currentPrice = livePrice
      }
      stale._stale = true
      return stale
    }

    throw err
  }
}

export async function getCoinHistory(id: string, days: 1 | 7 | 30 | 365): Promise<OHLCVPoint[]> {
  const cacheKey = `history-${id}-${days}`
  const cached = historyCache.get(cacheKey)
  if (cached) return cached

  let data: OHLCVPoint[]

  if (days === 1) {
    const binanceSymbol = coinIdToBinanceSymbol(id)
    if (binanceSymbol) {
      try {
        data = await getBinanceKlines(binanceSymbol)
      } catch {
        data = await fetchCoinGeckoOHLC(id, 1)
      }
    } else {
      data = await fetchCoinGeckoOHLC(id, 1)
    }
  } else {
    data = await fetchCoinGeckoOHLC(id, days)
  }

  historyCache.set(cacheKey, data, 300)
  return data
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const cacheKey = `search-${query}`
  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  const path = `/search?query=${encodeURIComponent(query)}`
  const raw = await cgFetch(path)

  const parsed = SearchResponseSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new ApiValidationError('/search', issue.path.join('.'), raw)
  }

  const data: CoinSearchResult[] = parsed.data.coins.map(c => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    marketCapRank: c.market_cap_rank,
    thumb: c.thumb,
  }))

  searchCache.set(cacheKey, data, 3600)
  return data
}
