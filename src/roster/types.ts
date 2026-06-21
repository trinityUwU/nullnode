export type Presence = 'online' | 'away' | 'offline' | 'unknown'

export interface Friend {
  id: string
  address: string
  pub: string
  alias: string
  pseudo: string
  callsign: string
  fingerprint: string
  verified: boolean
  presence: Presence
  addedAt: number
}

export interface FriendRequest {
  id: string
  address: string
  pseudo: string
  at: number
}
