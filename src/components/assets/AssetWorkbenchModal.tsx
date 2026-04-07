import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wand2, Scissors } from 'lucide-react'
import type { GameAsset } from '@/types'
import GreenScreenProcessor from './GreenScreenProcessor'
import SpriteSheetCutter from './SpriteSheetCutter'

interface AssetWorkbenchModalProps {
  readonly asset: GameAsset | null
  readonly onClose: () => void
  readonly onUpdateTransparent: (id: string, transparentDataUrl: string) => void
}

type Tab = 'green-screen' | 'sprite-cutter'

export default function AssetWorkbenchModal({ asset, onClose, onUpdateTransparent }: AssetWorkbenchModalProps) {
  const [tab, setTab] = useState<Tab>('green-screen')

  useEffect(() => {
    if (asset) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [asset])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (asset) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [asset, onClose])

  const sourceUrl = asset?.transparentDataUrl ?? asset?.originalDataUrl ?? ''

  const tabs: { value: Tab; label: string; icon: typeof Wand2 }[] = [
    { value: 'green-screen', label: '绿幕去背景', icon: Wand2 },
    { value: 'sprite-cutter', label: 'Sprite 切割', icon: Scissors },
  ]

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-text-primary">{asset.name}</h3>
                <div className="flex gap-1">
                  {tabs.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTab(value)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        tab === value
                          ? 'bg-accent-primary/15 text-accent-primary'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'green-screen' ? (
                <GreenScreenProcessor
                  imageDataUrl={asset.originalDataUrl}
                  onProcessed={(url) => onUpdateTransparent(asset.id, url)}
                />
              ) : (
                <SpriteSheetCutter imageDataUrl={sourceUrl} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
