import { Trash2, Wand2 } from 'lucide-react'
import type { GameAsset } from '@/types'
import { ASSET_CATEGORIES } from '@/constants/assetPresets'

interface AssetCardProps {
  readonly asset: GameAsset
  readonly onSelect: (asset: GameAsset) => void
  readonly onDelete: (id: string) => void
}

export default function AssetCard({ asset, onSelect, onDelete }: AssetCardProps) {
  const categoryLabel = ASSET_CATEGORIES.find((c) => c.value === asset.category)?.label ?? '其他'
  const displayUrl = asset.transparentDataUrl ?? asset.originalDataUrl

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-card transition-all hover:border-accent-primary/30">
      <button
        onClick={() => onSelect(asset)}
        className="w-full"
      >
        <div
          className="aspect-square w-full"
          style={{
            backgroundImage: asset.transparentDataUrl
              ? 'repeating-conic-gradient(#1a1a2e 0% 25%, #12121a 0% 50%) 0 0 / 20px 20px'
              : undefined,
            backgroundColor: asset.transparentDataUrl ? undefined : 'var(--color-bg-secondary)',
          }}
        >
          <img
            src={displayUrl}
            alt={asset.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </button>

      <div className="p-2">
        <p className="truncate text-xs font-medium text-text-primary">{asset.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="rounded-md bg-accent-primary/10 px-1.5 py-0.5 text-[10px] text-accent-primary">
            {categoryLabel}
          </span>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!asset.transparentDataUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(asset)
                }}
                className="rounded-md p-1 text-text-muted hover:bg-green-500/15 hover:text-green-400"
                title="去背景"
              >
                <Wand2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(asset.id)
              }}
              className="rounded-md p-1 text-text-muted hover:bg-red-500/15 hover:text-red-400"
              title="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
