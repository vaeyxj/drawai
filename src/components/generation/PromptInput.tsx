import { useRef, useCallback } from 'react'
import { Send, Square } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import ReferenceImageInput from './ReferenceImageInput'
import type { ReferenceImage } from '@/types'

function fileToReferenceImage(file: File): Promise<ReferenceImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        mimeType: file.type || 'image/png',
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PromptInput() {
  const prompt = useAppStore((s) => s.prompt)
  const setPrompt = useAppStore((s) => s.setPrompt)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const generate = useAppStore((s) => s.generate)
  const cancelGeneration = useAppStore((s) => s.cancelGeneration)
  const setReferenceImage = useAppStore((s) => s.setReferenceImage)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!isGenerating) generate()
      }
    },
    [isGenerating, generate],
  )

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }, [])

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            const ref = await fileToReferenceImage(file)
            setReferenceImage(ref)
            return
          }
        }
      }
    },
    [setReferenceImage],
  )

  return (
    <div className="relative flex gap-2">
      <div className="shrink-0 pt-1.5">
        <ReferenceImageInput />
      </div>
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="描述你想要的图片...  (⌘+Enter 生成，可粘贴参考图)"
          rows={3}
          className="w-full resize-none rounded-xl border border-border-default bg-bg-secondary px-4 py-3 pr-14 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all"
        />
        <button
          onClick={isGenerating ? cancelGeneration : generate}
          disabled={!isGenerating && !prompt.trim()}
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
            isGenerating
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : prompt.trim()
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]'
                : 'bg-bg-hover text-text-muted cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
