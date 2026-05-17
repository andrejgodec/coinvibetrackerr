'use client'

import { useState, useEffect } from 'react'
import type { Coin } from '@/types/coin'
import { formatLargeNumber } from '@/lib/format'

interface MarketSummaryProps {
  coins: Coin[]
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-900 px-4 py-3 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-lg font-semibold tabular-nums text-zinc-100">{value}</span>
    </div>
  )
}

const COINS_CACHE_KEY = 'cvt_coins_cache'

function loadFromCache(): Coin[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COINS_CACHE_KEY)
    if (!raw) return []
    const { coins } = JSON.parse(raw) as { coins: Coin[]; cachedAt: number }
    return coins
  } catch {
    return []
  }
}

export function MarketSummary({ coins: propCoins }: MarketSummaryProps) {
  const [localCoins, setLocalCoins] = useState<Coin[]>(loadFromCache)

  useEffect(() => {
    if (propCoins.length > 0) return

    function onCoinsUpdated(e: Event) {
      const fresh = (e as CustomEvent<Coin[]>).detail
      if (Array.isArray(fresh)) setLocalCoins(fresh)
    }
    window.addEventListener('cvt:coins-updated', onCoinsUpdated)
    return () => window.removeEventListener('cvt:coins-updated', onCoinsUpdated)
  }, [propCoins.length])

  const coins = propCoins.length > 0 ? propCoins : localCoins

  const totalMarketCap = coins.reduce((sum, c) => sum + c.marketCap, 0)
  const totalVolume = coins.reduce((sum, c) => sum + c.volume24h, 0)
  const bitcoin = coins.find(c => c.id === 'bitcoin')
  const btcDominance =
    bitcoin && totalMarketCap > 0
      ? ((bitcoin.marketCap / totalMarketCap) * 100).toFixed(1)
      : '—'

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total Market Cap" value={totalMarketCap > 0 ? formatLargeNumber(totalMarketCap) : '—'} />
      <StatCard label="24h Volume" value={totalVolume > 0 ? formatLargeNumber(totalVolume) : '—'} />
      <StatCard label="BTC Dominance" value={btcDominance !== '—' ? `${btcDominance}%` : '—'} />
      <StatCard label="Coins Tracked" value={coins.length > 0 ? String(coins.length) : '—'} />
    </div>
  )
}
