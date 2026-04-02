import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import ImageGrid from '@/components/gallery/ImageGrid'
import ImageModal from '@/components/gallery/ImageModal'
import EmptyState from '@/components/gallery/EmptyState'
import type { GeneratedImage } from '@/types'

export default function FavoritesPage() {
  const history = useAppStore((s) => s.history)
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null)

  const favorites = useMemo(
    () => history.filter((img) => img.isFavorite),
    [history],
  )

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <EmptyState title="暂无收藏" description="点击图片上的心形图标来收藏喜欢的作品" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <p className="mb-4 text-xs text-text-muted">{favorites.length} 张收藏</p>

      <ImageGrid images={favorites} onExpand={setExpandedImage} />

      <ImageModal
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  )
}
