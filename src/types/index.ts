export type ModelId =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'gemini-3.1-flash-image-preview'

export interface ModelOption {
  readonly id: ModelId
  readonly name: string
  readonly description: string
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

export type ImageSize = '1k' | '2k'

export interface GenerationConfig {
  readonly model: ModelId
  readonly prompt: string
  readonly aspectRatio: AspectRatio
  readonly imageSize: ImageSize
}

export interface GeneratedImage {
  readonly id: string
  readonly prompt: string
  readonly model: ModelId
  readonly aspectRatio: AspectRatio
  readonly imageSize: ImageSize
  readonly imageData: string
  readonly textResponse?: string
  readonly createdAt: number
  readonly isFavorite: boolean
}

export interface ToastMessage {
  readonly id: string
  readonly type: 'success' | 'error' | 'info'
  readonly message: string
}
