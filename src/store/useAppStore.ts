import { create } from 'zustand'
import type { ModelId, AspectRatio, ImageSize, GeneratedImage, ToastMessage, ReferenceImage } from '@/types'
import { generateImage } from '@/services/api'
import { ASSET_MODE_PROMPT_SUFFIX, ASSET_PRESETS } from '@/constants/assetPresets'
import { saveImage, loadAllImages, toggleFavorite as toggleFav, deleteImage as delImage, clearAllImages } from '@/utils/storage'

interface AppState {
  prompt: string
  model: ModelId
  aspectRatio: AspectRatio
  imageSize: ImageSize
  isGenerating: boolean
  error: string | null
  currentImage: GeneratedImage | null
  history: GeneratedImage[]
  toasts: ToastMessage[]
  abortController: AbortController | null
  assetMode: boolean
  assetPresetId: string | null
  referenceImage: ReferenceImage | null

  setPrompt: (prompt: string) => void
  setModel: (model: ModelId) => void
  setAspectRatio: (ratio: AspectRatio) => void
  setImageSize: (size: ImageSize) => void
  setAssetMode: (enabled: boolean) => void
  setAssetPresetId: (id: string | null) => void
  setReferenceImage: (image: ReferenceImage | null) => void
  generate: () => Promise<void>
  cancelGeneration: () => void
  toggleFavorite: (id: string) => void
  deleteFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  loadFromStorage: () => Promise<void>
  addToast: (type: ToastMessage['type'], message: string) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  prompt: '',
  model: 'gemini-3-pro-image-preview',
  aspectRatio: '1:1',
  imageSize: '1k',
  isGenerating: false,
  error: null,
  currentImage: null,
  history: [],
  toasts: [],
  abortController: null,
  assetMode: false,
  assetPresetId: null,
  referenceImage: null,

  setPrompt: (prompt) => set({ prompt }),
  setModel: (model) => set({ model }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setImageSize: (imageSize) => set({ imageSize }),
  setAssetMode: (assetMode) => set({ assetMode, assetPresetId: assetMode ? get().assetPresetId : null }),
  setAssetPresetId: (assetPresetId) => set({ assetPresetId }),
  setReferenceImage: (referenceImage) => set({ referenceImage }),

  generate: async () => {
    const { prompt, model, aspectRatio, imageSize, assetMode, assetPresetId, referenceImage } = get()
    if (!prompt.trim()) {
      get().addToast('error', '请输入描述文字')
      return
    }

    // Build final prompt with asset mode enhancements
    let finalPrompt = prompt.trim()
    if (assetMode) {
      const preset = assetPresetId
        ? ASSET_PRESETS.find((p) => p.id === assetPresetId)
        : null
      if (preset) {
        finalPrompt = `${finalPrompt}\n\n${preset.promptSuffix}`
      } else {
        finalPrompt = `${finalPrompt}\n\n${ASSET_MODE_PROMPT_SUFFIX}`
      }
    }

    const controller = new AbortController()
    set({ isGenerating: true, error: null, abortController: controller })

    try {
      const result = await generateImage(
        {
          prompt: finalPrompt,
          model,
          aspectRatio,
          imageSize,
          referenceImage: referenceImage ?? undefined,
        },
        controller.signal,
      )

      const image: GeneratedImage = {
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        model,
        aspectRatio,
        imageSize,
        imageData: result.imageData,
        textResponse: result.textResponse ?? undefined,
        createdAt: Date.now(),
        isFavorite: false,
      }

      await saveImage(image)

      set((state) => ({
        isGenerating: false,
        currentImage: image,
        history: [image, ...state.history],
        abortController: null,
      }))
      get().addToast('success', '图片生成成功')
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        set({ isGenerating: false, abortController: null })
        get().addToast('info', '已取消生成')
        return
      }
      const message = (err as Error).message || '生成失败'
      set({ isGenerating: false, error: message, abortController: null })
      get().addToast('error', message)
    }
  },

  cancelGeneration: () => {
    const { abortController } = get()
    abortController?.abort()
  },

  toggleFavorite: (id) => {
    const isFavorite = toggleFav(id)
    set((state) => ({
      history: state.history.map((img) =>
        img.id === id ? { ...img, isFavorite } : img,
      ),
      currentImage:
        state.currentImage?.id === id
          ? { ...state.currentImage, isFavorite }
          : state.currentImage,
    }))
    get().addToast('success', isFavorite ? '已收藏' : '已取消收藏')
  },

  deleteFromHistory: async (id) => {
    await delImage(id)
    set((state) => ({
      history: state.history.filter((img) => img.id !== id),
      currentImage: state.currentImage?.id === id ? null : state.currentImage,
    }))
    get().addToast('info', '已删除')
  },

  clearHistory: async () => {
    await clearAllImages()
    set({ history: [], currentImage: null })
    get().addToast('info', '历史记录已清空')
  },

  loadFromStorage: async () => {
    const images = await loadAllImages()
    set({ history: images })
  },

  addToast: (type, message) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }))
    setTimeout(() => {
      get().removeToast(id)
    }, 3000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
