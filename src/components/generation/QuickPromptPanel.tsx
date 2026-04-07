import { useState } from 'react'
import { Zap, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { QUICK_PROMPTS, QUICK_PROMPT_GROUPS } from '@/constants/quickPrompts'

export default function QuickPromptPanel() {
  const [expanded, setExpanded] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string>(QUICK_PROMPT_GROUPS[0])
  const setPrompt = useAppStore((s) => s.setPrompt)
  const referenceImage = useAppStore((s) => s.referenceImage)
  const assetMode = useAppStore((s) => s.assetMode)
  const setAssetMode = useAppStore((s) => s.setAssetMode)
  const setAssetPresetId = useAppStore((s) => s.setAssetPresetId)
  const addToast = useAppStore((s) => s.addToast)

  const filteredPrompts = QUICK_PROMPTS.filter((p) => p.group === activeGroup)

  const handleApply = (prompt: string, needsReference: boolean) => {
    if (needsReference && !referenceImage) {
      addToast('info', '该模板需要先上传参考图')
    }
    setPrompt(prompt)
    // Templates already contain green-screen instructions,
    // turn OFF asset mode to avoid duplicate injection
    if (assetMode) {
      setAssetMode(false)
      setAssetPresetId(null)
    }
    addToast('success', '已填入模板，请修改【】中的内容')
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Zap className="h-4 w-4 text-amber-400" />
          快捷 Prompt 模板
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border-default px-4 pb-4 pt-3">
          {/* Group tabs */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {QUICK_PROMPT_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeGroup === group
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredPrompts.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleApply(tpl.prompt, tpl.needsReference)}
                className="group relative flex items-start gap-3 rounded-lg border border-border-default bg-bg-secondary p-3 text-left transition-all hover:border-amber-500/30 hover:bg-bg-hover"
              >
                <span className="shrink-0 text-lg">{tpl.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-text-primary">
                      {tpl.name}
                    </span>
                    {tpl.needsReference && (
                      <span className="flex items-center gap-0.5 rounded bg-accent-primary/10 px-1 py-0.5 text-[10px] text-accent-primary">
                        <ImagePlus className="h-2.5 w-2.5" />
                        需参考图
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
                    {tpl.prompt.split('\n')[0].replace(/【.*?】/g, (m) => `\u00AB${m.slice(1, -1)}\u00BB`)}
                  </p>
                </div>
                <span className="shrink-0 self-center text-[10px] text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  点击填入
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-text-muted">
            填入后请修改 <span className="rounded bg-amber-500/10 px-1 py-0.5 text-amber-400">【】</span> 中的占位内容，替换成你想要的具体描述
          </p>
        </div>
      )}
    </div>
  )
}
