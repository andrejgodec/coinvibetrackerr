'use client'
import { useState } from 'react'
import type { CoinDetail } from '@/types/coin'

const MAX_CHARS = 300

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function CoinAbout({ coin }: { coin: CoinDetail }) {
  const [expanded, setExpanded] = useState(false)

  const rawDescription = coin.description ? stripHtml(coin.description) : ''
  const truncated = rawDescription.length > MAX_CHARS && !expanded
  const displayedDescription = truncated
    ? rawDescription.slice(0, MAX_CHARS) + '…'
    : rawDescription

  const links: Array<{ label: string; href: string }> = []
  if (coin.homepage) {
    links.push({ label: 'Website', href: coin.homepage })
  }
  if (coin.twitterHandle) {
    links.push({
      label: `@${coin.twitterHandle}`,
      href: `https://twitter.com/${coin.twitterHandle}`,
    })
  }
  if (coin.githubUrl) {
    links.push({ label: 'GitHub', href: coin.githubUrl })
  }
  if (coin.whitepaperUrl) {
    links.push({ label: 'Whitepaper', href: coin.whitepaperUrl })
  }
  if (coin.redditUrl) {
    links.push({ label: 'Reddit', href: coin.redditUrl })
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        About
      </h2>

      {coin.categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {coin.categories.slice(0, 6).map(cat => (
            <span
              key={cat}
              className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4">
        {rawDescription ? (
          <>
            <p className="text-sm leading-relaxed text-zinc-300">{displayedDescription}</p>
            {rawDescription.length > MAX_CHARS && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="mt-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">No description available.</p>
        )}
      </div>

      {coin.genesisDate && (
        <p className="mb-3 text-xs text-zinc-500">
          Genesis:{' '}
          <span className="text-zinc-400">
            {new Date(coin.genesisDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </p>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-100 hover:underline"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
