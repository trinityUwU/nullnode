import sodium from 'libsodium-wrappers'

const PREFIX = 'null:'
const VARIANT = () => sodium.base64_variants.URLSAFE_NO_PADDING

// 64-word callsign list — a friendly, human-recognizable label for a public key.
const WORDS = [
  'ARC', 'BOLT', 'CIPHER', 'DELTA', 'ECHO', 'FLUX', 'GLYPH', 'HALO',
  'IRON', 'JADE', 'KILO', 'LUMEN', 'MIRAGE', 'NOVA', 'ONYX', 'PULSE',
  'QUARTZ', 'RIFT', 'SABLE', 'TERRA', 'UMBRA', 'VECTOR', 'WRAITH', 'XENON',
  'YOKE', 'ZEPHYR', 'ASH', 'BRINE', 'CREST', 'DUSK', 'EMBER', 'FROST',
  'GROVE', 'HOLLOW', 'IGNIS', 'JET', 'KORE', 'LATCH', 'MARROW', 'NULL',
  'ORBIT', 'PRISM', 'QUILL', 'RAVEN', 'SLATE', 'TIDE', 'USHER', 'VIGIL',
  'WARDEN', 'XYLO', 'YARROW', 'ZINC', 'ATLAS', 'BASTION', 'CINDER', 'DRIFT',
  'ELM', 'FORGE', 'GALE', 'HEX', 'INDIGO', 'JOLT', 'KESTREL', 'LOOM',
]

/** Encode a public key into the shareable NULLNODE address. */
export function encodeAddress(publicKey: Uint8Array): string {
  return PREFIX + sodium.to_base64(publicKey, VARIANT())
}

/** Decode + validate a NULLNODE address back into a public key. */
export function decodeAddress(address: string): Uint8Array {
  const body = address.trim().replace(PREFIX, '')
  const key = sodium.from_base64(body, VARIANT())
  if (key.length !== sodium.crypto_kx_PUBLICKEYBYTES) throw new Error('INVALID_ADDRESS')
  return key
}

/** Derive a stable, friendly 3-word callsign from a public key (display only). */
export function callsign(publicKey: Uint8Array): string {
  const hash = sodium.crypto_generichash(6, publicKey)
  return [0, 2, 4].map((i) => WORDS[hash[i] % WORDS.length]).join('-')
}
