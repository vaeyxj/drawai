import { useState, useRef } from 'react'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Images } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { AssetCategory } from '@/types'
import { ASSET_CATEGORIES } from '@/constants/assetPresets'

interface ImportModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onImport: (name: string, category: AssetCategory, dataUrl: string, sourceImageId: string | null) => void
}

export default function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const history = useAppStore((s) => s.history)
  const [tab, setTab] = useState<'gallery' | 'upload'>('gallery')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AssetCategory>('other')
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setCategory('other')
      setSelectedImageId(null)
      setUploadDataUrl(null)
    }
  }, [open])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setUploadDataUrl(reader.result as string)
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    if (tab === 'gallery' && selectedImageId) {
      const img = history.find((h) => h.id === selectedImageId)
      if (img) {
        onImport(name.trim(), category, img.imageData, img.id)
        onClose()
      }
    } else if (tab === 'upload' && uploadDataUrl) {
      onImport(name.trim(), category, uploadDataUrl, null)
      onClose()
    }
  }

  const canSubmit = name.trim() && (
    (tab === 'gallery' && selectedImageId) ||
    (tab === 'upload' && uploadDataUrl)
  )

  return (
    <AnimatePresence>
      {open && (
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
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-default bg-bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
              <h3 className="text-base font-medium text-text-primary">导入素材</h3>
              <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-bg-hover hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name & Category */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-text-muted">素材名称</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入素材名称..."
                    className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">分类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategory)}
                    className="rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source tabs */}
              <div className="flex gap-2 border-b border-border-default">
                <button
                  onClick={() => setTab('gallery')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-all ${
                    tab === 'gallery'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Images className="h-4 w-4" />
                  从画廊导入
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-all ${
                    tab === 'upload'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  上传本地图片
                </button>
              </div>

              {/* Tab content */}
              {tab === 'gallery' ? (
                <div className="max-h-60 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="py-8 text-center text-sm text-text-muted">画廊中暂无图片</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {history.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setSelectedImageId(img.id)
                            if (!name) setName(img.prompt.slice(0, 20))
                          }}
                          className={`overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImageId === img.id
                              ? 'border-accent-primary'
                              : 'border-transparent hover:border-border-default'
                          }`}
                        >
                          <img src={img.imageData} alt={img.prompt} className="aspect-square w-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadDataUrl ? (
                    <div className="flex items-center gap-4">
                      <img src={uploadDataUrl} alt="Upload preview" className="h-32 w-32 rounded-lg border border-border-default object-contain" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-accent-primary hover:underline"
                      >
                        重新选择
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-default py-12 text-sm text-text-muted transition-all hover:border-accent-primary/30 hover:text-text-secondary"
                    >
                      <Upload className="h-5 w-5" />
                      点击选择图片文件
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${
                  canSubmit
                    ? 'bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                    : 'cursor-not-allowed bg-bg-hover text-text-muted'
                }`}
              >
                导入
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
