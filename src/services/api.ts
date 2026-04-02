import { API_BASE, API_KEY } from '@/constants'
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

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: config.prompt }],
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
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`请求失败 (${response.status}): ${errorText || response.statusText}`)
  }

  const data = await response.json()
  const parsed = parseImageResponse(data)

  if (!parsed.imageData) {
    throw new Error('模型未返回图片，请尝试修改描述后重试')
  }

  return {
    imageData: parsed.imageData,
    textResponse: parsed.textResponse,
  }
}
