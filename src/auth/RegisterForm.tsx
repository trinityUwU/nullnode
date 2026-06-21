import { useState } from 'react'
import { newMnemonic } from '../identity/seed'
import type { IdentityState } from '../identity/use-identity'

interface Props {
  identity: IdentityState
  onBack: () => void
}

/** Création : choisir un pseudo, révéler la phrase générée, confirmer pour entrer. */
export function RegisterForm({ identity, onBack }: Props): React.ReactElement {
  const [pseudo, setPseudo] = useState('')
  const [phrase, setPhrase] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = (): void => { if (pseudo.trim()) setPhrase(newMnemonic()) }

  const copy = async (): Promise<void> => {
    try { await navigator.clipboard.writeText(phrase); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    catch (err) { console.error('[register] copy failed', err) }
  }

  if (phrase) return <Reveal phrase={phrase} copied={copied} onCopy={() => void copy()} onEnter={() => identity.register(phrase, pseudo)} />

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-mid)' }}>// REGISTER</span>
      <input
        autoFocus value={pseudo} spellCheck={false}
        onChange={(e) => setPseudo(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') generate() }}
        placeholder="choose a pseudo…"
        className="rounded border px-3 py-2 text-[12px] outline-none"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--accent)' }}
      />
      <div className="flex gap-2">
        <button
          onClick={generate} disabled={!pseudo.trim()}
          className="flex-1 rounded border px-3 py-2 text-[11px] tracking-[0.15em] transition-all hover:brightness-125 disabled:opacity-30"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >▸ GENERATE IDENTITY</button>
        <button onClick={onBack} className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-lo)' }}>BACK</button>
      </div>
    </div>
  )
}

interface RevealProps {
  phrase: string
  copied: boolean
  onCopy: () => void
  onEnter: () => void
}

/** Affiche la phrase générée : à sauvegarder avant d'entrer. */
function Reveal({ phrase, copied, onCopy, onEnter }: RevealProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] tracking-[0.25em]" style={{ color: 'var(--text-mid)' }}>// YOUR RECOVERY PHRASE</span>
      <div className="grid grid-cols-3 gap-1 rounded border p-3" style={{ borderColor: 'var(--line)', background: 'var(--surface-0)' }}>
        {phrase.split(' ').map((w, i) => (
          <span key={i} className="text-[11px]" style={{ color: 'var(--accent-dim)' }}>
            <span style={{ color: 'var(--text-lo)' }}>{i + 1}.</span> {w}
          </span>
        ))}
      </div>
      <span className="text-[8px] leading-relaxed" style={{ color: 'var(--warn)' }}>
        ⚠ These 12 words ARE your account. Save them offline now — they cannot be recovered.
      </span>
      <div className="flex gap-2">
        <button
          onClick={onCopy} className="rounded border px-3 py-2 text-[10px] tracking-[0.2em]"
          style={{ borderColor: 'var(--line)', color: copied ? 'var(--accent)' : 'var(--text-lo)' }}
        >{copied ? '✓ COPIED' : 'COPY'}</button>
        <button
          onClick={onEnter}
          className="flex-1 rounded border px-3 py-2 text-[11px] tracking-[0.15em] transition-all hover:brightness-125"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >▸ I SAVED IT — ENTER</button>
      </div>
    </div>
  )
}
