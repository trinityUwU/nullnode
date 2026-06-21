import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BootSequence } from './boot/BootSequence'
import { NetworkScene } from './visualizer/NetworkScene'
import { HudOverlay } from './hud/HudOverlay'
import { CommsConsole } from './comms/CommsConsole'
import { useSecureSession } from './session/use-secure-session'

export function App(): React.ReactElement {
  const [booted, setBooted] = useState(false)
  const session = useSecureSession()

  return (
    <main className="relative h-full w-full overflow-hidden">
      <div className="grid-backdrop absolute inset-0 opacity-60" />
      <div className="absolute inset-0">
        <NetworkScene phase={session.phase} />
      </div>

      <HudOverlay
        selfFingerprint={session.identity?.fingerprint ?? ''}
        peerFingerprint={session.peerFingerprint}
        phase={session.phase}
      />

      <div className="absolute inset-0 flex items-center justify-end px-[6vw]">
        <CommsConsole session={session} />
      </div>

      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>
    </main>
  )
}
