/**
 * Green screen (#00FF00) removal algorithm.
 * Ported from user's Python implementation with gradient alpha for soft edges.
 */

export interface GreenScreenOptions {
  /** Threshold above which pixels are fully transparent (default: 60) */
  readonly hardThreshold: number
  /** Threshold below which pixels are fully opaque (default: 10) */
  readonly softThreshold: number
}

const DEFAULT_OPTIONS: GreenScreenOptions = {
  hardThreshold: 60,
  softThreshold: 10,
}

/** Remove green screen from an image, returning a new canvas with alpha channel */
export function removeGreenScreen(
  source: HTMLImageElement | HTMLCanvasElement,
  options: Partial<GreenScreenOptions> = {},
): HTMLCanvasElement {
  const { hardThreshold, softThreshold } = { ...DEFAULT_OPTIONS, ...options }

  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const greenStrength = g - Math.max(r, b)

    if (greenStrength > hardThreshold) {
      data[i + 3] = 0
    } else if (greenStrength > softThreshold) {
      const alpha = Math.max(
        0,
        Math.round(((hardThreshold - greenStrength) / (hardThreshold - softThreshold)) * 255),
      )
      data[i + 3] = alpha
    }
    // else: keep original alpha
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Render a checkerboard pattern behind a transparent image for preview */
export function renderWithCheckerboard(
  source: HTMLCanvasElement,
  gridSize = 10,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')!

  // Draw checkerboard
  for (let y = 0; y < canvas.height; y += gridSize) {
    for (let x = 0; x < canvas.width; x += gridSize) {
      const isEven = (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0
      ctx.fillStyle = isEven ? '#cccccc' : '#ffffff'
      ctx.fillRect(x, y, gridSize, gridSize)
    }
  }

  // Composite the transparent image on top
  ctx.drawImage(source, 0, 0)
  return canvas
}

/** Export a canvas as a PNG data URL */
export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

/** Load a data URL as an HTMLImageElement */
export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}
