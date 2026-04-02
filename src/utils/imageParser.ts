interface ApiPart {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

interface ApiResponse {
  candidates?: Array<{
    content?: {
      parts?: ApiPart[]
    }
  }>
  error?: {
    message?: string
  }
}

export function parseImageResponse(response: ApiResponse): {
  imageData: string | null
  textResponse: string | null
} {
  if (response.error) {
    throw new Error(response.error.message ?? '生成失败')
  }

  const parts = response.candidates?.[0]?.content?.parts
  if (!parts || parts.length === 0) {
    throw new Error('未返回任何内容')
  }

  let imageData: string | null = null
  const textParts: string[] = []

  for (const part of parts) {
    if (part.inlineData) {
      imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
    }
    if (part.text) {
      textParts.push(part.text)
    }
  }

  return {
    imageData,
    textResponse: textParts.length > 0 ? textParts.join('\n') : null,
  }
}
