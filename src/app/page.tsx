import { getTopCoins } from '@/lib/api/coingecko'
import { CoinTable } from '@/components/CoinTable'
import { SearchBar } from '@/components/SearchBar'
import { MarketSummary } from '@/components/MarketSummary'
import type { Coin } from '@/types/coin'

export const revalidate = 60

export default async function HomePage() {
  let coins: Coin[] = []
  try {
    coins = await getTopCoins(100, 1)
  } catch {
    // API unavailable — render empty state, client will poll
  }

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">CoinVibeTracker</h1>
          <SearchBar />
        </div>
        <MarketSummary coins={coins} />
        <CoinTable initialCoins={coins} />
      </div>
    </main>
  )
}
