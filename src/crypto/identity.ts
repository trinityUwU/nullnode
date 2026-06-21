import sodium from 'libsodium-wrappers'
import type { Identity } from '../shared/types'

let ready: Promise<void> | null = null

function ensureReady(): Promise<void> {
  if (!ready) ready = sodium.ready
  return ready
}

/** Short, human-readable fingerprint of a public key (HUD display). */
function deriveFingerprint(publicKey: Uint8Array): string {
  const hash = sodium.crypto_generichash(8, publicKey)
  const hex = sodium.to_hex(hash).toUpperCase()
  return hex.match(/.{1,4}/g)?.join(' ') ?? hex
}

/** Generate a fresh X25519 identity, fully local — keys never leave the device. */
export async function generateIdentity(): Promise<Identity> {
  try {
    await ensureReady()
    const pair = sodium.crypto_kx_keypair()
    return {
      publicKey: pair.publicKey,
      privateKey: pair.privateKey,
      fingerprint: deriveFingerprint(pair.publicKey),
    }
  } catch (err) {
    console.error('[crypto] identity generation failed', err)
    throw err
  }
}

export { ensureReady, deriveFingerprint }
