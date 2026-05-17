'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { ApiKeyModal } from '@/components/ApiKeyModal'

export function NavBar() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-100 hover:text-white transition-colors"
        >
          CoinVibeTracker
        </Link>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Open API key settings"
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>

      <ApiKeyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  )
}
