import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import GenerationPanel from '@/components/generation/GenerationPanel'
import ImageModal from '@/components/gallery/ImageModal'
import Spinner from '@/components/ui/Spinner'

export default function GeneratePage() {
  const currentImage = useAppStore((s) => s.currentImage)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const history = useAppStore((s) => s.history)
  const [expandedImage, setExpandedImage] = useState<typeof currentImage>(null)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <GenerationPanel />

      {/* Current generation display */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-border-default bg-bg-card py-20"
            >
              <Spinner size="lg" />
              <p className="mt-4 text-sm text-text-secondary">正在生成图片...</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <Sparkles className="h-3 w-3" />
                AI 正在创作中，请耐心等待
              </div>
            </motion.div>
          ) : currentImage ? (
            <motion.div
              key={currentImage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border-default bg-bg-card"
            >
              <img
                src={currentImage.imageData}
                alt={currentImage.prompt}
                className="w-full cursor-pointer object-contain transition-transform hover:scale-[1.01]"
                onClick={() => setExpandedImage(currentImage)}
              />
              {currentImage.textResponse && (
                <div className="border-t border-border-default px-4 py-3">
                  <p className="text-sm text-text-secondary">
                    <Sparkles className="mr-1 inline h-3.5 w-3.5 text-accent-primary" />
                    {currentImage.textResponse}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default py-20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                <Sparkles className="h-8 w-8 text-accent-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-primary">开始创作</h3>
              <p className="mt-1 text-sm text-text-secondary">
                输入描述文字，选择模型和参数，生成你的第一张图片
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent history */}
      {history.length > 1 && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-medium text-text-secondary">最近生成</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.slice(0, 8).map((img) => (
              <button
                key={img.id}
                onClick={() => setExpandedImage(img)}
                className="shrink-0 overflow-hidden rounded-lg border border-border-default transition-all hover:border-accent-primary/30"
              >
                <img
                  src={img.imageData}
                  alt={img.prompt}
                  className="h-20 w-20 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <ImageModal
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  )
}
