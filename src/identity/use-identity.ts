import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../shared/local-store'
import { callsign, encodeAddress, handle } from './address'
import { identityFromMnemonic, isValidMnemonic, newMnemonic } from './seed'
import type { Identity } from '../shared/types'

interface Loaded {
  identity: Identity
  mnemonic: string
}

/** Charge l'identité depuis la phrase stockée, ou en crée une nouvelle. */
async function loadOrCreate(): Promise<Loaded> {
  let mnemonic = loadJSON<string>('seed-phrase', '')
  if (!mnemonic || !isValidMnemonic(mnemonic)) {
    mnemonic = newMnemonic()
    saveJSON('seed-phrase', mnemonic)
  }
  const identity = await identityFromMnemonic(mnemonic)
  return { identity, mnemonic }
}

export interface IdentityState {
  identity: Identity | null
  address: string
  callsign: string
  pseudo: string
  handle: string
  mnemonic: string
  setPseudo: (next: string) => void
  importMnemonic: (words: string) => { ok: boolean; error?: string }
}

/** Identité persistante et portable — dérivée d'une phrase de récupération (BIP39). */
export function useIdentity(): IdentityState {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [mnemonic, setMnemonic] = useState('')
  const [pseudo, setPseudoState] = useState<string>(() => loadJSON<string>('pseudo', ''))

  useEffect(() => {
    loadOrCreate()
      .then(({ identity: id, mnemonic: m }) => { setIdentity(id); setMnemonic(m) })
      .catch((err) => console.error('[identity] load failed', err))
  }, [])

  const setPseudo = (next: string): void => {
    setPseudoState(next)
    saveJSON('pseudo', next)
  }

  const importMnemonic = (words: string): { ok: boolean; error?: string } => {
    const clean = words.trim().toLowerCase()
    if (!isValidMnemonic(clean)) return { ok: false, error: 'INVALID RECOVERY PHRASE' }
    saveJSON('seed-phrase', clean)
    saveJSON('pseudo', '')
    window.location.reload()
    return { ok: true }
  }

  const effectivePseudo = pseudo || (identity ? callsign(identity.publicKey) : '')
  return {
    identity,
    address: identity ? encodeAddress(identity.publicKey) : '',
    callsign: identity ? callsign(identity.publicKey) : '',
    pseudo: effectivePseudo,
    handle: identity ? handle(effectivePseudo, identity.publicKey) : '',
    mnemonic,
    setPseudo,
    importMnemonic,
  }
}
