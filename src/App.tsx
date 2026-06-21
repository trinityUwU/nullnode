import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BootSequence } from './boot/BootSequence'
import { NetworkScene } from './visualizer/NetworkScene'
import { HudOverlay } from './hud/HudOverlay'
import { CommsConsole } from './comms/CommsConsole'
import { NetworkPanel } from './roster/NetworkPanel'
import { useIdentity } from './identity/use-identity'
import { useRoster } from './roster/use-roster'
import { useSecureSession } from './session/use-secure-session'
import { useRendezvous } from './rendezvous/use-rendezvous'

export function App(): React.ReactElement {
  const [booted, setBooted] = useState(false)
  const identity = useIdentity()
  const roster = useRoster(identity.address || null)
  const session = useSecureSession(identity.identity)
  const rendezvous = useRendezvous({ identity: identity.identity, address: identity.address, session, roster })

  return (
    <main className="relative h-full w-full overflow-hidden">
      <div className="grid-backdrop absolute inset-0 opacity-60" />
      <div className="absolute inset-0">
        <NetworkScene phase={session.phase} />
      </div>

      <HudOverlay
        selfFingerprint={identity.identity?.fingerprint ?? ''}
        peerFingerprint={session.peerFingerprint}
        phase={session.phase}
      />

      <div className="absolute inset-0 flex items-center justify-between gap-8 px-[5vw] py-24">
        <NetworkPanel
          identity={identity}
          roster={roster}
          relayOnline={rendezvous.relayOnline}
          onConnect={(f) => void rendezvous.connectTo(f)}
        />
        <CommsConsole session={session} />
      </div>

      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>
    </main>
  )
}
