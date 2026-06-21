import { motion } from 'framer-motion'
import { ConnectPanel } from './ConnectPanel'
import { MessageStream } from './MessageStream'
import type { SecureSession } from '../session/use-secure-session'

/** Right-hand console: dead-drop signaling until secure, then the message stream. */
export function CommsConsole({ session }: { session: SecureSession }): React.ReactElement {
  const secure = session.phase === 'secure'
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col gap-6 rounded-lg border p-6 backdrop-blur-sm"
      style={{ borderColor: 'var(--line)', background: 'rgba(15,18,20,0.72)' }}
    >
      <header className="flex items-center justify-between">
        <span className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--text-mid)' }}>
          {secure ? '// LINK ESTABLISHED' : '// DEAD-DROP EXCHANGE'}
        </span>
        <span className="text-[10px]" style={{ color: secure ? 'var(--accent)' : 'var(--warn)' }}>●</span>
      </header>
      {secure ? <MessageStream session={session} /> : <ConnectPanel session={session} />}
    </motion.aside>
  )
}
