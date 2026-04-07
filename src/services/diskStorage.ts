/**
 * Client-side API for the local disk storage plugin.
 * Falls back to in-memory noop when the storage server is unavailable.
 */

interface StorageResponse<T = unknown> {
  readonly ok: boolean
  readonly data?: T
  readonly error?: string
}

let _available: boolean | null = null

/** Check if the storage server is reachable */
export async function isDiskStorageAvailable(): Promise<boolean> {
  if (_available !== null) return _available
  try {
    const res = await fetch('/storage/health')
    const json: StorageResponse = await res.json()
    _available = json.ok === true
  } catch {
    _available = false
  }
  return _available
}

/** Read metadata JSON for a collection */
export async function readMeta<T>(collection: string): Promise<T | null> {
  try {
    const res = await fetch(`/storage/meta/${collection}`)
    const json: StorageResponse<T> = await res.json()
    return json.ok ? (json.data ?? null) : null
  } catch {
    return null
  }
}

/** Write metadata JSON for a collection */
export async function writeMeta<T>(collection: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`/storage/meta/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json: StorageResponse = await res.json()
    return json.ok === true
  } catch {
    return false
  }
}

/** Write an image (data URL) to disk */
export async function writeImage(collection: string, name: string, dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`/storage/image/${collection}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: dataUrl,
    })
    const json: StorageResponse = await res.json()
    return json.ok === true
  } catch {
    return false
  }
}

/** Read an image from disk, returns data URL */
export async function readImage(collection: string, name: string): Promise<string | null> {
  try {
    const res = await fetch(`/storage/image/${collection}/${name}`)
    const json: StorageResponse<string> = await res.json()
    return json.ok ? (json.data ?? null) : null
  } catch {
    return null
  }
}

/** Delete an image from disk */
export async function deleteImage(collection: string, name: string): Promise<boolean> {
  try {
    const res = await fetch(`/storage/image/${collection}/${name}`, {
      method: 'DELETE',
    })
    const json: StorageResponse = await res.json()
    return json.ok === true
  } catch {
    return false
  }
}
