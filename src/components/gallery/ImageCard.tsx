import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Download, Trash2, Maximize2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { downloadImage } from '@/utils/download'
import { MODELS } from '@/constants'
import type { GeneratedImage } from '@/types'

interface ImageCardProps {
  readonly image: GeneratedImage
  readonly onExpand: (image: GeneratedImage) => void
}

export default function ImageCard({ image, onExpand }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const deleteFromHistory = useAppStore((s) => s.deleteFromHistory)

  const modelName = MODELS.find((m) => m.id === image.model)?.name ?? image.model
  const timeStr = new Date(image.createdAt).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-card transition-all hover:border-accent-primary/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative cursor-pointer" onClick={() => onExpand(image)}>
        <img
          src={image.imageData}
          alt={image.prompt}
          className="w-full object-cover"
          loading="lazy"
        />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          >
            <div className="absolute right-2 top-2 flex gap-1.5">
              <ActionButton
                icon={Heart}
                active={image.isFavorite}
                activeColor="text-red-400"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(image.id) }}
              />
              <ActionButton
                icon={Download}
                onClick={(e) => { e.stopPropagation(); downloadImage(image.imageData, image.prompt) }}
              />
              <ActionButton
                icon={Maximize2}
                onClick={(e) => { e.stopPropagation(); onExpand(image) }}
              />
              <ActionButton
                icon={Trash2}
                onClick={(e) => { e.stopPropagation(); deleteFromHistory(image.id) }}
                hoverColor="hover:bg-red-500/30 hover:text-red-400"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-sm text-text-primary">{image.prompt}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-accent-primary/15 px-2 py-0.5 text-xs text-accent-primary">
            {modelName}
          </span>
          <span className="text-xs text-text-muted">{image.aspectRatio}</span>
          <span className="ml-auto text-xs text-text-muted">{timeStr}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ActionButton({
  icon: Icon,
  onClick,
  active = false,
  activeColor = '',
  hoverColor = 'hover:bg-white/20',
}: {
  readonly icon: React.ComponentType<{ className?: string }>
  readonly onClick: (e: React.MouseEvent) => void
  readonly active?: boolean
  readonly activeColor?: string
  readonly hoverColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm transition-all ${hoverColor} ${
        active ? activeColor : 'text-white/80'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
