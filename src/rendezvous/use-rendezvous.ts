import { useCallback, useEffect, useRef, useState } from 'react'
import { decodeAddress } from '../identity/address'
import { RendezvousClient } from './rendezvous-client'
import { ensureSealReady, openSignal, sealSignal } from './sealed-signal'
import { openEnvelope, sealEnvelope, type SocialBody } from './social-envelope'
import { sealBackup, openBackup } from '../backup/backup-crypto'
import { collectBackupState, mergeBackupState } from '../backup/backup-sync'
import { loadJSON, saveJSON } from '../shared/local-store'
import type { Identity } from '../shared/types'
import type { SecureSession } from '../session/use-secure-session'
import type { RosterState } from '../roster/use-roster'
import type { Friend, FriendRequest } from '../roster/types'

const DEFAULT_RELAY = 'ws://127.0.0.1:8791'

interface Args {
  identity: Identity | null
  address: string
  pseudo: string
  mnemonic: string
  session: SecureSession
  roster: RosterState
}

const BACKUP_DEBOUNCE_MS = 2_000

/** Acheminer un signal WebRTC entrant (offer→answer / answer→apply) vers la session. */
async function routeSignal(
  from: string, payload: string, identity: Identity, session: SecureSession, client: RendezvousClient,
): Promise<void> {
  try {
    const body = openSignal(payload, identity)
    const peerPub = decodeAddress(from)
    if (body.kind === 'offer') {
      const answer = await session.respondToOffer(peerPub, body.sdp)
      client.signal(from, sealSignal({ kind: 'answer', sdp: answer }, peerPub))
    } else {
      await session.applyAnswer(body.sdp)
    }
  } catch (err) { console.error('[rendezvous] signal failed', err) }
}

export interface RendezvousState {
  relayOnline: boolean
  incoming: FriendRequest[]
  connectTo: (friend: Friend) => Promise<void>
  sendRequest: (address: string) => { ok: boolean; error?: string }
  acceptRequest: (req: FriendRequest) => void
  declineRequest: (req: FriendRequest) => void
}

