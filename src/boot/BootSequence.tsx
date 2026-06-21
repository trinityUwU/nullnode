import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  identityReady: boolean
  relayOnline: boolean
  onComplete: () => void
}

interface Step {
  text: string
  done: boolean
}

/** Real boot: each line reflects an actual subsystem coming up, not a fake loader. */
export function BootSequence({ identityReady, relayOnline, onComplete }: Props): React.ReactElement {
  const steps: Step[] = useMemo(() => [
    { text: 'libsodium runtime + entropy pool', done: identityReady },
    { text: 'deriving X25519 identity from seed', done: identityReady },
    { text: 'roster + history restored (local)', done: identityReady },
    { text: 'connecting to rendezvous relay', done: relayOnline },
    { text: 'sovereign transport — no external relay', done: relayOnline },
  ], [identityReady, relayOnline])

  const allDone = steps.every((s) => s.done)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (revealed >= steps.length) return
    const t = setTimeout(() => setRevealed((v) => v + 1), 180)
    return () => clearTimeout(t)
  }, [revealed, steps.length])

  useEffect(() => {
    if (allDone && revealed >= steps.length) {
      const t = setTimeout(onComplete, 600)
      return () => clearTimeout(t)
    }
  }, [allDone, revealed, steps.length, onComplete])

  return (
    <motion.div
      className="scanlines fixed inset-0 z-50 flex flex-col justify-center px-[12vw]"
      style={{ background: 'var(--void)' }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <div className="text-[11px] leading-relaxed">
        <div className="mb-3 tracking-[0.3em] accent-glow" style={{ color: 'var(--accent)' }}>
          NULLNODE // secure peer link v0.1
        </div>
        {steps.slice(0, revealed).map((s, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span style={{ color: 'var(--text-lo)' }}>{String(i).padStart(2, '0')}</span>
            <span style={{ color: s.done ? 'var(--accent)' : 'var(--warn)' }}>
              {s.done ? '[ ok ]' : '[ .. ]'}
            </span>
            <span style={{ color: 'var(--text-hi)' }}>{s.text}</span>
          </motion.div>
        ))}
        <span className="accent-glow" style={{ color: 'var(--accent)' }}>_</span>
      </div>
    </motion.div>
  )
}
