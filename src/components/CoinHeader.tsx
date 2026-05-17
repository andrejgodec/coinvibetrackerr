'use client'
import Image from 'next/image'
import type { CoinDetail } from '@/types/coin'
import { formatPrice } from '@/lib/format'

function PctBadge({ value, label }: { value: number; label: string }) {
  const positive = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
        positive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
      }`}
    >
      {positive ? '▲' : '▼'} {positive ? '+' : ''}
      {value.toFixed(2)}% {label}
    </span>
  )
}

function RangeBar({
  low,
  high,
  current,
  label,
}: {
  low: number
  high: number
  current: number
  label: string
}) {
  const pct = high > low ? ((current - low) / (high - low)) * 100 : 50
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 shrink-0 text-right text-zinc-400">{label}</span>
      <span className="shrink-0 text-zinc-300">{formatPrice(low)}</span>
      <div className="relative h-1.5 w-32 shrink-0 rounded-full bg-zinc-700">
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-zinc-100 shadow"
          style={{ left: `calc(${Math.min(Math.max(pct, 0), 100)}% - 6px)` }}
        />
      </div>
      <span className="shrink-0 text-zinc-300">{formatPrice(high)}</span>
    </div>
  )
}

export function CoinHeader({ coin }: { coin: CoinDetail }) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Name + rank row */}
      <div className="flex items-center gap-3">
        <Image
          src={coin.image}
          alt={coin.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-100">{coin.name}</h1>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
              #{coin.marketCapRank}
            </span>
          </div>
          <span className="text-sm uppercase text-zinc-400">{coin.symbol}</span>
        </div>
      </div>

      {/* Price + changes row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-zinc-100">
          {formatPrice(coin.currentPrice)}
        </span>
        <PctBadge value={coin.priceChangePercent24h} label="24h" />
        <PctBadge value={coin.priceChange7d} label="7d" />
        <PctBadge value={coin.priceChange30d} label="30d" />
      </div>

      {/* Range bars */}
      <div className="flex flex-col gap-2">
        <RangeBar
          low={coin.low24h}
          high={coin.high24h}
          current={coin.currentPrice}
          label="24h Range"
        />
        <RangeBar
          low={coin.atl}
          high={coin.ath}
          current={coin.currentPrice}
          label="ATH Range"
        />
      </div>
    </div>
  )
}
