import { useAppStore } from '@/store/useAppStore'
import { IMAGE_SIZES } from '@/constants'

export default function ImageSizeSelector() {
  const imageSize = useAppStore((s) => s.imageSize)
  const setImageSize = useAppStore((s) => s.setImageSize)

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-text-secondary">尺寸</label>
      <div className="flex gap-2">
        {IMAGE_SIZES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setImageSize(value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              imageSize === value
                ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                : 'border-border-default bg-bg-secondary text-text-secondary hover:border-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
