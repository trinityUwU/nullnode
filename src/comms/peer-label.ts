import { callsign, decodeAddress, discriminator } from '../identity/address'
import type { Friend } from '../roster/types'

/** Vrai handle d'un pair : PSEUDO#disc si ami connu, sinon callsign dérivé de sa clé. */
export function resolvePeerHandle(address: string, friends: Friend[]): string {
  try {
    const pub = decodeAddress(address)
    const disc = discriminator(pub)
    const friend = friends.find((f) => f.address === address)
    const pseudo = friend ? friend.pseudo : callsign(pub)
    return `${pseudo}#${disc}`
  } catch {
    return address.slice(0, 14)
  }
}

/** Présence d'un pair depuis le roster (unknown si inconnu). */
export function peerPresence(address: string, friends: Friend[]): string {
  return friends.find((f) => f.address === address)?.presence ?? 'unknown'
}
