import { Gamepad2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { ASSET_PRESETS } from '@/constants/assetPresets'

export default function AssetModeToggle() {
  const assetMode = useAppStore((s) => s.assetMode)
  const setAssetMode = useAppStore((s) => s.setAssetMode)
  const assetPresetId = useAppStore((s) => s.assetPresetId)
  const setAssetPresetId = useAppStore((s) => s.setAssetPresetId)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setAssetMode(!assetMode)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
          assetMode
            ? 'border-green-500/40 bg-green-500/15 text-green-400'
            : 'border-border-default bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }`}
      >
        <Gamepad2 className="h-3.5 w-3.5" />
        {assetMode ? '素材模式 ON' : '素材模式'}
      </button>

      {assetMode && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setAssetPresetId(null)}
            className={`rounded-md px-2 py-1 text-xs transition-all ${
              assetPresetId === null
                ? 'bg-green-500/20 text-green-400'
                : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
            }`}
          >
            通用绿幕
          </button>
          {ASSET_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setAssetPresetId(preset.id)}
              title={preset.description}
              className={`rounded-md px-2 py-1 text-xs transition-all ${
                assetPresetId === preset.id
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
