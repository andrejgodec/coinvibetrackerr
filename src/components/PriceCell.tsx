'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/format'

interface PriceCellProps {
  value: number
  prevValue: number | null
  prefix?: string
}

type FlashState = 'up' | 'down' | null

export function PriceCell({ value, prevValue, prefix }: PriceCellProps) {
  const [flash, setFlash] = useState<FlashState>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevValue === null || value === prevValue) return

    const direction: FlashState = value > prevValue ? 'up' : 'down'
    setFlash(direction)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setFlash(null)
    }, 800)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, prevValue])

  const flashClass =
    flash === 'up'
      ? 'text-emerald-400 bg-emerald-400/10 price-flash-up'
      : flash === 'down'
        ? 'text-red-400 bg-red-400/10 price-flash-down'
        : 'text-zinc-100'

  const formatted = `${prefix ?? ''}${formatPrice(value)}`

  return (
    <span className={`rounded px-1 tabular-nums transition-colors duration-100 ${flashClass}`}>
      {formatted}
    </span>
  )
}
