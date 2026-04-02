import type { ModelOption, AspectRatio, ImageSize } from '@/types'

export const API_BASE = '/api/v1beta/models'

export const API_KEY = import.meta.env.VITE_API_KEY ?? ''

export const MODELS: readonly ModelOption[] = [
  {
    id: 'gemini-3-pro-image-preview',
    name: '香蕉Pro',
    description: '最强画质，适合精细创作',
  },
  {
    id: 'gemini-2.5-flash-image',
    name: '香蕉',
    description: '快速生成，性价比高',
  },
  {
    id: 'gemini-3.1-flash-image-preview',
    name: '香蕉2',
    description: '新一代快速模型',
  },
] as const

export const ASPECT_RATIOS: readonly { value: AspectRatio; label: string; w: number; h: number }[] = [
  { value: '1:1', label: '1:1', w: 1, h: 1 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
  { value: '4:3', label: '4:3', w: 4, h: 3 },
  { value: '3:4', label: '3:4', w: 3, h: 4 },
] as const

export const IMAGE_SIZES: readonly { value: ImageSize; label: string }[] = [
  { value: '1k', label: '1K' },
  { value: '2k', label: '2K' },
] as const

export const MAX_HISTORY = 50
