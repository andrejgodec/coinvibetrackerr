import type { Coin, CoinDetail, OHLCVPoint, CoinSearchResult } from '@/types/coin'

const BASE = 'https://api.coingecko.com/api/v3'

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('cgk')
  } catch {
    return null
  }
}

function buildHeaders(): HeadersInit {
  const key = getApiKey()
  return key ? { 'x-cg-demo-api-key': key } : {}
}

async function cgFetch(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: buildHeaders() })
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${path}`)
  return res.json()
}

function mapCoin(raw: Record<string, unknown>): Coin {
  const priceChangePercent24h = (raw.price_change_percentage_24h as number | null) ?? 0
  const currentPrice = raw.current_price as number
  return {
    id: raw.id as string,
    symbol: raw.symbol as string,
    name: raw.name as string,
    image: raw.image as string,
    currentPrice,
    marketCap: raw.market_cap as number,
    marketCapRank: raw.market_cap_rank as number,
    volume24h: raw.total_volume as number,
    priceChangePercent24h,
    priceChange24h: currentPrice * (priceChangePercent24h / 100),
    circulatingSupply: (raw.circulating_supply as number | null) ?? 0,
    lastUpdated: raw.last_updated as string,
  }
}

export async function clientGetTopCoins(limit = 100, page = 1): Promise<Coin[]> {
  const path = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`
  const raw = await cgFetch(path)
  return (raw as Record<string, unknown>[]).map(mapCoin)
}

export async function clientGetCoinDetail(id: string): Promise<CoinDetail> {
  const path = `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`
  const raw = await cgFetch(path) as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any
  const md = r.market_data ?? {}
  const priceChangePercent24h = md.price_change_percentage_24h ?? 0
  return {
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
}

export async function clientGetCoinHistory(id: string, days: number): Promise<OHLCVPoint[]> {
  const path = `/coins/${id}/ohlc?vs_currency=usd&days=${days}`
  const raw = await cgFetch(path) as number[][]
  return raw.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
    volume: 0,
  }))
}

export async function clientSearchCoins(query: string): Promise<CoinSearchResult[]> {
  const path = `/search?query=${encodeURIComponent(query)}`
  const raw = await cgFetch(path) as { coins: Record<string, unknown>[] }
  return raw.coins.map(c => ({
    id: c.id as string,
    name: c.name as string,
    symbol: c.symbol as string,
    marketCapRank: c.market_cap_rank as number | null,
    thumb: c.thumb as string,
  }))
}
