import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { SecureSession } from '../session/use-secure-session'
import type { SecureMessage } from '../shared/types'

function Bubble({ msg }: { msg: SecureMessage }): React.ReactElement {
  const self = msg.author === 'self'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1"
      style={{ alignItems: self ? 'flex-end' : 'flex-start' }}
    >
      <div className="flex items-center gap-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        <span>{self ? 'YOU' : 'PEER'}</span>
        <span style={{ color: 'var(--accent-dim)' }}>·0x{msg.cipherTag}</span>
        <span>{new Date(msg.at).toISOString().slice(11, 19)}</span>
      </div>
      <div
        className="max-w-[80%] rounded border px-3 py-2 text-[12px]"
        style={{
          borderColor: self ? 'var(--accent-dim)' : 'var(--line-bright)',
          background: self ? 'rgba(0,255,157,0.06)' : 'var(--surface-1)',
          color: 'var(--text-hi)',
        }}
      >{msg.body}</div>
    </motion.div>
  )
}

/** Encrypted message stream + composer, shown once the channel is secure. */
export function MessageStream({ session }: { session: SecureSession }): React.ReactElement {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [session.messages])

  const submit = (): void => {
    session.sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="flex h-[60vh] w-[460px] flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-auto pr-2">
        {session.messages.length === 0 && (
          <span className="text-[11px]" style={{ color: 'var(--text-lo)' }}>
            channel secure — transmissions are end-to-end encrypted.
          </span>
        )}
        {session.messages.map((m) => <Bubble key={m.id} msg={m} />)}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="transmit…"
          spellCheck={false}
          className="flex-1 rounded border px-3 py-2 text-[12px] outline-none"
          style={{ borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--text-hi)' }}
        />
        <button
          onClick={submit}
          className="rounded border px-4 text-[11px] tracking-[0.15em] transition-all hover:brightness-125"
          style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >SEND ▸</button>
      </div>
    </div>
  )
}
