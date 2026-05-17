import { clientGetTopCoins } from '@/lib/api/coingecko-client'
import { CoinPageClient } from './CoinPageClient'

export async function generateStaticParams() {
  try {
    const coins = await clientGetTopCoins(100, 1)
    return coins.map(c => ({ id: c.id }))
  } catch {
    return []
  }
}

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CoinPageClient id={id} />
}
