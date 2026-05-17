export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  volume24h: number
  priceChange24h: number
  priceChangePercent24h: number
  circulatingSupply: number
  lastUpdated: string
}

export interface OHLCVPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CoinDetail extends Coin {
  description: string
  homepage: string
  twitterHandle: string
  githubUrl: string
  ath: number
  atl: number
  athDate: string
  atlDate: string
  categories: string[]
  // Extended fields
  priceChange7d: number
  priceChange30d: number
  high24h: number
  low24h: number
  fullyDilutedValuation: number | null
  totalSupply: number | null
  maxSupply: number | null
  redditUrl: string
  whitepaperUrl: string
  genesisDate: string | null
  // community data
  twitterFollowers: number | null
  redditSubscribers: number | null
  // developer data
  githubStars: number | null
  githubForks: number | null
  githubCommits4w: number | null
  // set when data is served from stale cache rather than live API
  _stale?: true
}

export interface CoinSearchResult {
  id: string
  name: string
  symbol: string
  marketCapRank: number | null
  thumb: string
}

export interface NewsArticle {
  title: string
  url: string
  source: string
  publishedAt: string
}
