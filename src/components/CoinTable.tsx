'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Coin } from '@/types/coin'
import { PriceCell } from '@/components/PriceCell'
import { formatLargeNumber } from '@/lib/format'
import { clientGetTopCoins } from '@/lib/api/coingecko-client'

interface CoinTableProps {
  initialCoins: Coin[]
}

type SortKey = keyof Coin
type SortDir = 'asc' | 'desc'

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-zinc-600">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

const WATCHLIST_KEY = 'cvt_watchlist'
const COINS_CACHE_KEY = 'cvt_coins_cache'

interface CoinsCache {
  coins: Coin[]
  cachedAt: number
}

function loadWatchlist(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveWatchlist(set: Set<string>) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(set)))
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

type SortableColumn = {
  key: SortKey
  label: string
  mobileHidden: boolean
  className: string
}

const COLUMNS: SortableColumn[] = [
  { key: 'marketCapRank', label: '#', mobileHidden: true, className: 'w-10 text-right' },
  { key: 'name', label: 'Coin', mobileHidden: false, className: 'min-w-[140px]' },
  { key: 'currentPrice', label: 'Price', mobileHidden: false, className: 'text-right' },
  { key: 'priceChangePercent24h', label: '24h %', mobileHidden: false, className: 'text-right' },
  { key: 'marketCap', label: 'Market Cap', mobileHidden: true, className: 'text-right' },
  { key: 'volume24h', label: 'Volume 24h', mobileHidden: true, className: 'text-right' },
]

export function CoinTable({ initialCoins }: CoinTableProps) {
  const [coins, setCoins] = useState<Coin[]>(initialCoins)
  const [sortKey, setSortKey] = useState<SortKey>('marketCapRank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [isStale, setIsStale] = useState(false)

  const prevPricesRef = useRef<Map<string, number>>(new Map())
  const parentRef = useRef<HTMLDivElement>(null)

  // hydrate watchlist from localStorage after mount
  useEffect(() => {
    setWatchlist(loadWatchlist())
  }, [])

  // seed from localStorage immediately, then fetch fresh data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COINS_CACHE_KEY)
      if (raw) {
        const { coins: cached, cachedAt } = JSON.parse(raw) as CoinsCache
        setCoins(cached)
        if (Date.now() - cachedAt > 5 * 60 * 1000) setIsStale(true)
      }
    } catch {
      // corrupt cache — ignore
    }

    clientGetTopCoins()
      .then(fresh => {
        setCoins(fresh)
        setIsStale(false)
        localStorage.setItem(COINS_CACHE_KEY, JSON.stringify({ coins: fresh, cachedAt: Date.now() }))
        window.dispatchEvent(new CustomEvent('cvt:coins-updated', { detail: fresh }))
      })
      .catch(() => {})
  }, [])

  // polling
  const fetchAndUpdate = useCallback(async () => {
    try {
      const fresh = await clientGetTopCoins()
      setCoins(prev => {
        // snapshot current prices before overwriting
        const map = new Map<string, number>()
        for (const c of prev) map.set(c.id, c.currentPrice)
        prevPricesRef.current = map
        return fresh
      })
      setIsStale(false)
      localStorage.setItem(COINS_CACHE_KEY, JSON.stringify({ coins: fresh, cachedAt: Date.now() }))
      window.dispatchEvent(new CustomEvent('cvt:coins-updated', { detail: fresh }))
    } catch {
      // network error — keep stale data
    }
  }, [])

  useEffect(() => {
    const id = setInterval(fetchAndUpdate, 30_000)
    return () => clearInterval(id)
  }, [fetchAndUpdate])

  const sortedCoins = useMemo(() => {
    const copy = [...coins]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const as = String(av)
      const bs = String(bv)
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
    })
    return copy
  }, [coins, sortKey, sortDir])

  const virtualizer = useVirtualizer({
    count: sortedCoins.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleWatchlist(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveWatchlist(next)
      return next
    })
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-lg border border-zinc-800"
      style={{ height: '600px' }}
    >
      {/* header */}
      <div className="sticky top-0 z-10 bg-zinc-900">
        {isStale && (
          <div className="flex items-center gap-1.5 border-b border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs text-amber-400">
            <span className="inline-block size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            Showing cached data
          </div>
        )}
        <div className="flex items-center border-b border-zinc-800 px-4 py-2 text-xs uppercase tracking-wider text-zinc-400">
          {COLUMNS.map(col => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`flex items-center gap-1 hover:text-zinc-200 transition-colors ${col.className} ${col.mobileHidden ? 'hidden sm:flex' : 'flex'} ${col.key === 'name' ? 'flex-1' : ''}`}
            >
              {col.label}
              <SortIndicator active={sortKey === col.key} dir={sortDir} />
            </button>
          ))}
          {/* action column */}
          <div className="w-10 text-center">
            <span className="sr-only">Watchlist</span>
          </div>
        </div>
      </div>

      {/* virtual body */}
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const coin = sortedCoins[virtualRow.index]
          if (!coin) return null
          const prevPrice = prevPricesRef.current.get(coin.id) ?? null
          const inWatchlist = watchlist.has(coin.id)
          const pct = coin.priceChangePercent24h
          const pctColor = pct >= 0 ? 'text-emerald-400' : 'text-red-400'

          return (
            <div
              key={coin.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
              className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
            >
              <Link
                href={`/coin/${coin.id}`}
                className="flex h-full w-full items-center px-4 gap-0"
              >
                {/* rank — hidden on mobile */}
                <span className="hidden w-10 text-right text-sm text-zinc-500 sm:block tabular-nums">
                  {coin.marketCapRank}
                </span>

                {/* coin name + symbol */}
                <span className="flex flex-1 items-center gap-2 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coin.image}
                    alt={coin.name}
                    width={28}
                    height={28}
                    className="rounded-full flex-shrink-0"
                  />
                  <span className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-zinc-100">{coin.name}</span>
                    <span className="text-xs uppercase text-zinc-500">{coin.symbol}</span>
                  </span>
                </span>

                {/* price */}
                <span className="w-28 text-right text-sm tabular-nums">
                  <PriceCell value={coin.currentPrice} prevValue={prevPrice} />
                </span>

                {/* 24h % */}
                <span className={`w-20 text-right text-sm tabular-nums ${pctColor}`}>
                  {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                </span>

                {/* market cap — hidden on mobile */}
                <span className="hidden w-32 text-right text-sm tabular-nums text-zinc-300 sm:block">
                  {formatLargeNumber(coin.marketCap)}
                </span>

                {/* volume — hidden on mobile */}
                <span className="hidden w-32 text-right text-sm tabular-nums text-zinc-300 sm:block">
                  {formatLargeNumber(coin.volume24h)}
                </span>

                {/* star — stop propagation so link doesn't fire */}
                <span
                  className="w-10 flex justify-center"
                  onClick={e => toggleWatchlist(coin.id, e)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setWatchlist(prev => {
                        const next = new Set(prev)
                        if (next.has(coin.id)) next.delete(coin.id)
                        else next.add(coin.id)
                        saveWatchlist(next)
                        return next
                      })
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <span className={inWatchlist ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}>
                    <StarIcon filled={inWatchlist} />
                  </span>
                </span>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
