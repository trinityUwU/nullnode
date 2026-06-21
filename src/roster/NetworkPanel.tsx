import { motion } from 'framer-motion'
import { IdentityCard } from '../identity/IdentityCard'
import { AddFriend } from './AddFriend'
import { FriendsList } from './FriendsList'
import type { IdentityState } from '../identity/use-identity'
import type { RosterState } from './use-roster'

interface Props {
  identity: IdentityState
  roster: RosterState
}

/** Left console: who you are + your network of peers. */
export function NetworkPanel({ identity, roster }: Props): React.ReactElement {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex w-[340px] flex-col gap-5 rounded-lg border p-6 backdrop-blur-sm"
      style={{ borderColor: 'var(--line)', background: 'rgba(15,18,20,0.72)' }}
    >
      <header className="flex items-center justify-between">
        <span className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--text-mid)' }}>// NETWORK</span>
        <span className="text-[10px]" style={{ color: 'var(--text-lo)' }}>{roster.friends.length} PEERS</span>
      </header>
      <IdentityCard identity={identity} />
      <AddFriend roster={roster} />
      <FriendsList roster={roster} />
    </motion.aside>
  )
}
