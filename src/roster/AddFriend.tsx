import { useState } from 'react'

interface Props {
  onSend: (address: string) => { ok: boolean; error?: string }
}

/** Send a friend request by pasting a NULLNODE address. */
export function AddFriend({ onSend }: Props): React.ReactElement {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)

  const submit = (): void => {
    const res = onSend(address)
    if (res.ok) { setAddress(''); setStatus({ msg: 'REQUEST SENT ▸', ok: true }) }
    else setStatus({ msg: res.error ?? 'FAILED', ok: false })
    setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>ADD FRIEND</span>
      <div className="flex gap-2">
        <input
          value={address} onChange={(e) => { setAddress(e.target.value); setStatus(null) }}
          placeholder="null:…  (paste address)" spellCheck={false}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 rounded border px-3 py-2 text-[10px] outline-none"
          style={{ borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--text-hi)' }}
        />
        <button
          onClick={submit}
          className="rounded border px-4 text-[10px] tracking-[0.15em] transition-all hover:brightness-125"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >SEND ▸</button>
      </div>
      {status && (
        <span className="text-[9px]" style={{ color: status.ok ? 'var(--accent)' : 'var(--danger)' }}>{status.msg}</span>
      )}
    </div>
  )
}
