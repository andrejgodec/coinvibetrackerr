'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { setApiKeyAction } from '@/app/actions'

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'saved' | 'cleared'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    try {
      await setApiKeyAction(key)
      setStatus('saved')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save key')
    }
  }

  async function handleClear() {
    setError(null)
    try {
      await setApiKeyAction('')
      setKey('')
      setStatus('cleared')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear key')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          aria-labelledby="api-key-modal-title"
          aria-describedby="api-key-modal-desc"
        >
          <Dialog.Title
            id="api-key-modal-title"
            className="mb-4 text-base font-semibold text-zinc-100"
          >
            CoinGecko API Key
          </Dialog.Title>

          <div className="space-y-3">
            <label htmlFor="cgk-input" className="block text-sm text-zinc-400">
              Demo API key
            </label>
            <input
              id="cgk-input"
              type="password"
              value={key}
              onChange={e => {
                setKey(e.target.value)
                setError(null)
                setStatus('idle')
              }}
              placeholder="CG-xxxxxxxxxxxxxxxx"
              aria-describedby={error ? 'cgk-error' : undefined}
              aria-invalid={error ? true : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />

            {error && (
              <p
                id="cgk-error"
                role="alert"
                className="text-xs text-red-400"
              >
                {error}
              </p>
            )}

            {status === 'cleared' && !error && (
              <p aria-live="polite" className="text-xs text-amber-400">
                Cleared. Anonymous limits apply.
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => handleSave()} className="flex-1">
              Save key
            </Button>
            <Button variant="outline" onClick={() => handleClear()}>
              Clear key
            </Button>
          </div>

          <p
            id="api-key-modal-desc"
            className="mt-4 text-xs text-zinc-500"
          >
            Get a free Demo key at coingecko.com/api
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
