'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import type { OHLCVPoint } from '@/types/coin'

export function CoinChart({ data, loading }: { data: OHLCVPoint[]; loading: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: containerRef.current.clientWidth,
      height: 320,
    })
    chartRef.current = chart

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#34d399',
      downColor: '#f87171',
      borderUpColor: '#34d399',
      borderDownColor: '#f87171',
      wickUpColor: '#34d399',
      wickDownColor: '#f87171',
    })
    seriesRef.current = series

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return
    const candleData = data.map(p => ({
      time: Math.floor(p.timestamp / 1000) as UTCTimestamp,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }))
    seriesRef.current.setData(candleData)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  return (
    <div className="relative mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-zinc-950/80">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
