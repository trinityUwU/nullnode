import * as THREE from 'three'

/** Deterministic positions for orbiting peer nodes around the core. */
export function buildNodePositions(count: number, radius: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    out.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius))
  }
  return out
}

export const ACCENT = new THREE.Color('#00ff9d')
export const DIM = new THREE.Color('#0b9e68')
