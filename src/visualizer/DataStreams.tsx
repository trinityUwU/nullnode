import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import { ACCENT, DIM, curveControl } from './network-core'

const ORIGIN = new THREE.Vector3(0, 0, 0)
const PACKETS_PER_LINK = 2
const dummy = new THREE.Object3D()

function buildCurves(nodes: THREE.Vector3[]): THREE.QuadraticBezierCurve3[] {
  return nodes.map((n) => new THREE.QuadraticBezierCurve3(ORIGIN, curveControl(n), n))
}

/** Faint curved base links from the core to connected nodes. */
function BaseLinks({ curves, secure }: { curves: THREE.QuadraticBezierCurve3[]; secure: boolean }): React.ReactElement {
  return (
    <>
      {curves.map((c, i) => (
        <QuadraticBezierLine
          key={i}
          start={c.v0} end={c.v2} mid={c.v1}
          color={secure && i === 0 ? ACCENT : DIM}
          lineWidth={secure && i === 0 ? 1.6 : 0.4}
          transparent opacity={secure && i === 0 ? 0.8 : 0.16}
        />
      ))}
    </>
  )
}

/** Glowing data packets that travel along each curved link. */
function Packets({ curves, secure }: { curves: THREE.QuadraticBezierCurve3[]; secure: boolean }): React.ReactElement {
  const ref = useRef<THREE.InstancedMesh>(null)
  const total = curves.length * PACKETS_PER_LINK

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < curves.length; i++) {
      for (let k = 0; k < PACKETS_PER_LINK; k++) {
        const idx = i * PACKETS_PER_LINK + k
        const speed = secure && i === 0 ? 0.5 : 0.16
        const prog = ((t * speed + k / PACKETS_PER_LINK + i * 0.13) % 1)
        curves[i].getPoint(prog, dummy.position)
        const fade = Math.sin(prog * Math.PI)
        dummy.scale.setScalar((secure && i === 0 ? 0.075 : 0.04) * fade)
        dummy.updateMatrix()
        ref.current.setMatrixAt(idx, dummy.matrix)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}

/** Pulsing node markers at each peer position. */
function NodeMarkers({ nodes, litIndex }: { nodes: THREE.Vector3[]; litIndex: number }): React.ReactElement {
  const ref = useRef<THREE.InstancedMesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    nodes.forEach((n, i) => {
      const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.45
      dummy.position.copy(n)
      dummy.scale.setScalar((i === litIndex ? 0.09 : 0.04) * (i === litIndex ? 1 : pulse))
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}

interface Props {
  nodes: THREE.Vector3[]
  connected: THREE.Vector3[]
  secure: boolean
}

/** Connections + traveling packets + node markers. */
export function DataStreams({ nodes, connected, secure }: Props): React.ReactElement {
  const curves = useMemo(() => buildCurves(connected), [connected])
  return (
    <>
      <BaseLinks curves={curves} secure={secure} />
      <Packets curves={curves} secure={secure} />
      <NodeMarkers nodes={nodes} litIndex={secure ? 0 : -1} />
    </>
  )
}
