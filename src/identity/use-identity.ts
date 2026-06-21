import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../shared/local-store'
import { callsign, encodeAddress, handle } from './address'
import { identityFromMnemonic, isValidMnemonic } from './seed'
import type { Identity } from '../shared/types'

interface Loaded {
  identity: Identity
  mnemonic: string
}

export type AuthStatus = 'loading' | 'anon' | 'ready'

/** Charge l'identité depuis la phrase stockée. Aucune création implicite (login/register requis). */
async function loadExisting(): Promise<Loaded | null> {
  const mnemonic = loadJSON<string>('seed-phrase', '')
  if (!mnemonic || !isValidMnemonic(mnemonic)) return null
  const identity = await identityFromMnemonic(mnemonic)
  return { identity, mnemonic }
}

export interface IdentityState {
  status: AuthStatus
  identity: Identity | null
  address: string
  callsign: string
  pseudo: string
  handle: string
  mnemonic: string
  setPseudo: (next: string) => void
  importMnemonic: (words: string) => { ok: boolean; error?: string }
  register: (words: string, name: string) => { ok: boolean; error?: string }
}

/** Identité persistante et portable — dérivée d'une phrase de récupération (BIP39). */
export function useIdentity(): IdentityState {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [mnemonic, setMnemonic] = useState('')
  const [pseudo, setPseudoState] = useState<string>(() => loadJSON<string>('pseudo', ''))

  useEffect(() => {
    loadExisting()
      .then((res) => {
        if (res) { setIdentity(res.identity); setMnemonic(res.mnemonic); setStatus('ready') }
        else setStatus('anon')
      })
      .catch((err) => { console.error('[identity] load failed', err); setStatus('anon') })
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

  const register = (words: string, name: string): { ok: boolean; error?: string } => {
    const clean = words.trim().toLowerCase()
    if (!isValidMnemonic(clean)) return { ok: false, error: 'INVALID PHRASE' }
    saveJSON('seed-phrase', clean)
    saveJSON('pseudo', name.trim())
    window.location.reload()
    return { ok: true }
  }

  const effectivePseudo = pseudo || (identity ? callsign(identity.publicKey) : '')
  return {
    status,
    identity,
    address: identity ? encodeAddress(identity.publicKey) : '',
    callsign: identity ? callsign(identity.publicKey) : '',
    pseudo: effectivePseudo,
    handle: identity ? handle(effectivePseudo, identity.publicKey) : '',
    mnemonic,
    setPseudo,
    importMnemonic,
    register,
  }
}
