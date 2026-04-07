import { useState, useCallback, useRef, useEffect } from 'react'
import { Sliders, Eye, EyeOff, Download, Check } from 'lucide-react'
import { removeGreenScreen, renderWithCheckerboard, canvasToDataUrl, loadImage } from '@/utils/greenScreen'
import type { GreenScreenOptions } from '@/utils/greenScreen'

interface GreenScreenProcessorProps {
  readonly imageDataUrl: string
  readonly onProcessed: (transparentDataUrl: string) => void
}

type PreviewMode = 'original' | 'checkerboard' | 'transparent'

export default function GreenScreenProcessor({ imageDataUrl, onProcessed }: GreenScreenProcessorProps) {
  const [options, setOptions] = useState<GreenScreenOptions>({
    hardThreshold: 60,
    softThreshold: 10,
  })
  const [previewMode, setPreviewMode] = useState<PreviewMode>('checkerboard')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const process = useCallback(async () => {
    setIsProcessing(true)
    try {
      const img = await loadImage(imageDataUrl)
      const transparent = removeGreenScreen(img, options)
      canvasRef.current = transparent

      if (previewMode === 'checkerboard') {
        const checker = renderWithCheckerboard(transparent)
        setPreviewUrl(canvasToDataUrl(checker))
      } else if (previewMode === 'transparent') {
        setPreviewUrl(canvasToDataUrl(transparent))
      } else {
        setPreviewUrl(imageDataUrl)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [imageDataUrl, options, previewMode])

  useEffect(() => {
    process()
  }, [process])

  const handleConfirm = () => {
    if (canvasRef.current) {
      onProcessed(canvasToDataUrl(canvasRef.current))
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const url = canvasToDataUrl(canvasRef.current)
    const link = document.createElement('a')
    link.href = url
    link.download = `asset-transparent-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const previewModes: { value: PreviewMode; label: string; icon: typeof Eye }[] = [
    { value: 'original', label: '原图', icon: Eye },
    { value: 'checkerboard', label: '棋盘格', icon: Sliders },
    { value: 'transparent', label: '透明', icon: EyeOff },
  ]

  return (
    <div className="space-y-4">
      {/* Preview mode tabs */}
      <div className="flex items-center gap-2">
        {previewModes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setPreviewMode(value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              previewMode === value
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Preview image */}
      <div className="relative overflow-hidden rounded-xl border border-border-default bg-bg-secondary">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-primary/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
          </div>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full object-contain"
            style={previewMode === 'transparent' ? { background: 'transparent' } : undefined}
          />
        )}
      </div>

      {/* Threshold sliders */}
      <div className="space-y-3 rounded-xl border border-border-default bg-bg-card p-4">
        <h4 className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Sliders className="h-3.5 w-3.5" />
          绿幕移除参数
        </h4>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs text-text-muted">
            <span>硬阈值 (完全透明)</span>
            <span className="tabular-nums text-text-secondary">{options.hardThreshold}</span>
          </label>
          <input
            type="range"
            min={20}
            max={150}
            value={options.hardThreshold}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, hardThreshold: Number(e.target.value) }))
            }
            className="w-full accent-accent-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs text-text-muted">
            <span>软阈值 (渐变边缘)</span>
            <span className="tabular-nums text-text-secondary">{options.softThreshold}</span>
          </label>
          <input
            type="range"
            min={0}
            max={80}
            value={options.softThreshold}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, softThreshold: Number(e.target.value) }))
            }
            className="w-full accent-accent-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <Check className="h-4 w-4" />
          确认去背景
        </button>
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-secondary px-4 py-2.5 text-sm text-text-secondary transition-all hover:bg-bg-hover hover:text-text-primary"
        >
          <Download className="h-4 w-4" />
          下载
        </button>
      </div>
    </div>
  )
}
