export type ConnectionPhase =
  | 'idle'
  | 'generating-keys'
  | 'awaiting-peer'
  | 'handshaking'
  | 'secure'
  | 'lost'

export interface Identity {
  publicKey: Uint8Array
  privateKey: Uint8Array
  fingerprint: string
}

export interface SecureMessage {
  id: string
  author: 'self' | 'peer'
  body: string
  at: number
  cipherTag: string
}

export interface PeerNode {
  id: string
  label: string
  self: boolean
}
