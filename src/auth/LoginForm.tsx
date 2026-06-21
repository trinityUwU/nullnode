import { useState } from 'react'
import type { IdentityState } from '../identity/use-identity'

interface Props {
  identity: IdentityState
  onBack: () => void
}

/** Connexion par phrase de récupération existante. */
export function LoginForm({ identity, onBack }: Props): React.ReactElement {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const submit = (): void => {
    const res = identity.importMnemonic(draft)
    if (!res.ok) setError(res.error ?? 'FAILED')
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-mid)' }}>// LOGIN</span>
      <textarea
        autoFocus value={draft} rows={3} spellCheck={false}
        onChange={(e) => { setDraft(e.target.value); setError('') }}
        placeholder="paste your 12-word recovery phrase…"
        className="rounded border p-3 text-[11px] outline-none"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--text-hi)' }}
      />
      {error && <span className="text-[9px]" style={{ color: 'var(--danger)' }}>{error}</span>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 rounded border px-3 py-2 text-[11px] tracking-[0.15em] transition-all hover:brightness-125"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >▸ ENTER</button>
        <button onClick={onBack} className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-lo)' }}>BACK</button>
      </div>
    </div>
  )
}
