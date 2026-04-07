import { get, set, del, keys } from 'idb-keyval'
import type { GeneratedImage } from '@/types'
import { MAX_HISTORY } from '@/constants'
import {
  isDiskStorageAvailable,
  readMeta,
  writeMeta,
  writeImage as diskWriteImage,
  readImage as diskReadImage,
  deleteImage as diskDeleteImage,
} from '@/services/diskStorage'

const COLLECTION = 'gallery'
const IMAGE_PREFIX = 'drawai_img_'
const METADATA_KEY = 'drawai_metadata'
const FAVORITES_KEY = 'drawai_favorites'

// ── Metadata types ──

interface ImageMetadata {
  readonly id: string
  readonly prompt: string
  readonly model: string
  readonly aspectRatio: string
  readonly imageSize: string
  readonly textResponse?: string
  readonly createdAt: number
  readonly isFavorite: boolean
}

// ── LocalStorage helpers (fallback) ──

function getMetadataListLocal(): ImageMetadata[] {
  const raw = localStorage.getItem(METADATA_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveMetadataListLocal(list: readonly ImageMetadata[]): void {
  localStorage.setItem(METADATA_KEY, JSON.stringify(list))
}

function getFavoriteIds(): Set<string> {
  const raw = localStorage.getItem(FAVORITES_KEY)
  return new Set(raw ? JSON.parse(raw) : [])
}

function saveFavoriteIds(ids: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]))
}

// ── Metadata read/write with disk preference ──

async function getMetadataList(): Promise<ImageMetadata[]> {
  if (await isDiskStorageAvailable()) {
    const diskMeta = await readMeta<ImageMetadata[]>(COLLECTION)
    if (diskMeta) return diskMeta
  }
  return getMetadataListLocal()
}

async function saveMetadataList(list: readonly ImageMetadata[]): Promise<void> {
  // Always write to localStorage as fallback
  saveMetadataListLocal(list)
  if (await isDiskStorageAvailable()) {
    await writeMeta(COLLECTION, list)
  }
}

// ── Image read/write with disk preference ──

async function writeImageData(id: string, dataUrl: string): Promise<void> {
  if (await isDiskStorageAvailable()) {
    await diskWriteImage(COLLECTION, `${id}.png`, dataUrl)
  }
  // Always keep IndexedDB as fallback
  await set(IMAGE_PREFIX + id, dataUrl)
}

async function readImageData(id: string): Promise<string | null> {
  if (await isDiskStorageAvailable()) {
    const diskData = await diskReadImage(COLLECTION, `${id}.png`)
    if (diskData) return diskData
  }
  return (await get<string>(IMAGE_PREFIX + id)) ?? null
}

async function deleteImageData(id: string): Promise<void> {
  if (await isDiskStorageAvailable()) {
    await diskDeleteImage(COLLECTION, `${id}.png`)
  }
  await del(IMAGE_PREFIX + id)
}

// ── Public API ──

export async function saveImage(image: GeneratedImage): Promise<void> {
  await writeImageData(image.id, image.imageData)

  const metadata: ImageMetadata = {
    id: image.id,
    prompt: image.prompt,
    model: image.model,
    aspectRatio: image.aspectRatio,
    imageSize: image.imageSize,
    textResponse: image.textResponse,
    createdAt: image.createdAt,
    isFavorite: image.isFavorite,
  }

  const list = await getMetadataList()
  const updated = [metadata, ...list].slice(0, MAX_HISTORY)
  await saveMetadataList(updated)

  // Clean up old images
  if (list.length >= MAX_HISTORY) {
    const removedItems = list.slice(MAX_HISTORY - 1)
    const favoriteIds = getFavoriteIds()
    for (const item of removedItems) {
      if (!favoriteIds.has(item.id)) {
        await deleteImageData(item.id)
      }
    }
  }
}

export async function loadAllImages(): Promise<GeneratedImage[]> {
  const metadataList = await getMetadataList()
  const favoriteIds = getFavoriteIds()

  const images: GeneratedImage[] = []
  for (const meta of metadataList) {
    const imageData = await readImageData(meta.id)
    if (imageData) {
      images.push({
        ...meta,
        imageData,
        isFavorite: favoriteIds.has(meta.id),
      } as GeneratedImage)
    }
  }
  return images
}

export function toggleFavorite(id: string): boolean {
  const favoriteIds = getFavoriteIds()
  const isFavorite = !favoriteIds.has(id)

  if (isFavorite) {
    favoriteIds.add(id)
  } else {
    favoriteIds.delete(id)
  }
  saveFavoriteIds(favoriteIds)

  // Sync metadata (fire and forget)
  getMetadataList().then((list) => {
    const updated = list.map((m) =>
      m.id === id ? { ...m, isFavorite } : m,
    )
    saveMetadataList(updated)
  })

  return isFavorite
}

export async function deleteImage(id: string): Promise<void> {
  await deleteImageData(id)

  const list = await getMetadataList()
  await saveMetadataList(list.filter((m) => m.id !== id))

  const favoriteIds = getFavoriteIds()
  favoriteIds.delete(id)
  saveFavoriteIds(favoriteIds)
}

export async function clearAllImages(): Promise<void> {
  // Clear IndexedDB
  const allKeys = await keys()
  for (const key of allKeys) {
    if (String(key).startsWith(IMAGE_PREFIX)) {
      await del(key)
    }
  }

  // Clear disk
  const list = await getMetadataList()
  if (await isDiskStorageAvailable()) {
    for (const meta of list) {
      await diskDeleteImage(COLLECTION, `${meta.id}.png`)
    }
    await writeMeta(COLLECTION, [])
  }

  localStorage.removeItem(METADATA_KEY)
  localStorage.removeItem(FAVORITES_KEY)
}
