// Collecte et fusion de l'état sauvegardable (roster + historique + seen + pseudo).
// Fonctions pures sur le localStorage local-first. Le merge est convergent (union),
// jamais destructif : il complète l'état local avec le blob distant.

import { loadJSON, saveJSON } from '../shared/local-store'
import type { BackupState } from './backup-crypto'
import type { Friend } from '../roster/types'
import type { History } from '../session/history'
import type { SecureMessage } from '../shared/types'

type Seen = Record<string, number>

/** Lit l'état courant depuis le localStorage pour le sceller. */
export function collectBackupState(): BackupState {
  return {
    roster: loadJSON<Friend[]>('roster', []),
    history: loadJSON<History>('history', {}),
    seen: loadJSON<Seen>('seen', {}),
    pseudo: loadJSON<string>('pseudo', ''),
  }
}

/** Fusionne un blob distant dans le localStorage. Retourne true si quelque chose a changé. */
export function mergeBackupState(remote: BackupState): boolean {
  const roster = mergeRoster(asFriends(remote.roster))
  const history = mergeHistory(asHistory(remote.history))
  const seen = mergeSeen(asSeen(remote.seen))
  const pseudo = mergePseudo(typeof remote.pseudo === 'string' ? remote.pseudo : '')
  return roster || history || seen || pseudo
}

function mergeRoster(remote: Friend[]): boolean {
  const local = loadJSON<Friend[]>('roster', [])
  const known = new Set(local.map((f) => f.address))
  const added = remote.filter((f) => f && f.address && !known.has(f.address))
  if (!added.length) return false
  saveJSON('roster', [...local, ...added])
  return true
}

function mergeHistory(remote: History): boolean {
  const local = loadJSON<History>('history', {})
  let changed = false
  for (const [peer, msgs] of Object.entries(remote)) {
    const merged = unionMessages(local[peer] ?? [], msgs ?? [])
    if (merged.length !== (local[peer]?.length ?? 0)) { local[peer] = merged; changed = true }
  }
  if (changed) saveJSON('history', local)
  return changed
}

function unionMessages(a: SecureMessage[], b: SecureMessage[]): SecureMessage[] {
  const byId = new Map<string, SecureMessage>()
  for (const m of [...a, ...b]) if (m && m.id) byId.set(m.id, m)
  return [...byId.values()].sort((x, y) => x.at - y.at)
}

function mergeSeen(remote: Seen): boolean {
  const local = loadJSON<Seen>('seen', {})
  let changed = false
  for (const [peer, count] of Object.entries(remote)) {
    if ((local[peer] ?? 0) < count) { local[peer] = count; changed = true }
  }
  if (changed) saveJSON('seen', local)
  return changed
}

function mergePseudo(remote: string): boolean {
  if (!remote) return false
  if (loadJSON<string>('pseudo', '')) return false
  saveJSON('pseudo', remote)
  return true
}

// Coercions défensives : le blob vient du réseau, on ne fait jamais confiance à sa forme.
function asFriends(v: unknown): Friend[] {
  return Array.isArray(v) ? (v as Friend[]) : [] // narrowing par Array.isArray, champs lus défensivement
}
function asHistory(v: unknown): History {
  return typeof v === 'object' && v !== null ? (v as History) : {} // objet non-null garanti
}
function asSeen(v: unknown): Seen {
  return typeof v === 'object' && v !== null ? (v as Seen) : {} // objet non-null garanti
}
