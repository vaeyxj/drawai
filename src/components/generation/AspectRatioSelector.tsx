import { useAppStore } from '@/store/useAppStore'
import { ASPECT_RATIOS } from '@/constants'

export default function AspectRatioSelector() {
  const aspectRatio = useAppStore((s) => s.aspectRatio)
  const setAspectRatio = useAppStore((s) => s.setAspectRatio)

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-text-secondary">比例</label>
      <div className="flex gap-2">
        {ASPECT_RATIOS.map(({ value, label, w, h }) => {
          const scale = 24 / Math.max(w, h)
          return (
            <button
              key={value}
              onClick={() => setAspectRatio(value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2 transition-all ${
                aspectRatio === value
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                  : 'border-border-default bg-bg-secondary text-text-secondary hover:border-text-muted'
              }`}
            >
              <div
                className={`rounded-sm border ${
                  aspectRatio === value ? 'border-accent-primary' : 'border-text-muted'
                }`}
                style={{ width: w * scale, height: h * scale }}
              />
              <span className="text-xs">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
