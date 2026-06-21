import { useCallback, useState } from 'react'
import { loadJSON, saveJSON } from '../shared/local-store'
import type { History } from '../session/history'

type Seen = Record<string, number>

export interface UnreadState {
  unreadFor: (peer: string) => number
  totalUnread: number
  markSeen: (peer: string) => void
}

/** Non-lus par pair = messages persistés − messages déjà vus. Robuste au refresh. */
export function useUnread(history: History): UnreadState {
  const [seen, setSeen] = useState<Seen>(() => loadJSON<Seen>('seen', {}))

  const unreadFor = useCallback((peer: string): number => {
    return Math.max(0, (history[peer]?.length ?? 0) - (seen[peer] ?? 0))
  }, [history, seen])

  const markSeen = useCallback((peer: string): void => {
    setSeen((prev) => {
      const next = { ...prev, [peer]: history[peer]?.length ?? 0 }
      saveJSON('seen', next)
      return next
    })
  }, [history])

  const totalUnread = Object.keys(history).reduce((sum, p) => sum + unreadFor(p), 0)
  return { unreadFor, totalUnread, markSeen }
}
