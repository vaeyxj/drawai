import type { ModelOption, AspectRatio, ImageSize } from '@/types'

const API_KEY_STORAGE = 'drawai_api_key'
const BASE_URL_STORAGE = 'drawai_base_url'

const DEFAULT_KEY = import.meta.env.VITE_API_KEY || ''
const DEFAULT_BASE_URL = import.meta.env.VITE_BASE_URL || ''

const OFFICIAL_GEMINI_BASE = 'https://generativelanguage.googleapis.com'
const PROXY_API_PATH = '/api/v1beta/models'

export function isOfficialKey(key: string): boolean {
  return key.startsWith('AIza')
}

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_KEY
}

export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim())
  } else {
    localStorage.removeItem(API_KEY_STORAGE)
  }
}

export function hasCustomApiKey(): boolean {
  return !!localStorage.getItem(API_KEY_STORAGE)
}

export function getBaseUrl(): string {
  return localStorage.getItem(BASE_URL_STORAGE) || DEFAULT_BASE_URL
}

export function setBaseUrl(url: string): void {
  if (url.trim()) {
    localStorage.setItem(BASE_URL_STORAGE, url.trim().replace(/\/+$/, ''))
  } else {
    localStorage.removeItem(BASE_URL_STORAGE)
  }
}

export function hasCustomBaseUrl(): boolean {
  return !!localStorage.getItem(BASE_URL_STORAGE)
}

export function buildApiUrl(model: string): string {
  const key = getApiKey()
  const customBase = getBaseUrl()

  if (customBase) {
    // Custom base URL: append Gemini path directly
    const base = `${customBase}/v1beta/models/${model}:generateContent`
    return isOfficialKey(key) ? `${base}?key=${key}` : base
  }

  if (isOfficialKey(key)) {
    // Official Gemini key without custom base → use official endpoint
    return `${OFFICIAL_GEMINI_BASE}/v1beta/models/${model}:generateContent?key=${key}`
  }

  // Proxy key without custom base → use Vite proxy path
  return `${PROXY_API_PATH}/${model}:generateContent`
}

export function buildAuthHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (!isOfficialKey(key)) {
    headers['Authorization'] = `Bearer ${key}`
  }
  return headers
}

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
