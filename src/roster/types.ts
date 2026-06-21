export type Presence = 'online' | 'away' | 'offline' | 'unknown'

export interface Friend {
  id: string
  address: string
  pub: string
  alias: string
  callsign: string
  fingerprint: string
  verified: boolean
  presence: Presence
  addedAt: number
}
