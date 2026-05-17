import { CoinPageClient } from './CoinPageClient'

export async function generateStaticParams() {
  try {
    const key = process.env.COINGECKO_API_KEY
    const headers: HeadersInit = key ? { 'x-cg-demo-api-key': key } : {}
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1',
      { headers },
    )
    if (!res.ok) return []
    const data = await res.json() as { id: string }[]
    return data.map(c => ({ id: c.id }))
  } catch {
    return []
  }
}

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CoinPageClient id={id} />
}
