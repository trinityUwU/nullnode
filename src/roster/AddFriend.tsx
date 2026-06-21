import { useState } from 'react'
import type { RosterState } from './use-roster'

/** Form to add a friend by pasting their NULLNODE address. */
export function AddFriend({ roster }: { roster: RosterState }): React.ReactElement {
  const [address, setAddress] = useState('')
  const [alias, setAlias] = useState('')
  const [error, setError] = useState('')

  const submit = (): void => {
    const res = roster.addFriend(address, alias)
    if (!res.ok) { setError(res.error ?? 'FAILED'); return }
    setAddress(''); setAlias(''); setError('')
  }

  const field: React.CSSProperties = { borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--text-hi)' }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>ADD FRIEND</span>
      <input
        value={address} onChange={(e) => { setAddress(e.target.value); setError('') }}
        placeholder="null:…  (paste address)" spellCheck={false}
        className="rounded border px-3 py-2 text-[10px] outline-none" style={field}
      />
      <div className="flex gap-2">
        <input
          value={alias} onChange={(e) => setAlias(e.target.value)}
          placeholder="alias (optional)" spellCheck={false}
          className="flex-1 rounded border px-3 py-2 text-[10px] outline-none" style={field}
        />
        <button
          onClick={submit}
          className="rounded border px-4 text-[10px] tracking-[0.15em] transition-all hover:brightness-125"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >ADD ▸</button>
      </div>
      {error && <span className="text-[9px]" style={{ color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}
