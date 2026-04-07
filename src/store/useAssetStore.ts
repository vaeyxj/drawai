import { create } from 'zustand'
import type { GameAsset, AssetCategory } from '@/types'
import {
  isDiskStorageAvailable,
  readMeta,
  writeMeta,
  writeImage,
  readImage,
  deleteImage as diskDeleteImage,
} from '@/services/diskStorage'

const COLLECTION = 'assets'
const LOCAL_KEY = 'drawai_assets_meta'

// ── Metadata (no image data, just references) ──

interface AssetMetadata {
  readonly id: string
  readonly name: string
  readonly category: AssetCategory
  readonly sourceImageId: string | null
  readonly hasTransparent: boolean
  readonly createdAt: number
}

function toMeta(a: GameAsset): AssetMetadata {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    sourceImageId: a.sourceImageId,
    hasTransparent: a.transparentDataUrl !== null,
    createdAt: a.createdAt,
  }
}

// ── Local fallback ──

function getLocalMeta(): AssetMetadata[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalMeta(list: readonly AssetMetadata[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

// ── Disk-aware metadata ──

async function loadMetaList(): Promise<AssetMetadata[]> {
  if (await isDiskStorageAvailable()) {
    const disk = await readMeta<AssetMetadata[]>(COLLECTION)
    if (disk) return disk
  }
  return getLocalMeta()
}

async function saveMetaList(list: readonly AssetMetadata[]): Promise<void> {
  setLocalMeta(list)
  if (await isDiskStorageAvailable()) {
    await writeMeta(COLLECTION, list)
  }
}

// ── Image I/O ──

async function saveAssetImage(id: string, suffix: string, dataUrl: string): Promise<void> {
  if (await isDiskStorageAvailable()) {
    await writeImage(COLLECTION, `${id}${suffix}.png`, dataUrl)
  }
}

async function loadAssetImage(id: string, suffix: string): Promise<string | null> {
  if (await isDiskStorageAvailable()) {
    return readImage(COLLECTION, `${id}${suffix}.png`)
  }
  return null
}

async function removeAssetImages(id: string, hasTransparent: boolean): Promise<void> {
  if (await isDiskStorageAvailable()) {
    await diskDeleteImage(COLLECTION, `${id}_original.png`)
    if (hasTransparent) {
      await diskDeleteImage(COLLECTION, `${id}_transparent.png`)
    }
  }
}

// ── Store ──

interface AssetState {
  readonly assets: readonly GameAsset[]
  readonly filterCategory: AssetCategory | 'all'
  readonly isLoading: boolean

  loadAssets: () => Promise<void>
  addAsset: (asset: GameAsset) => Promise<void>
  updateAsset: (id: string, updates: Partial<Pick<GameAsset, 'name' | 'category' | 'transparentDataUrl'>>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  setFilterCategory: (category: AssetCategory | 'all') => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  filterCategory: 'all',
  isLoading: false,

  loadAssets: async () => {
    set({ isLoading: true })
    try {
      const metaList = await loadMetaList()

      // Load image data for each asset
      const assets: GameAsset[] = []
      for (const meta of metaList) {
        const originalDataUrl = await loadAssetImage(meta.id, '_original')
        if (!originalDataUrl) continue

        const transparentDataUrl = meta.hasTransparent
          ? await loadAssetImage(meta.id, '_transparent')
          : null

        assets.push({
          id: meta.id,
          name: meta.name,
          category: meta.category,
          originalDataUrl,
          transparentDataUrl,
          sourceImageId: meta.sourceImageId,
          createdAt: meta.createdAt,
        })
      }

      set({ assets, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addAsset: async (asset) => {
    // Save images to disk
    await saveAssetImage(asset.id, '_original', asset.originalDataUrl)
    if (asset.transparentDataUrl) {
      await saveAssetImage(asset.id, '_transparent', asset.transparentDataUrl)
    }

    const updated = [asset, ...get().assets]
    await saveMetaList(updated.map(toMeta))
    set({ assets: updated })
  },

  updateAsset: async (id, updates) => {
    // If transparent image is being set, save to disk
    if (updates.transparentDataUrl) {
      await saveAssetImage(id, '_transparent', updates.transparentDataUrl)
    }

    const updated = get().assets.map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    )
    await saveMetaList(updated.map(toMeta))
    set({ assets: updated })
  },

  deleteAsset: async (id) => {
    const asset = get().assets.find((a) => a.id === id)
    if (asset) {
      await removeAssetImages(id, asset.transparentDataUrl !== null)
    }

    const updated = get().assets.filter((a) => a.id !== id)
    await saveMetaList(updated.map(toMeta))
    set({ assets: updated })
  },

  setFilterCategory: (filterCategory) => set({ filterCategory }),
}))
