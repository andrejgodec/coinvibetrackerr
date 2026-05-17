'use client'
import type { CoinDetail } from '@/types/coin'
import { formatLargeNumber, formatPrice } from '@/lib/format'

function formatDate(dateString: string): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function pctFromAth(current: number, ath: number): string {
  if (ath === 0) return '—'
  const pct = ((current - ath) / ath) * 100
  return `${pct.toFixed(1)}%`
}

function pctFromAtl(current: number, atl: number): string {
  if (atl === 0) return '—'
  const pct = ((current - atl) / atl) * 100
  return `+${pct.toFixed(0)}%`
}

function SupplyBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-700">
      <div
        className="h-1.5 rounded-full bg-emerald-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function CoinStats({ coin }: { coin: CoinDetail }) {
  const volMktCap =
    coin.marketCap > 0 ? (coin.volume24h / coin.marketCap).toFixed(4) : '—'

  const supplyPct =
    coin.maxSupply && coin.circulatingSupply
      ? `${((coin.circulatingSupply / coin.maxSupply) * 100).toFixed(1)}% of max`
      : null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Statistics
      </h2>
      <dl className="space-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">Market Cap</dt>
          <dd className="text-sm font-medium text-zinc-100">
            {formatLargeNumber(coin.marketCap)}{' '}
            <span className="text-zinc-500">(#{coin.marketCapRank})</span>
          </dd>
        </div>

        {coin.fullyDilutedValuation !== null && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-zinc-500">Fully Diluted Val.</dt>
            <dd className="text-sm font-medium text-zinc-100">
              {formatLargeNumber(coin.fullyDilutedValuation)}
            </dd>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">24h Volume</dt>
          <dd className="text-sm font-medium text-zinc-100">
            {formatLargeNumber(coin.volume24h)}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">Vol / Mkt Cap</dt>
          <dd className="text-sm font-medium text-zinc-100">{volMktCap}</dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">Circulating Supply</dt>
          <dd className="text-sm font-medium text-zinc-100">
            {formatLargeNumber(coin.circulatingSupply).replace('$', '')}{' '}
            {coin.symbol.toUpperCase()}
          </dd>
          {supplyPct && coin.maxSupply && (
            <>
              <SupplyBar value={coin.circulatingSupply} max={coin.maxSupply} />
              <span className="mt-0.5 text-xs text-zinc-500">{supplyPct}</span>
            </>
          )}
        </div>

        {coin.totalSupply !== null && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-zinc-500">Total Supply</dt>
            <dd className="text-sm font-medium text-zinc-100">
              {formatLargeNumber(coin.totalSupply).replace('$', '')}{' '}
              {coin.symbol.toUpperCase()}
            </dd>
          </div>
        )}

        {coin.maxSupply !== null && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-zinc-500">Max Supply</dt>
            <dd className="text-sm font-medium text-zinc-100">
              {formatLargeNumber(coin.maxSupply).replace('$', '')}{' '}
              {coin.symbol.toUpperCase()}
            </dd>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">All-Time High</dt>
          <dd className="text-sm font-medium text-zinc-100">
            {formatPrice(coin.ath)}{' '}
            <span className="text-red-400">{pctFromAth(coin.currentPrice, coin.ath)}</span>
          </dd>
          <dd className="text-xs text-zinc-500">{formatDate(coin.athDate)}</dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-zinc-500">All-Time Low</dt>
          <dd className="text-sm font-medium text-zinc-100">
            {formatPrice(coin.atl)}{' '}
            <span className="text-emerald-400">{pctFromAtl(coin.currentPrice, coin.atl)}</span>
          </dd>
          <dd className="text-xs text-zinc-500">{formatDate(coin.atlDate)}</dd>
        </div>
      </dl>
    </div>
  )
}
