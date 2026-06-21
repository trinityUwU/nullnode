import { useEffect, useState } from 'react'
import sodium from 'libsodium-wrappers'
import { ensureReady, deriveFingerprint } from '../crypto/identity'
import { generateIdentity } from '../crypto/identity'
import { loadJSON, saveJSON } from '../shared/local-store'
import { callsign, encodeAddress } from './address'
import type { Identity } from '../shared/types'

interface StoredKeys {
  priv: string
  pub: string
}

function restore(stored: StoredKeys): Identity {
  const publicKey = sodium.from_base64(stored.pub)
  const privateKey = sodium.from_base64(stored.priv)
  return { publicKey, privateKey, fingerprint: deriveFingerprint(publicKey) }
}

async function loadOrCreate(): Promise<Identity> {
  await ensureReady()
  const stored = loadJSON<StoredKeys | null>('identity', null)
  if (stored) return restore(stored)
  const fresh = await generateIdentity()
  saveJSON('identity', { priv: sodium.to_base64(fresh.privateKey), pub: sodium.to_base64(fresh.publicKey) })
  return fresh
}

export interface IdentityState {
  identity: Identity | null
  address: string
  callsign: string
}

/** Persistent network identity — the keypair IS your address, stable across sessions. */
export function useIdentity(): IdentityState {
  const [identity, setIdentity] = useState<Identity | null>(null)

  useEffect(() => {
    loadOrCreate().then(setIdentity).catch((err) => console.error('[identity] load failed', err))
  }, [])

  return {
    identity,
    address: identity ? encodeAddress(identity.publicKey) : '',
    callsign: identity ? callsign(identity.publicKey) : '',
  }
}
