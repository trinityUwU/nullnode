import { useCallback, useEffect, useState } from 'react'
import sodium from 'libsodium-wrappers'
import { decodeAddress, callsign } from '../identity/address'
import { deriveFingerprint } from '../crypto/identity'
import { loadJSON, saveJSON } from '../shared/local-store'
import type { Friend, Presence } from './types'

function buildFriend(address: string, pseudo: string): Friend {
  const pub = decodeAddress(address)
  const cs = callsign(pub)
  return {
    id: address.trim(),
    address: address.trim(),
    pub: sodium.to_base64(pub),
    alias: pseudo.trim() || cs,
    pseudo: pseudo.trim() || cs,
    callsign: cs,
    fingerprint: deriveFingerprint(pub),
    verified: false,
    presence: 'unknown',
    addedAt: Date.now(),
  }
}

export interface RosterState {
  friends: Friend[]
  addFriend: (address: string, pseudo: string) => { ok: boolean; error?: string }
  removeFriend: (id: string) => void
  hasFriend: (address: string) => boolean
  setPresence: (address: string, presence: Presence) => void
  resetPresence: () => void
}

/** Local friends roster. No central directory — keys are stored and trusted locally. */
export function useRoster(selfId: string | null): RosterState {
  const [friends, setFriends] = useState<Friend[]>(() => loadJSON<Friend[]>('roster', []))

  useEffect(() => { saveJSON('roster', friends) }, [friends])

  const addFriend = useCallback((address: string, pseudo: string): { ok: boolean; error?: string } => {
    try {
      const friend = buildFriend(address, pseudo)
      if (friend.id === selfId) return { ok: false, error: 'THAT IS YOUR OWN ADDRESS' }
      if (friends.some((f) => f.id === friend.id)) return { ok: false, error: 'ALREADY IN ROSTER' }
      setFriends((prev) => [...prev, friend])
      return { ok: true }
    } catch {
      return { ok: false, error: 'INVALID NULLNODE ADDRESS' }
    }
  }, [friends, selfId])

  const removeFriend = useCallback((id: string): void => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const hasFriend = useCallback((address: string): boolean => {
    return friends.some((f) => f.address === address.trim())
  }, [friends])

  const setPresence = useCallback((address: string, presence: Presence): void => {
    setFriends((prev) => prev.map((f) => (f.address === address ? { ...f, presence } : f)))
  }, [])

  const resetPresence = useCallback((): void => {
    setFriends((prev) => prev.map((f) => ({ ...f, presence: 'unknown' as Presence })))
  }, [])

  return { friends, addFriend, removeFriend, hasFriend, setPresence, resetPresence }
}
