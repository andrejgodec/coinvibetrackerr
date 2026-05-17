import { getCoinDetail, getCoinHistory, getTopCoins } from '@/lib/api/coingecko'
import { getCoinNews } from '@/lib/api/news'
import { CoinNotFoundError, ApiRateLimitError } from '@/lib/api/errors'
import { CoinHeader } from '@/components/CoinHeader'
import { ChartSection } from '@/components/ChartSection'
import { CoinStats } from '@/components/CoinStats'
import { CoinAbout } from '@/components/CoinAbout'
import { CoinNews } from '@/components/CoinNews'
import { CoinCommunity } from '@/components/CoinCommunity'
import { CoinConverter } from '@/components/CoinConverter'
import type { CoinDetail, NewsArticle, OHLCVPoint } from '@/types/coin'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const coins = await getTopCoins(100, 1)
    return coins.map(c => ({ id: c.id }))
  } catch {
    return []
  }
}

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let coin: CoinDetail | undefined
  let initialHistory: OHLCVPoint[] = []
  let news: NewsArticle[] = []

  try {
    coin = await getCoinDetail(id)
  } catch (err) {
    if (err instanceof CoinNotFoundError) notFound()
    if (err instanceof ApiRateLimitError) {
      return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-zinc-200 font-medium">Rate limit reached</p>
            <p className="text-zinc-400 text-sm">CoinGecko API limit hit. Wait a moment and refresh.</p>
            <p className="text-zinc-500 text-xs">Add a COINGECKO_API_KEY env var to increase limits.</p>
          </div>
        </main>
      )
    }
    throw err
  }

  ;[initialHistory, news] = await Promise.allSettled([
    getCoinHistory(id, 7),
    getCoinNews(coin.symbol),
  ]).then(([histResult, newsResult]) => [
    histResult.status === 'fulfilled' ? histResult.value : [],
    newsResult.status === 'fulfilled' ? newsResult.value : [],
  ] as [OHLCVPoint[], NewsArticle[]])

  if (!coin) notFound()

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          &larr; Back to markets
        </Link>

        {coin._stale && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
            Showing cached data — CoinGecko API unavailable. Prices may be outdated.
          </div>
        )}

        <CoinHeader coin={coin} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ChartSection coinId={coin.id} initialData={initialHistory} />
            <CoinNews articles={news} />
            <CoinAbout coin={coin} />
            <CoinCommunity coin={coin} />
          </div>

          <div className="space-y-4">
            <CoinStats coin={coin} />
            <CoinConverter coinSymbol={coin.symbol} priceUsd={coin.currentPrice} />
          </div>
        </div>
      </div>
    </main>
  )
}
