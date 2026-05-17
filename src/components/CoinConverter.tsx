'use client'
import { useState } from 'react'

export function CoinConverter({
  coinSymbol,
  priceUsd,
}: {
  coinSymbol: string
  priceUsd: number
}) {
  const [coinAmount, setCoinAmount] = useState('1')
  const [usdAmount, setUsdAmount] = useState(priceUsd.toFixed(2))

  const onCoinChange = (v: string) => {
    setCoinAmount(v)
    const n = parseFloat(v)
    if (!isNaN(n)) setUsdAmount((n * priceUsd).toFixed(2))
  }

  const onUsdChange = (v: string) => {
    setUsdAmount(v)
    const n = parseFloat(v)
    if (!isNaN(n) && priceUsd > 0) setCoinAmount((n / priceUsd).toFixed(8))
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Converter</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={coinAmount}
          onChange={e => onCoinChange(e.target.value)}
          className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <span className="shrink-0 text-sm font-medium text-zinc-300">
          {coinSymbol.toUpperCase()}
        </span>
        <span className="shrink-0 text-zinc-500">&#8644;</span>
        <input
          type="number"
          value={usdAmount}
          onChange={e => onUsdChange(e.target.value)}
          className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <span className="shrink-0 text-sm font-medium text-zinc-300">USD</span>
      </div>
    </div>
  )
}
