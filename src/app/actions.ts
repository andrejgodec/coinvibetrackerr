'use server'

import { cookies } from 'next/headers'
import { getTopCoins, getCoinHistory, searchCoins } from '@/lib/api/coingecko'
import type { Coin, OHLCVPoint, CoinSearchResult } from '@/types/coin'

export async function fetchTopCoinsAction(): Promise<Coin[]> {
  return getTopCoins(100, 1)
}

export async function fetchCoinHistoryAction(id: string, days: number): Promise<OHLCVPoint[]> {
  return getCoinHistory(id, days as 1 | 7 | 30 | 365)
}

export async function searchCoinsAction(query: string): Promise<CoinSearchResult[]> {
  return searchCoins(query)
}

export async function setApiKeyAction(key: string): Promise<void> {
  const store = await cookies()
  if (key) {
    store.set('cgk', key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  } else {
    store.delete('cgk')
  }
}
