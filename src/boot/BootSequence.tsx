import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BOOT_LINES } from './boot-lines'

interface Props {
  onComplete: () => void
}

/** Terminal-style init overlay. Reveals boot lines, then signals completion. */
export function BootSequence({ onComplete }: Props): React.ReactElement {
  const [visible, setVisible] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    if (visible >= BOOT_LINES.length) {
      if (done.current) return
      done.current = true
      const t = setTimeout(onComplete, 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisible((v) => v + 1), 260)
    return () => clearTimeout(t)
  }, [visible, onComplete])

  return (
    <motion.div
      className="scanlines fixed inset-0 z-50 flex flex-col justify-center px-[12vw]"
      style={{ background: 'var(--void)' }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <div className="text-[11px] leading-relaxed">
        {BOOT_LINES.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span style={{ color: 'var(--text-lo)' }}>{String(i).padStart(2, '0')}</span>
            <span style={{ color: line.status === 'ok' ? 'var(--accent)' : 'var(--text-mid)' }}>
              {line.status === 'ok' ? '[ ok ]' : line.status === 'work' ? '[ .. ]' : '::::::'}
            </span>
            <span style={{ color: 'var(--text-hi)' }}>{line.text}</span>
          </motion.div>
        ))}
        <span className="accent-glow" style={{ color: 'var(--accent)' }}>_</span>
      </div>
    </motion.div>
  )
}
