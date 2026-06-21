export interface BootLine {
  text: string
  status?: 'ok' | 'work'
}

export const BOOT_LINES: BootLine[] = [
  { text: 'NULLNODE // secure peer link v0.1' },
  { text: 'initializing libsodium runtime', status: 'work' },
  { text: 'entropy pool seeded', status: 'ok' },
  { text: 'generating X25519 identity', status: 'work' },
  { text: 'keypair sealed in volatile memory', status: 'ok' },
  { text: 'no signaling server — dead-drop mode', status: 'ok' },
  { text: 'no external relay — sovereign transport', status: 'ok' },
  { text: 'awaiting operator', status: 'ok' },
]
