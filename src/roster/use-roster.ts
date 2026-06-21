import { useCallback, useEffect, useState } from 'react'
import sodium from 'libsodium-wrappers'
import { decodeAddress, callsign } from '../identity/address'
import { deriveFingerprint } from '../crypto/identity'
import { loadJSON, saveJSON } from '../shared/local-store'
import type { Friend } from './types'

function buildFriend(address: string, alias: string): Friend {
  const pub = decodeAddress(address)
  return {
    id: address.trim(),
    address: address.trim(),
    pub: sodium.to_base64(pub),
    alias: alias.trim() || callsign(pub),
    callsign: callsign(pub),
    fingerprint: deriveFingerprint(pub),
    verified: false,
    presence: 'unknown',
    addedAt: Date.now(),
  }
}

export interface RosterState {
  friends: Friend[]
  addFriend: (address: string, alias: string) => { ok: boolean; error?: string }
  removeFriend: (id: string) => void
  toggleVerified: (id: string) => void
}

/** Local friends roster. No central directory — keys are stored and trusted locally. */
export function useRoster(selfId: string | null): RosterState {
  const [friends, setFriends] = useState<Friend[]>(() => loadJSON<Friend[]>('roster', []))

  useEffect(() => { saveJSON('roster', friends) }, [friends])

  const addFriend = useCallback((address: string, alias: string): { ok: boolean; error?: string } => {
    try {
      const friend = buildFriend(address, alias)
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

  const toggleVerified = useCallback((id: string): void => {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, verified: !f.verified } : f)))
  }, [])

  return { friends, addFriend, removeFriend, toggleVerified }
}
