import { useState } from 'react'
import type { IdentityState } from './use-identity'

/** Shows the operator's own NULLNODE address + callsign, ready to share. */
export function IdentityCard({ identity }: { identity: IdentityState }): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(identity.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) { console.error('[identity] copy failed', err) }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface-0)' }}>
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>YOUR IDENTITY</span>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
        <span className="text-[15px] tracking-[0.15em] accent-glow" style={{ color: 'var(--accent)' }}>
          {identity.callsign || '— — —'}
        </span>
      </div>
      <button
        onClick={copy}
        className="group flex items-center justify-between rounded border px-3 py-2 text-left transition-colors"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-1)' }}
      >
        <span className="truncate text-[10px]" style={{ color: 'var(--text-mid)' }}>
          {identity.address || 'generating…'}
        </span>
        <span className="ml-2 shrink-0 text-[10px]" style={{ color: copied ? 'var(--accent)' : 'var(--text-lo)' }}>
          {copied ? '✓' : 'COPY'}
        </span>
      </button>
      <span className="text-[9px] leading-relaxed" style={{ color: 'var(--text-lo)' }}>
        Share this address so others can add you. Your private key never leaves this device.
      </span>
    </div>
  )
}
