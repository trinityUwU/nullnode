import { AnimatePresence, motion } from 'framer-motion'
import type { FriendRequest } from './types'

interface Props {
  requests: FriendRequest[]
  onAccept: (req: FriendRequest) => void
  onDecline: (req: FriendRequest) => void
}

/** Incoming friend requests — accept (mutual) or decline. */
export function FriendRequests({ requests, onAccept, onDecline }: Props): React.ReactElement | null {
  if (requests.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] tracking-[0.25em]" style={{ color: 'var(--warn)' }}>
        PENDING REQUESTS · {requests.length}
      </span>
      <AnimatePresence>
        {requests.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded border px-2 py-2"
            style={{ borderColor: 'var(--line-bright)', background: 'var(--surface-1)' }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12px]" style={{ color: 'var(--text-hi)' }}>{r.pseudo}</span>
              <span className="truncate text-[8px]" style={{ color: 'var(--text-lo)' }}>{r.address}</span>
            </div>
            <button
              onClick={() => onAccept(r)}
              className="rounded border px-2 py-1 text-[9px] tracking-[0.1em] transition-all hover:brightness-125"
              style={{ borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
            >ACCEPT</button>
            <button
              onClick={() => onDecline(r)}
              className="text-[11px]" style={{ color: 'var(--danger)' }}
            >✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
