import { useState } from 'react'

/** A copyable dead-drop code block with a one-shot copy affordance. */
export function DropCode({ label, code }: { label: string; code: string }): React.ReactElement {
  const [copied, setCopied] = useState(false)
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code.replace(/\s+/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) { console.error('[comms] clipboard failed', err) }
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>{label}</span>
        <button
          onClick={copy}
          className="text-[10px] tracking-[0.15em] transition-colors"
          style={{ color: copied ? 'var(--accent)' : 'var(--text-mid)' }}
        >
          {copied ? '✓ COPIED' : 'COPY ▸'}
        </button>
      </div>
      <pre
        className="max-h-28 overflow-auto rounded border p-3 text-[10px] leading-relaxed"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--accent-dim)' }}
      >{code}</pre>
    </div>
  )
}
