import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ACCENT, DIM, buildNodePositions } from './network-core'
import type { ConnectionPhase } from '../shared/types'

const NODE_COUNT = 22
const RADIUS = 2.6

function Core({ active }: { active: boolean }): React.ReactElement {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.12
    ref.current.rotation.x += dt * 0.04
    const s = 1 + Math.sin(performance.now() / 600) * (active ? 0.06 : 0.02)
    ref.current.scale.setScalar(s)
  })
  return (
    <Icosahedron ref={ref} args={[1.1, 1]}>
      <meshBasicMaterial wireframe color={active ? ACCENT : DIM} transparent opacity={0.7} />
    </Icosahedron>
  )
}

function PeerNode({ position, lit }: { position: THREE.Vector3; lit: boolean }): React.ReactElement {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current) {
      // material is a union in r3f; we always assign a MeshBasicMaterial below.
      const m = ref.current.material as THREE.MeshBasicMaterial
      m.opacity = lit ? 0.9 : 0.25 + Math.sin(performance.now() / 400 + position.x) * 0.15
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={ACCENT} transparent />
    </mesh>
  )
}

function Tunnels({ nodes, secure }: { nodes: THREE.Vector3[]; secure: boolean }): React.ReactElement {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  return (
    <>
      {nodes.map((n, i) => (
        <Line
          key={i}
          points={[origin, n]}
          color={secure && i === 0 ? ACCENT : DIM}
          lineWidth={secure && i === 0 ? 2 : 0.5}
          transparent
          opacity={secure && i === 0 ? 0.9 : 0.18}
        />
      ))}
    </>
  )
}

function Rig(): React.ReactElement {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 6
    state.camera.position.z = Math.cos(state.clock.elapsedTime * 0.08) * 6
    state.camera.lookAt(0, 0, 0)
  })
  return <></>
}

export function NetworkScene({ phase }: { phase: ConnectionPhase }): React.ReactElement {
  const nodes = useMemo(() => buildNodePositions(NODE_COUNT, RADIUS), [])
  const active = phase === 'secure' || phase === 'handshaking'
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 6, 12]} />
      <Core active={active} />
      <Tunnels nodes={nodes} secure={phase === 'secure'} />
      {nodes.map((n, i) => (
        <PeerNode key={i} position={n} lit={phase === 'secure' && i === 0} />
      ))}
      <Rig />
      <EffectComposer>
        <Bloom intensity={active ? 1.4 : 0.7} luminanceThreshold={0.1} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
