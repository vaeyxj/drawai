import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Download, Copy, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { downloadImage } from '@/utils/download'
import { MODELS } from '@/constants'
import type { GeneratedImage } from '@/types'

interface ImageModalProps {
  readonly image: GeneratedImage | null
  readonly onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const addToast = useAppStore((s) => s.addToast)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (image) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [image, onClose])

  const currentImage = useAppStore((s) =>
    s.history.find((h) => h.id === image?.id),
  ) ?? image

  const modelName = currentImage
    ? (MODELS.find((m) => m.id === currentImage.model)?.name ?? currentImage.model)
    : ''

  const handleCopyPrompt = () => {
    if (currentImage) {
      navigator.clipboard.writeText(currentImage.prompt)
      addToast('success', '已复制描述')
    }
  }

  return (
    <AnimatePresence>
      {currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex-1 overflow-auto">
              <img
                src={currentImage.imageData}
                alt={currentImage.prompt}
                className="w-full object-contain"
              />
            </div>

            <div className="border-t border-border-default p-4">
              <p className="text-sm text-text-primary">{currentImage.prompt}</p>

              {currentImage.textResponse && (
                <p className="mt-2 text-xs text-text-secondary">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {currentImage.textResponse}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-accent-primary/15 px-2 py-0.5 text-xs text-accent-primary">
                  {modelName}
                </span>
                <span className="text-xs text-text-muted">{currentImage.aspectRatio}</span>
                <span className="text-xs text-text-muted">{currentImage.imageSize.toUpperCase()}</span>
                <span className="text-xs text-text-muted">
                  {new Date(currentImage.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <ModalButton
                  icon={Heart}
                  label={currentImage.isFavorite ? '取消收藏' : '收藏'}
                  active={currentImage.isFavorite}
                  onClick={() => toggleFavorite(currentImage.id)}
                />
                <ModalButton
                  icon={Download}
                  label="下载"
                  onClick={() => downloadImage(currentImage.imageData, currentImage.prompt)}
                />
                <ModalButton
                  icon={Copy}
                  label="复制描述"
                  onClick={handleCopyPrompt}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ModalButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  readonly icon: React.ComponentType<{ className?: string }>
  readonly label: string
  readonly onClick: () => void
  readonly active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
        active
          ? 'border-red-400/30 bg-red-400/10 text-red-400'
          : 'border-border-default bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
