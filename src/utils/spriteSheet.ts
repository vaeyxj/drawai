/** Sprite sheet cutting utility — splits a sprite sheet into individual frames */

export interface SpriteFrame {
  readonly index: number
  readonly row: number
  readonly col: number
  readonly dataUrl: string
}

export interface CutOptions {
  readonly frameWidth: number
  readonly frameHeight: number
}

/** Cut a source image into a grid of frames */
export function cutSpriteSheet(
  source: HTMLImageElement | HTMLCanvasElement,
  options: CutOptions,
): readonly SpriteFrame[] {
  const { frameWidth, frameHeight } = options
  const cols = Math.floor(source.width / frameWidth)
  const rows = Math.floor(source.height / frameHeight)
  const frames: SpriteFrame[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const canvas = document.createElement('canvas')
      canvas.width = frameWidth
      canvas.height = frameHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        source,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight,
      )

      // Skip fully empty frames
      const imageData = ctx.getImageData(0, 0, frameWidth, frameHeight)
      const hasContent = imageData.data.some((_, i) => i % 4 === 3 && imageData.data[i] > 0)
      if (!hasContent) continue

      frames.push({
        index: frames.length,
        row,
        col,
        dataUrl: canvas.toDataURL('image/png'),
      })
    }
  }

  return frames
}

/** Render sprite grid overlay on a canvas for alignment preview */
export function renderGridOverlay(
  source: HTMLImageElement | HTMLCanvasElement,
  frameWidth: number,
  frameHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0)

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.lineWidth = 1

  for (let x = 0; x <= canvas.width; x += frameWidth) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y <= canvas.height; y += frameHeight) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  return canvas
}
