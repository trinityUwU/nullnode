import { loadJSON, saveJSON } from '../shared/local-store'
import type { SecureMessage } from '../shared/types'

const KEY = 'history'

/** Historique des messages, indexé par adresse NULLNODE du pair. Persistant. */
export type History = Record<string, SecureMessage[]>

export function loadHistory(): History {
  return loadJSON<History>(KEY, {})
}

export function appendMessage(history: History, peer: string, msg: SecureMessage): History {
  const next = { ...history, [peer]: [...(history[peer] ?? []), msg] }
  saveJSON(KEY, next)
  return next
}

export function messagesFor(history: History, peer: string): SecureMessage[] {
  return history[peer] ?? []
}

/** Adresses des pairs avec qui une conversation existe, triées par message le plus récent. */
export function conversationPeers(history: History): string[] {
  return Object.keys(history)
    .filter((p) => (history[p]?.length ?? 0) > 0)
    .sort((a, b) => lastAt(history, b) - lastAt(history, a))
}

function lastAt(history: History, peer: string): number {
  const msgs = history[peer]
  return msgs && msgs.length ? msgs[msgs.length - 1].at : 0
}
