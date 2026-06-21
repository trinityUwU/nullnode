import { useCallback, useEffect, useRef, useState } from 'react'
import { deriveSession, open, seal, type SessionKeys } from '../crypto/encryption'
import { PeerLink } from '../transport/peer-link'
import { decodeDrop, encodeDrop } from '../transport/dead-drop'
import type { ConnectionPhase, Identity, SecureMessage } from '../shared/types'

function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export interface SecureSession {
  phase: ConnectionPhase
  messages: SecureMessage[]
  localDrop: string
  peerFingerprint: string
  hostSession: () => Promise<void>
  joinSession: (offerCode: string) => Promise<void>
  completeSession: (answerCode: string) => Promise<void>
  sendMessage: (body: string) => void
}

/** Drives one secure channel, built on the persistent network identity. */
export function useSecureSession(identity: Identity | null): SecureSession {
  const [phase, setPhase] = useState<ConnectionPhase>('generating-keys')
  const [messages, setMessages] = useState<SecureMessage[]>([])
  const [localDrop, setLocalDrop] = useState('')
  const [peerFingerprint, setPeerFingerprint] = useState('')

  const linkRef = useRef<PeerLink | null>(null)
  const keysRef = useRef<SessionKeys | null>(null)
  const identityRef = useRef<Identity | null>(null)

  useEffect(() => {
    if (identity) { identityRef.current = identity; setPhase('idle') }
    return () => linkRef.current?.close()
  }, [identity])

  const handleIncoming = useCallback((raw: string): void => {
    if (!keysRef.current) return
    try {
      const body = open(keysRef.current, raw)
      setMessages((prev) => [...prev, {
        id: newId(), author: 'peer', body, at: Date.now(), cipherTag: raw.slice(-4).toUpperCase(),
      }])
    } catch (err) { console.error('[session] decrypt failed', err) }
  }, [])

  const handleState = useCallback((isOpen: boolean): void => {
    setPhase(isOpen ? 'secure' : 'lost')
  }, [])

  const link = useCallback((): PeerLink => {
    const l = new PeerLink(handleState, handleIncoming)
    linkRef.current = l
    return l
  }, [handleState, handleIncoming])

  const hostSession = useCallback(async (): Promise<void> => {
    setPhase('awaiting-peer')
    const offer = await link().createOffer()
    setLocalDrop(encodeDrop('offer', offer, identityRef.current!.publicKey))
  }, [link])

  const joinSession = useCallback(async (offerCode: string): Promise<void> => {
    setPhase('handshaking')
    const drop = decodeDrop(offerCode)
    keysRef.current = await deriveSession(identityRef.current!, drop.pub, false)
    setPeerFingerprint(keysRef.current.peerFingerprint)
    const answer = await link().acceptOffer(drop.sdp)
    setLocalDrop(encodeDrop('answer', answer, identityRef.current!.publicKey))
  }, [link])

  const completeSession = useCallback(async (answerCode: string): Promise<void> => {
    setPhase('handshaking')
    const drop = decodeDrop(answerCode)
    keysRef.current = await deriveSession(identityRef.current!, drop.pub, true)
    setPeerFingerprint(keysRef.current.peerFingerprint)
    await linkRef.current!.acceptAnswer(drop.sdp)
  }, [])

  const sendMessage = useCallback((body: string): void => {
    if (!keysRef.current || !body.trim()) return
    const { payload, tag } = seal(keysRef.current, body)
    linkRef.current?.send(payload)
    setMessages((prev) => [...prev, {
      id: newId(), author: 'self', body, at: Date.now(), cipherTag: tag,
    }])
  }, [])

  return {
    phase, messages, localDrop, peerFingerprint,
    hostSession, joinSession, completeSession, sendMessage,
  }
}
