import { CoinTable } from '@/components/CoinTable'
import { SearchBar } from '@/components/SearchBar'
import { MarketSummary } from '@/components/MarketSummary'

export default function HomePage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">CoinVibeTracker</h1>
          <SearchBar />
        </div>
        <MarketSummary coins={[]} />
        <CoinTable initialCoins={[]} />
      </div>
    </main>
  )
}
