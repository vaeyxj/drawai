import { API_BASE, getApiKey } from '@/constants'
import { parseImageResponse } from '@/utils/imageParser'
import type { GenerationConfig } from '@/types'

export interface GenerateResult {
  readonly imageData: string
  readonly textResponse: string | null
}

export async function generateImage(
  config: GenerationConfig,
  signal?: AbortSignal,
): Promise<GenerateResult> {
  const url = `${API_BASE}/${config.model}:generateContent`

  const parts: Array<Record<string, unknown>> = []

  // Add reference image first if provided (Gemini expects image before text)
  if (config.referenceImage) {
    const base64 = config.referenceImage.dataUrl.replace(/^data:[^;]+;base64,/, '')
    parts.push({
      inlineData: {
        mimeType: config.referenceImage.mimeType,
        data: base64,
      },
    })
  }

  parts.push({ text: config.prompt })

  const body = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ['text', 'image'],
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize,
      },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const msg = data?.error?.message || response.statusText
    throw new Error(`请求失败 (${response.status}): ${msg}`)
  }

  if (data?.error) {
    throw new Error(data.error.message || '生成失败')
  }

  if (!data) {
    throw new Error('服务器返回了空响应')
  }

  const parsed = parseImageResponse(data)

  if (!parsed.imageData) {
    throw new Error('模型未返回图片，请尝试修改描述后重试')
  }

  return {
    imageData: parsed.imageData,
    textResponse: parsed.textResponse,
  }
}
