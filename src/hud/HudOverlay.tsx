import { useEffect, useState } from 'react'
import type { ConnectionPhase } from '../shared/types'

interface Props {
  selfFingerprint: string
  peerFingerprint: string
  phase: ConnectionPhase
}

const PHASE_LABEL: Record<ConnectionPhase, string> = {
  idle: 'STANDBY',
  'generating-keys': 'KEYGEN',
  'awaiting-peer': 'AWAITING PEER',
  handshaking: 'HANDSHAKE',
  secure: 'SECURE CHANNEL',
  lost: 'LINK LOST',
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }): React.ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--text-lo)' }}>{label}</span>
      <span className="text-[11px]" style={{ color: accent ? 'var(--accent)' : 'var(--text-mid)' }}>{value}</span>
    </div>
  )
}

export function HudOverlay({ selfFingerprint, peerFingerprint, phase }: Props): React.ReactElement {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toISOString().slice(11, 19)), 1000)
    return () => clearInterval(t)
  }, [])

  const secure = phase === 'secure'
  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 flex w-full justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full" style={{ background: secure ? 'var(--accent)' : 'var(--warn)', animation: 'pulse-node 1.6s infinite' }} />
          <span className="text-[12px] tracking-[0.3em]" style={{ color: 'var(--text-hi)' }}>NULLNODE</span>
        </div>
        <Stat label="STATUS" value={PHASE_LABEL[phase]} accent={secure} />
        <span className="text-[11px]" style={{ color: 'var(--text-mid)' }}>{clock} UTC</span>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 flex w-full justify-between gap-8 px-8 py-6">
        <Stat label="LOCAL ID" value={selfFingerprint || '— — — —'} />
        <Stat label="PEER ID" value={peerFingerprint || 'unbound'} accent={secure} />
        <Stat label="CIPHER" value="ChaCha20-Poly1305" />
        <Stat label="TRANSPORT" value="WEBRTC / P2P" accent={secure} />
      </div>
    </>
  )
}
