import { get, set, del, keys } from 'idb-keyval'
import type { GeneratedImage } from '@/types'
import { MAX_HISTORY } from '@/constants'

const METADATA_KEY = 'drawai_metadata'
const IMAGE_PREFIX = 'drawai_img_'
const FAVORITES_KEY = 'drawai_favorites'

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

function getMetadataList(): ImageMetadata[] {
  const raw = localStorage.getItem(METADATA_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveMetadataList(list: readonly ImageMetadata[]): void {
  localStorage.setItem(METADATA_KEY, JSON.stringify(list))
}

function getFavoriteIds(): Set<string> {
  const raw = localStorage.getItem(FAVORITES_KEY)
  return new Set(raw ? JSON.parse(raw) : [])
}

function saveFavoriteIds(ids: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]))
}

export async function saveImage(image: GeneratedImage): Promise<void> {
  await set(IMAGE_PREFIX + image.id, image.imageData)

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

  const list = getMetadataList()
  const updated = [metadata, ...list].slice(0, MAX_HISTORY)
  saveMetadataList(updated)

  // Clean up old images from IndexedDB
  if (list.length >= MAX_HISTORY) {
    const removedItems = list.slice(MAX_HISTORY - 1)
    const favoriteIds = getFavoriteIds()
    for (const item of removedItems) {
      if (!favoriteIds.has(item.id)) {
        await del(IMAGE_PREFIX + item.id)
      }
    }
  }
}

export async function loadAllImages(): Promise<GeneratedImage[]> {
  const metadataList = getMetadataList()
  const favoriteIds = getFavoriteIds()

  const images: GeneratedImage[] = []
  for (const meta of metadataList) {
    const imageData = await get<string>(IMAGE_PREFIX + meta.id)
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

  const list = getMetadataList()
  const updated = list.map((m) =>
    m.id === id ? { ...m, isFavorite } : m
  )
  saveMetadataList(updated)

  return isFavorite
}

export async function deleteImage(id: string): Promise<void> {
  await del(IMAGE_PREFIX + id)
  const list = getMetadataList()
  saveMetadataList(list.filter((m) => m.id !== id))

  const favoriteIds = getFavoriteIds()
  favoriteIds.delete(id)
  saveFavoriteIds(favoriteIds)
}

export async function clearAllImages(): Promise<void> {
  const allKeys = await keys()
  for (const key of allKeys) {
    if (String(key).startsWith(IMAGE_PREFIX)) {
      await del(key)
    }
  }
  localStorage.removeItem(METADATA_KEY)
  localStorage.removeItem(FAVORITES_KEY)
}
