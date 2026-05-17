import type { NewsArticle } from '@/types/coin'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function CoinNews({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Latest News
      </h3>
      <ul className="space-y-3">
        {articles.map((a, i) => (
          <li key={i}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="line-clamp-2 text-sm leading-snug text-zinc-100 group-hover:text-white">
                {a.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {a.source} &middot; {timeAgo(a.publishedAt)}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
