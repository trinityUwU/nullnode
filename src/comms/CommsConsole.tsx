import { motion } from 'framer-motion'
import { MessageStream } from './MessageStream'
import { ConversationList } from './ConversationList'
import { resolvePeerHandle } from './peer-label'
import type { SecureSession } from '../session/use-secure-session'
import type { UnreadState } from './use-unread'
import type { Friend } from '../roster/types'

interface Props {
  session: SecureSession
  friends: Friend[]
  unread: UnreadState
  chatPeer: string | null
  incomingPeer: string | null
  onOpenChat: (peer: string) => void
  onCloseChat: () => void
}

/** Right console: conversation list + incoming notice, or the open conversation. */
export function CommsConsole(props: Props): React.ReactElement {
  const { session, friends, unread, chatPeer, incomingPeer, onOpenChat, onCloseChat } = props
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex w-[480px] flex-col gap-4 rounded-lg border p-6 backdrop-blur-sm"
      style={{ borderColor: 'var(--line)', background: 'rgba(15,18,20,0.72)' }}
    >
      {chatPeer ? (
        <MessageStream session={session} peer={chatPeer} friends={friends} onBack={onCloseChat} />
      ) : (
        <>
          <header className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--text-mid)' }}>// MESSAGES</span>
            {unread.totalUnread > 0 && (
              <span className="rounded-full px-2 text-[9px]" style={{ background: 'var(--accent)', color: 'var(--void)' }}>
                {unread.totalUnread} NEW
              </span>
            )}
          </header>
          {incomingPeer && (
            <button
              onClick={() => onOpenChat(incomingPeer)}
              className="flex items-center gap-3 rounded border px-3 py-2 text-left"
              style={{ borderColor: 'var(--accent-dim)', background: 'rgba(0,255,157,0.06)' }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)', animation: 'pulse-node 1.4s infinite' }} />
              <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                {resolvePeerHandle(incomingPeer, friends)} connected — open ▸
              </span>
            </button>
          )}
          <ConversationList history={session.history} friends={friends} unreadFor={unread.unreadFor} onOpen={onOpenChat} />
        </>
      )}
    </motion.aside>
  )
}
