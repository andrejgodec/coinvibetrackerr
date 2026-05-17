'use client'
import { useState } from 'react'
import type { OHLCVPoint } from '@/types/coin'
import { CoinChart } from '@/components/CoinChart'
import { clientGetCoinHistory } from '@/lib/api/coingecko-client'

const RANGES = [
  { label: '1D', value: 1 },
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '1Y', value: 365 },
] as const

type Range = 1 | 7 | 30 | 365

export function ChartSection({
  coinId,
  initialData,
}: {
  coinId: string
  initialData: OHLCVPoint[]
}) {
  const [range, setRange] = useState<Range>(7)
  const [data, setData] = useState<OHLCVPoint[]>(initialData)
  const [loading, setLoading] = useState(false)

  async function handleRangeChange(newRange: Range) {
    if (newRange === range) return
    setLoading(true)
    try {
      const result = await clientGetCoinHistory(coinId, newRange)
      setData(result)
      setRange(newRange)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-1">
        {RANGES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleRangeChange(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              range === value
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <CoinChart data={data} loading={loading} />
    </div>
  )
}
