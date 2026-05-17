'use client'

export default function CoinError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-zinc-400 text-sm">
          {error.message.includes('429') || error.message.includes('Rate limit')
            ? 'API rate limit reached. Please wait a moment and try again.'
            : 'Failed to load coin data.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-zinc-800 text-sm hover:bg-zinc-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