/** Branche le relai : présence, connexion auto ami-à-ami, et demandes d'amis consenties. */
export function useRendezvous({ identity, address, pseudo, mnemonic, session, roster }: Args): RendezvousState {
  const clientRef = useRef<RendezvousClient | null>(null)
  const [relayOnline, setRelayOnline] = useState(false)
  const [incoming, setIncoming] = useState<FriendRequest[]>(() => loadJSON<FriendRequest[]>('requests', []))
  const live = useRef({ identity, session, roster, pseudo, address, mnemonic })
  live.current = { identity, session, roster, pseudo, address, mnemonic }

  useEffect(() => { saveJSON('requests', incoming) }, [incoming])

  const relayUrl = import.meta.env.VITE_RELAY_URL ?? DEFAULT_RELAY

  const handleEnvelope = useCallback((id: string, from: string, payload: string): void => {
    const { identity: id0, roster: r } = live.current
    clientRef.current?.ack([id])
    if (!id0) return
    try {
      const body = openEnvelope(payload, id0)
      applySocial(body, from, r, setIncoming)
    } catch (err) { console.error('[rendezvous] envelope failed', err) }
  }, [])

  // Pull au login : restaure roster/historique depuis le blob chiffré, puis recharge si fusion.
  const handleBackup = useCallback((blob: string | null): void => {
    const { mnemonic: m } = live.current
    if (!blob || !m) return
    void openBackup(blob, m)
      .then((state) => { if (state && mergeBackupState(state)) window.location.reload() })
      .catch((err) => console.error('[backup] restore failed', err))
  }, [])

  // Push debouncé : scelle l'état courant et l'envoie au relai (opaque).
  const pushBackup = useCallback((): void => {
    const { mnemonic: m } = live.current
    const client = clientRef.current
    if (!m || !client) return
    void sealBackup(collectBackupState(), m)
      .then((blob) => client.backupPut(blob))
      .catch((err) => console.error('[backup] push failed', err))
  }, [])

  useEffect(() => {
    if (!identity || !address) return
    let active = true
    ensureSealReady().then(() => {
      if (!active) return
      const client = new RendezvousClient(relayUrl, address, {
        onOpen: (online) => {
          setRelayOnline(true)
          online.forEach((a) => live.current.roster.setPresence(a, 'online'))
          client.backupGet()
        },
        onPresence: (a, s) => live.current.roster.setPresence(a, s),
        onSignal: (f, p) => {
          const c = live.current
          if (c.identity && clientRef.current) void routeSignal(f, p, c.identity, c.session, clientRef.current)
        },
        onEnvelope: handleEnvelope,
        onBackup: handleBackup,
        onClose: () => { setRelayOnline(false); live.current.roster.resetPresence() },
      })
      clientRef.current = client
      client.connect()
    }).catch((err) => console.error('[rendezvous] init failed', err))
    return () => { active = false; clientRef.current?.close(); clientRef.current = null }
  }, [identity, address, relayUrl, handleEnvelope, handleBackup])

  // Sauvegarde debouncée à chaque évolution du roster, de l'historique ou du pseudo.
  useEffect(() => {
    if (!relayOnline) return
    const timer = setTimeout(pushBackup, BACKUP_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [relayOnline, roster.friends, session.history, pseudo, pushBackup])

  const connectTo = useCallback(async (friend: Friend): Promise<void> => {
    const { identity: id0, session: s } = live.current
    if (!id0 || !clientRef.current) return
    try {
      const peerPub = decodeAddress(friend.address)
      const offer = await s.beginOffer(peerPub)
      clientRef.current.signal(friend.address, sealSignal({ kind: 'offer', sdp: offer }, peerPub))
    } catch (err) { console.error('[rendezvous] connect failed', err) }
  }, [])

  const sendRequest = useCallback((target: string): { ok: boolean; error?: string } => {
    const { roster: r, pseudo: p, address: self } = live.current
    const addr = target.trim()
    if (!addr) return { ok: false, error: 'EMPTY ADDRESS' }
    if (addr === self) return { ok: false, error: 'THAT IS YOUR OWN ADDRESS' }
    if (r.hasFriend(addr)) return { ok: false, error: 'ALREADY IN ROSTER' }
    try {
      const pub = decodeAddress(addr)
      clientRef.current?.relay(addr, sealEnvelope({ kind: 'friend_request', pseudo: p, address: self }, pub))
      return { ok: true }
    } catch { return { ok: false, error: 'INVALID NULLNODE ADDRESS' } }
  }, [])

  const acceptRequest = useCallback((req: FriendRequest): void => {
    const { roster: r, pseudo: p, address: self } = live.current
    r.addFriend(req.address, req.pseudo)
    try {
      const pub = decodeAddress(req.address)
      clientRef.current?.relay(req.address, sealEnvelope({ kind: 'friend_accept', pseudo: p, address: self }, pub))
    } catch (err) { console.error('[rendezvous] accept failed', err) }
    setIncoming((prev) => prev.filter((x) => x.address !== req.address))
  }, [])

  const declineRequest = useCallback((req: FriendRequest): void => {
    const { address: self } = live.current
    try {
      const pub = decodeAddress(req.address)
      clientRef.current?.relay(req.address, sealEnvelope({ kind: 'friend_decline', address: self }, pub))
    } catch (err) { console.error('[rendezvous] decline failed', err) }
    setIncoming((prev) => prev.filter((x) => x.address !== req.address))
  }, [])

  return { relayOnline, incoming, connectTo, sendRequest, acceptRequest, declineRequest }
}

/** Applique une enveloppe sociale entrante : requête en attente, ou acceptation réciproque. */
function applySocial(
  body: SocialBody, _from: string, roster: RosterState,
  setIncoming: React.Dispatch<React.SetStateAction<FriendRequest[]>>,
): void {
  if (body.kind === 'friend_request') {
    if (roster.hasFriend(body.address)) return
    setIncoming((prev) => prev.some((x) => x.address === body.address)
      ? prev
      : [...prev, { id: body.address, address: body.address, pseudo: body.pseudo, at: Date.now() }])
  } else if (body.kind === 'friend_accept') {
    roster.addFriend(body.address, body.pseudo)
  }
}
