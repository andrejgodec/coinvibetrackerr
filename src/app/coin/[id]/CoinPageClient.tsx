'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientGetCoinDetail, clientGetCoinHistory } from '@/lib/api/coingecko-client'
import { CoinHeader } from '@/components/CoinHeader'
import { ChartSection } from '@/components/ChartSection'
import { CoinStats } from '@/components/CoinStats'
import { CoinAbout } from '@/components/CoinAbout'
import { CoinNews } from '@/components/CoinNews'
import { CoinCommunity } from '@/components/CoinCommunity'
import { CoinConverter } from '@/components/CoinConverter'
import type { CoinDetail, NewsArticle, OHLCVPoint } from '@/types/coin'

async function fetchCoinNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`https://data.messari.io/api/v1/news/${symbol.toLowerCase()}`)
    if (!res.ok) return []
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).slice(0, 8).map((a: any) => ({
      title: a.title ?? '',
      url: a.url ?? '',
      source: a.author?.name ?? 'Messari',
      publishedAt: a.published_at ?? '',
    }))
  } catch {
    return []
  }
}

export function CoinPageClient({ id }: { id: string }) {
  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [history, setHistory] = useState<OHLCVPoint[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [error, setError] = useState<'not-found' | 'rate-limit' | 'unknown' | null>(null)

  useEffect(() => {
    clientGetCoinDetail(id)
      .then(async detail => {
        setCoin(detail)
        const [hist, articles] = await Promise.allSettled([
          clientGetCoinHistory(id, 7),
          fetchCoinNews(detail.symbol),
        ]).then(([h, n]) => [
          h.status === 'fulfilled' ? h.value : [],
          n.status === 'fulfilled' ? n.value : [],
        ] as [OHLCVPoint[], NewsArticle[]])
        setHistory(hist)
        setNews(articles)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('404')) setError('not-found')
        else if (msg.includes('429')) setError('rate-limit')
        else setError('unknown')
      })
  }, [id])

  if (error === 'not-found') {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-200 font-medium">Coin not found</p>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← Back to markets</Link>
        </div>
      </main>
    )
  }

  if (error === 'rate-limit') {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-200 font-medium">Rate limit reached</p>
          <p className="text-zinc-400 text-sm">CoinGecko API limit hit. Wait a moment and refresh.</p>
          <p className="text-zinc-500 text-xs">Add a CoinGecko API key via the settings panel to increase limits.</p>
        </div>
      </main>
    )
  }

  if (!coin) {
    return (
      <main className="flex-1 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm">Loading…</div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          &larr; Back to markets
        </Link>

        <CoinHeader coin={coin} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ChartSection coinId={coin.id} initialData={history} />
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
