import { useState, useMemo } from 'react'
import { Trash2, Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import ImageGrid from '@/components/gallery/ImageGrid'
import ImageModal from '@/components/gallery/ImageModal'
import EmptyState from '@/components/gallery/EmptyState'
import type { GeneratedImage, ModelId } from '@/types'
import { MODELS } from '@/constants'

export default function GalleryPage() {
  const history = useAppStore((s) => s.history)
  const clearHistory = useAppStore((s) => s.clearHistory)
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModel, setFilterModel] = useState<ModelId | 'all'>('all')

  const filteredImages = useMemo(() => {
    let result = history
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((img) => img.prompt.toLowerCase().includes(q))
    }
    if (filterModel !== 'all') {
      result = result.filter((img) => img.model === filterModel)
    }
    return result
  }, [history, searchQuery, filterModel])

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <EmptyState title="暂无图片" description="去生成页面创作你的第一张图片吧" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索描述..."
            className="w-full rounded-lg border border-border-default bg-bg-secondary py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        <select
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value as ModelId | 'all')}
          className="rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          <option value="all">全部模型</option>
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          清空
        </button>
      </div>

      <p className="mb-4 text-xs text-text-muted">{filteredImages.length} 张图片</p>

      <ImageGrid images={filteredImages} onExpand={setExpandedImage} />

      <ImageModal
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  )
}
