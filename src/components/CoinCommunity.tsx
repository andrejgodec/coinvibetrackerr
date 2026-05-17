import type { CoinDetail } from '@/types/coin'

function formatCount(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function CoinCommunity({ coin }: { coin: CoinDetail }) {
  const hasCommunity = coin.twitterFollowers || coin.redditSubscribers
  const hasDev = coin.githubStars || coin.githubCommits4w

  if (!hasCommunity && !hasDev) return null

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      {hasCommunity && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Community
          </h3>
          <dl className="space-y-2 text-sm">
            {coin.twitterFollowers !== null && coin.twitterFollowers > 0 && (
              <div className="flex justify-between">
                <dt className="text-zinc-400">X / Twitter</dt>
                <dd className="text-zinc-100">{formatCount(coin.twitterFollowers)}</dd>
              </div>
            )}
            {coin.redditSubscribers !== null && coin.redditSubscribers > 0 && (
              <div className="flex justify-between">
                <dt className="text-zinc-400">Reddit</dt>
                <dd className="text-zinc-100">{formatCount(coin.redditSubscribers)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {hasDev && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Developer
          </h3>
          <dl className="space-y-2 text-sm">
            {coin.githubStars !== null && (
              <div className="flex justify-between">
                <dt className="text-zinc-400">GitHub Stars</dt>
                <dd className="text-zinc-100">{formatCount(coin.githubStars)}</dd>
              </div>
            )}
            {coin.githubForks !== null && (
              <div className="flex justify-between">
                <dt className="text-zinc-400">Forks</dt>
                <dd className="text-zinc-100">{formatCount(coin.githubForks)}</dd>
              </div>
            )}
            {coin.githubCommits4w !== null && (
              <div className="flex justify-between">
                <dt className="text-zinc-400">Commits (4w)</dt>
                <dd className="text-zinc-100">{coin.githubCommits4w}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
