import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { resolvePeerHandle } from './peer-label'
import type { SecureSession } from '../session/use-secure-session'
import type { SecureMessage } from '../shared/types'
import type { Friend } from '../roster/types'

function Bubble({ msg, authorName }: { msg: SecureMessage; authorName: string }): React.ReactElement {
  const self = msg.author === 'self'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1" style={{ alignItems: self ? 'flex-end' : 'flex-start' }}
    >
      <div className="flex items-center gap-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        <span style={{ color: 'var(--accent-dim)' }}>{authorName}</span>
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

interface Props {
  session: SecureSession
  peer: string
  friends: Friend[]
  selfPseudo: string
  onSend: (peer: string, body: string) => void
  onBack: () => void
}

/** One conversation: header with the real peer handle, message stream, composer. */
export function MessageStream({ session, peer, friends, selfPseudo, onSend, onBack }: Props): React.ReactElement {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const messages = session.messagesFor(peer)
  const peerName = resolvePeerHandle(peer, friends).split('#')[0]
  const connected = session.phase === 'secure' && session.peerAddress === peer

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const submit = (): void => { onSend(peer, draft); setDraft('') }

  return (
    <div className="flex h-[60vh] w-full min-w-0 flex-col gap-4">
      <header className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--line)' }}>
        <button onClick={onBack} className="text-[14px]" style={{ color: 'var(--text-mid)' }}>‹</button>
        <span className="h-2 w-2 rounded-full" style={{ background: connected ? 'var(--accent)' : 'var(--text-lo)' }} />
        <span className="text-[13px]" style={{ color: 'var(--text-hi)' }}>{resolvePeerHandle(peer, friends)}</span>
        <span className="ml-auto text-[9px]" style={{ color: connected ? 'var(--accent)' : 'var(--text-lo)' }}>
          {connected ? 'SECURE' : 'RELAY'}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-4 overflow-auto pr-2">
        {messages.length === 0 && (
          <span className="text-[11px]" style={{ color: 'var(--text-lo)' }}>end-to-end encrypted. say something.</span>
        )}
        {messages.map((m) => <Bubble key={m.id} msg={m} authorName={m.author === 'self' ? selfPseudo : peerName} />)}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={connected ? 'transmit…' : 'transmit (delivered when online)…'}
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
