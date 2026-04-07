import { useState, useEffect, useMemo } from 'react'
import { Plus, Gamepad2 } from 'lucide-react'
import { useAssetStore } from '@/store/useAssetStore'
import { useAppStore } from '@/store/useAppStore'
import AssetCard from '@/components/assets/AssetCard'
import ImportModal from '@/components/assets/ImportModal'
import AssetWorkbenchModal from '@/components/assets/AssetWorkbenchModal'
import { ASSET_CATEGORIES } from '@/constants/assetPresets'
import type { GameAsset, AssetCategory } from '@/types'

export default function AssetsPage() {
  const assets = useAssetStore((s) => s.assets)
  const filterCategory = useAssetStore((s) => s.filterCategory)
  const loadAssets = useAssetStore((s) => s.loadAssets)
  const addAsset = useAssetStore((s) => s.addAsset)
  const updateAsset = useAssetStore((s) => s.updateAsset)
  const deleteAsset = useAssetStore((s) => s.deleteAsset)
  const setFilterCategory = useAssetStore((s) => s.setFilterCategory)
  const addToast = useAppStore((s) => s.addToast)

  const [showImport, setShowImport] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<GameAsset | null>(null)

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  const filteredAssets = useMemo(() => {
    if (filterCategory === 'all') return assets
    return assets.filter((a) => a.category === filterCategory)
  }, [assets, filterCategory])

  const handleImport = (name: string, category: AssetCategory, dataUrl: string, sourceImageId: string | null) => {
    const asset: GameAsset = {
      id: crypto.randomUUID(),
      name,
      category,
      originalDataUrl: dataUrl,
      transparentDataUrl: null,
      sourceImageId,
      createdAt: Date.now(),
    }
    addAsset(asset)
    addToast('success', '素材已导入')
  }

  const handleUpdateTransparent = (id: string, transparentDataUrl: string) => {
    updateAsset(id, { transparentDataUrl })
    // Update the selected asset reference
    setSelectedAsset((prev) =>
      prev?.id === id ? { ...prev, transparentDataUrl } : prev,
    )
    addToast('success', '背景已移除')
  }

  const handleDelete = (id: string) => {
    deleteAsset(id)
    addToast('info', '素材已删除')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-medium text-text-primary">游戏素材</h2>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {/* Category filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterCategory('all')}
              className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                filterCategory === 'all'
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              全部
            </button>
            {ASSET_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilterCategory(c.value)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  filterCategory === c.value
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-3 py-1.5 text-xs font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            <Plus className="h-3.5 w-3.5" />
            导入素材
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs text-text-muted">{filteredAssets.length} 个素材</p>

      {/* Asset grid */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default py-20">
          <Gamepad2 className="h-12 w-12 text-text-muted" />
          <h3 className="mt-4 text-base font-medium text-text-primary">暂无素材</h3>
          <p className="mt-1 text-sm text-text-secondary">
            导入画廊中的图片或上传本地文件，开始管理游戏素材
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            导入素材
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onSelect={setSelectedAsset}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      <AssetWorkbenchModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onUpdateTransparent={handleUpdateTransparent}
      />
    </div>
  )
}
