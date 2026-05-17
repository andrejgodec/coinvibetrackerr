
const DOCS_LINKS = [
  { label: 'GitHub Repository', href: 'https://github.com/andrejgodec/coinvibetrackerr' },
  { label: 'Contributing Guide', href: 'https://github.com/andrejgodec/coinvibetrackerr/blob/main/CONTRIBUTING.md' },
  { label: 'Vibe Coding Guide', href: 'https://github.com/andrejgodec/coinvibetrackerr/blob/main/docs/VIBE_CODING.md' },
  { label: 'Agent Briefs', href: 'https://github.com/andrejgodec/coinvibetrackerr/tree/main/docs/agents' },
]

const RESOURCE_LINKS = [
  { label: 'CoinGecko API', href: 'https://www.coingecko.com/api/documentation' },
  { label: 'Binance API', href: 'https://binance-docs.github.io/apidocs/spot/en/' },
  { label: 'Next.js Docs', href: 'https://nextjs.org/docs' },
  { label: 'Supabase Docs', href: 'https://supabase.com/docs' },
]

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-400 hover:text-white transition-colors"
    >
      {children}
    </a>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* Documentation */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-100">
              Documentation
            </h3>
            <ul className="space-y-2">
              {DOCS_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <ExternalLink href={href}>{label}</ExternalLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-100">
              Resources
            </h3>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <ExternalLink href={href}>{label}</ExternalLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-100">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <ExternalLink href="https://github.com/andrejgodec/coinvibetrackerr/blob/main/LICENSE">
                  MIT License
                </ExternalLink>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Data is provided for informational purposes only and does not constitute
              financial advice. Cryptocurrency prices are volatile — always do your own
              research.
            </p>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="mt-8 border-t border-zinc-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {year} CoinVibeTracker. MIT License.
          </p>
          <p className="text-xs text-zinc-500">
            Open source —{' '}
            <ExternalLink href="https://github.com/andrejgodec/coinvibetrackerr">
              github.com/andrejgodec/coinvibetrackerr
            </ExternalLink>
          </p>
        </div>
      </div>
    </footer>
  )
}
