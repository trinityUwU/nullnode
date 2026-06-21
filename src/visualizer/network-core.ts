import * as THREE from 'three'

export const ACCENT = new THREE.Color('#00ff9d')
export const DIM = new THREE.Color('#0b9e68')

/** Fibonacci-sphere positions for orbiting peer nodes around the core. */
export function buildNodePositions(count: number, radius: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const jitter = 0.85 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.6
    out.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius * jitter))
  }
  return out
}

export interface ParticleBuffers {
  positions: Float32Array
  seeds: Float32Array
  scales: Float32Array
}

/** Random points inside a spherical shell, with per-point seed + scale. */
export function buildParticleShell(count: number, rMin: number, rMax: number): ParticleBuffers {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const scales = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3().randomDirection()
    const r = rMin + Math.random() * (rMax - rMin)
    dir.multiplyScalar(r).toArray(positions, i * 3)
    seeds[i] = Math.random()
    scales[i] = 0.4 + Math.random() * 1.8
  }
  return { positions, seeds, scales }
}

/** A curved control point for an organic center→node link. */
export function curveControl(node: THREE.Vector3): THREE.Vector3 {
  const mid = node.clone().multiplyScalar(0.5)
  const perp = new THREE.Vector3().randomDirection().multiplyScalar(node.length() * 0.22)
  return mid.add(perp)
}
