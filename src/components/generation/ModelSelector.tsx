import { useAppStore } from '@/store/useAppStore'
import { MODELS } from '@/constants'

export default function ModelSelector() {
  const model = useAppStore((s) => s.model)
  const setModel = useAppStore((s) => s.setModel)

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-text-secondary">模型</label>
      <div className="flex flex-wrap gap-2">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => setModel(m.id)}
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${
              model === m.id
                ? 'border-accent-primary bg-accent-primary/15 text-accent-primary shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                : 'border-border-default bg-bg-secondary text-text-secondary hover:border-text-muted hover:text-text-primary'
            }`}
          >
            <div className="font-medium">{m.name}</div>
            <div className="mt-0.5 text-xs opacity-70">{m.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
