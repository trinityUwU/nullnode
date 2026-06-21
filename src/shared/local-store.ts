/** Typed localStorage wrapper. Local-first persistence — nothing leaves the device. */
const PREFIX = 'nullnode.'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (err) {
    console.error('[store] load failed', key, err)
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (err) {
    console.error('[store] save failed', key, err)
  }
}
