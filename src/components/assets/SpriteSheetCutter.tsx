import { useState, useCallback, useEffect } from 'react'
import { Grid3X3, Play, Pause, Download, Scissors } from 'lucide-react'
import { cutSpriteSheet, renderGridOverlay, type SpriteFrame } from '@/utils/spriteSheet'
import { loadImage } from '@/utils/greenScreen'

interface SpriteSheetCutterProps {
  readonly imageDataUrl: string
}

export default function SpriteSheetCutter({ imageDataUrl }: SpriteSheetCutterProps) {
  const [frameWidth, setFrameWidth] = useState(64)
  const [frameHeight, setFrameHeight] = useState(64)
  const [gridPreviewUrl, setGridPreviewUrl] = useState<string | null>(null)
  const [frames, setFrames] = useState<readonly SpriteFrame[]>([])
  const [animatingRow, setAnimatingRow] = useState<number | null>(null)
  const [animFrame, setAnimFrame] = useState(0)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  // Generate grid overlay preview
  const updateGridPreview = useCallback(async () => {
    const img = await loadImage(imageDataUrl)
    setImageSize({ width: img.width, height: img.height })
    const overlay = renderGridOverlay(img, frameWidth, frameHeight)
    setGridPreviewUrl(overlay.toDataURL('image/png'))
  }, [imageDataUrl, frameWidth, frameHeight])

  useEffect(() => {
    updateGridPreview()
  }, [updateGridPreview])

  // Animation loop
  useEffect(() => {
    if (animatingRow === null) return
    const rowFrames = frames.filter((f) => f.row === animatingRow)
    if (rowFrames.length === 0) return

    const interval = setInterval(() => {
      setAnimFrame((prev) => (prev + 1) % rowFrames.length)
    }, 150)
    return () => clearInterval(interval)
  }, [animatingRow, frames])

  const handleCut = useCallback(async () => {
    const img = await loadImage(imageDataUrl)
    const result = cutSpriteSheet(img, { frameWidth, frameHeight })
    setFrames(result)
  }, [imageDataUrl, frameWidth, frameHeight])

  const handleDownloadFrame = (frame: SpriteFrame) => {
    const link = document.createElement('a')
    link.href = frame.dataUrl
    link.download = `frame-r${frame.row}-c${frame.col}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    frames.forEach((frame) => {
      handleDownloadFrame(frame)
    })
  }

  const rows = frames.length > 0
    ? [...new Set(frames.map((f) => f.row))].sort((a, b) => a - b)
    : []

  const cols = Math.floor(imageSize.width / frameWidth)
  const rowCount = Math.floor(imageSize.height / frameHeight)

  return (
    <div className="space-y-4">
      {/* Frame size config */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border-default bg-bg-card p-4">
        <div>
          <label className="mb-1 block text-xs text-text-muted">帧宽度 (px)</label>
          <input
            type="number"
            value={frameWidth}
            onChange={(e) => setFrameWidth(Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-lg border border-border-default bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">帧高度 (px)</label>
          <input
            type="number"
            value={frameHeight}
            onChange={(e) => setFrameHeight(Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-lg border border-border-default bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
        <div className="text-xs text-text-muted">
          {imageSize.width}x{imageSize.height} = {cols}列 x {rowCount}行
        </div>
        <button
          onClick={handleCut}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white"
        >
          <Scissors className="h-4 w-4" />
          切割
        </button>
      </div>

      {/* Grid overlay preview */}
      {gridPreviewUrl && (
        <div className="overflow-hidden rounded-xl border border-border-default">
          <div className="flex items-center gap-2 border-b border-border-default bg-bg-card px-4 py-2">
            <Grid3X3 className="h-4 w-4 text-text-muted" />
            <span className="text-xs text-text-secondary">网格预览（红线标记切割位置）</span>
          </div>
          <img src={gridPreviewUrl} alt="Grid overlay" className="w-full object-contain" />
        </div>
      )}

      {/* Cut frames */}
      {frames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-primary">
              切割结果：{frames.length} 帧
            </h4>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            >
              <Download className="h-3.5 w-3.5" />
              全部下载
            </button>
          </div>

          {rows.map((row) => {
            const rowFrames = frames.filter((f) => f.row === row)
            const isAnimating = animatingRow === row
            const currentAnimFrame = isAnimating ? rowFrames[animFrame % rowFrames.length] : null

            return (
              <div key={row} className="rounded-xl border border-border-default bg-bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">
                    第 {row + 1} 行 ({rowFrames.length} 帧)
                  </span>
                  <button
                    onClick={() => {
                      if (isAnimating) {
                        setAnimatingRow(null)
                        setAnimFrame(0)
                      } else {
                        setAnimatingRow(row)
                        setAnimFrame(0)
                      }
                    }}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all ${
                      isAnimating
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isAnimating ? '停止' : '预览动画'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Animation preview */}
                  {isAnimating && currentAnimFrame && (
                    <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border border-green-500/30 bg-bg-secondary p-2">
                      <img
                        src={currentAnimFrame.dataUrl}
                        alt="Animation"
                        className="h-16 w-16 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="text-[10px] text-green-400">
                        {(animFrame % rowFrames.length) + 1}/{rowFrames.length}
                      </span>
                    </div>
                  )}

                  {/* Frame list */}
                  <div className="flex flex-wrap gap-1.5">
                    {rowFrames.map((frame) => (
                      <button
                        key={frame.index}
                        onClick={() => handleDownloadFrame(frame)}
                        title={`下载帧 R${frame.row + 1}C${frame.col + 1}`}
                        className="group relative overflow-hidden rounded-md border border-border-default bg-bg-secondary transition-all hover:border-accent-primary/30"
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`Frame ${frame.index}`}
                          className="h-16 w-16 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Download className="h-3 w-3 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
