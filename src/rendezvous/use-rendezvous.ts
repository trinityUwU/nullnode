import { useCallback, useEffect, useRef, useState } from 'react'
import { decodeAddress } from '../identity/address'
import { RendezvousClient } from './rendezvous-client'
import { ensureSealReady, openSignal, sealSignal } from './sealed-signal'
import type { Identity } from '../shared/types'
import type { SecureSession } from '../session/use-secure-session'
import type { RosterState } from '../roster/use-roster'
import type { Friend } from '../roster/types'

const DEFAULT_RELAY = 'ws://127.0.0.1:8791'

interface Args {
  identity: Identity | null
  address: string
  session: SecureSession
  roster: RosterState
}

/** Acheminer un signal entrant (offer→answer / answer→apply) vers la session. */
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
  connectTo: (friend: Friend) => Promise<void>
}

/** Branche le relai de rendez-vous : présence + connexion auto ami-à-ami. */
export function useRendezvous({ identity, address, session, roster }: Args): RendezvousState {
  const clientRef = useRef<RendezvousClient | null>(null)
  const [relayOnline, setRelayOnline] = useState(false)
  const live = useRef({ identity, session, roster })
  live.current = { identity, session, roster }

  const relayUrl = import.meta.env.VITE_RELAY_URL ?? DEFAULT_RELAY

  useEffect(() => {
    if (!identity || !address) return
    let active = true
    ensureSealReady()
      .then(() => {
        if (!active) return
        const client = new RendezvousClient(relayUrl, address, {
          onOpen: (online) => { setRelayOnline(true); online.forEach((a) => live.current.roster.setPresence(a, 'online')) },
          onPresence: (a, s) => live.current.roster.setPresence(a, s),
          onSignal: (from, payload) => {
            const c = live.current
            if (c.identity && clientRef.current) void routeSignal(from, payload, c.identity, c.session, clientRef.current)
          },
          onClose: () => { setRelayOnline(false); live.current.roster.resetPresence() },
        })
        clientRef.current = client
        client.connect()
      })
      .catch((err) => console.error('[rendezvous] init failed', err))
    return () => { active = false; clientRef.current?.close(); clientRef.current = null }
  }, [identity, address, relayUrl])

  const connectTo = useCallback(async (friend: Friend): Promise<void> => {
    const { identity: id, session: sess } = live.current
    if (!id || !clientRef.current) return
    try {
      const peerPub = decodeAddress(friend.address)
      const offer = await sess.beginOffer(peerPub)
      clientRef.current.signal(friend.address, sealSignal({ kind: 'offer', sdp: offer }, peerPub))
    } catch (err) { console.error('[rendezvous] connect failed', err) }
  }, [])

  return { relayOnline, connectTo }
}
