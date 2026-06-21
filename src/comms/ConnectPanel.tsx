import { useState } from 'react'
import { DropCode } from './DropCode'
import type { SecureSession } from '../session/use-secure-session'

const FIELD_STYLE: React.CSSProperties = {
  borderColor: 'var(--line)', background: 'var(--surface-0)', color: 'var(--text-hi)',
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: string }): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="rounded border px-4 py-3 text-[11px] tracking-[0.2em] transition-all hover:brightness-125"
      style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)', background: 'rgba(0,255,157,0.05)' }}
    >{children}</button>
  )
}

/** Manual dead-drop signaling: open a channel or join one by pasting codes. */
export function ConnectPanel({ session }: { session: SecureSession }): React.ReactElement {
  const [paste, setPaste] = useState('')
  const isHost = session.phase === 'awaiting-peer'

  const handleJoinOrComplete = async (): Promise<void> => {
    try {
      if (isHost) await session.completeSession(paste)
      else await session.joinSession(paste)
      setPaste('')
    } catch (err) { console.error('[comms] drop exchange failed', err) }
  }

  return (
    <div className="flex w-[420px] flex-col gap-5">
      {session.phase === 'idle' && (
        <PrimaryButton onClick={() => void session.hostSession()}>▸ OPEN SECURE CHANNEL</PrimaryButton>
      )}
      {session.localDrop && (
        <DropCode label={isHost ? 'YOUR OFFER — SEND TO PEER' : 'YOUR ANSWER — SEND BACK'} code={session.localDrop} />
      )}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>
          {isHost ? 'PASTE PEER ANSWER' : 'PASTE PEER OFFER TO JOIN'}
        </span>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          spellCheck={false}
          className="rounded border p-3 text-[10px] outline-none"
          style={FIELD_STYLE}
        />
        <PrimaryButton onClick={() => void handleJoinOrComplete()}>
          {isHost ? '▸ ESTABLISH LINK' : '▸ ACCEPT & ANSWER'}
        </PrimaryButton>
      </div>
    </div>
  )
}
