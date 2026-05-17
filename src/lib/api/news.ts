import { TTLCache } from './cache'
import type { NewsArticle } from '@/types/coin'

const cache = new TTLCache<NewsArticle[]>()

export async function getCoinNews(coinSymbol: string): Promise<NewsArticle[]> {
  const key = `news-${coinSymbol.toLowerCase()}`
  const cached = cache.get(key)
  if (cached) return cached

  try {
    const res = await fetch(
      `https://data.messari.io/api/v1/news/${coinSymbol.toLowerCase()}`,
      { next: { revalidate: 900 } }
    )
    if (res.ok) {
      const json = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const articles: NewsArticle[] = (json.data ?? []).slice(0, 8).map((a: any) => ({
        title: a.title ?? '',
        url: a.url ?? '',
        source: a.author?.name ?? 'Messari',
        publishedAt: a.published_at ?? '',
      }))
      if (articles.length > 0) {
        cache.set(key, articles, 900)
        return articles
      }
    }
  } catch {
    // fall through to empty fallback
  }

  cache.set(key, [], 900)
  return []
}
