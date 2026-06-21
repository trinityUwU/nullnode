import { useState } from 'react'
import type { IdentityState } from './use-identity'

/** Shows the operator's own handle (PSEUDO#disc) + address, with editable pseudo. */
export function IdentityCard({ identity }: { identity: IdentityState }): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(identity.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) { console.error('[identity] copy failed', err) }
  }

  const commit = (): void => {
    identity.setPseudo(draft.trim())
    setEditing(false)
  }

  const [name, disc] = identity.handle.split('#')
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface-0)' }}>
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>YOUR IDENTITY</span>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
        {editing ? (
          <input
            autoFocus value={draft} spellCheck={false}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            onBlur={commit}
            className="flex-1 rounded border px-2 py-1 text-[13px] outline-none"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-1)', color: 'var(--accent)' }}
          />
        ) : (
          <button
            onClick={() => { setDraft(identity.pseudo); setEditing(true) }}
            className="group flex items-baseline gap-1 text-left"
            title="rename"
          >
            <span className="text-[15px] tracking-[0.12em] accent-glow" style={{ color: 'var(--accent)' }}>{name || '—'}</span>
            <span className="text-[12px]" style={{ color: 'var(--text-lo)' }}>#{disc || '——————'}</span>
            <span className="ml-1 text-[9px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--text-lo)' }}>✎</span>
          </button>
        )}
      </div>
      <button
        onClick={copy}
        className="group flex items-center justify-between rounded border px-3 py-2 text-left transition-colors"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-1)' }}
      >
        <span className="truncate text-[10px]" style={{ color: 'var(--text-mid)' }}>{identity.address || 'generating…'}</span>
        <span className="ml-2 shrink-0 text-[10px]" style={{ color: copied ? 'var(--accent)' : 'var(--text-lo)' }}>{copied ? '✓' : 'COPY'}</span>
      </button>
      <span className="text-[9px] leading-relaxed" style={{ color: 'var(--text-lo)' }}>
        Your handle is bound to your key. Share your address so others can add you.
      </span>
    </div>
  )
}
