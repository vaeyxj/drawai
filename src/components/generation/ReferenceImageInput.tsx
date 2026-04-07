import { useRef, useCallback } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
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

export default function ReferenceImageInput() {
  const referenceImage = useAppStore((s) => s.referenceImage)
  const setReferenceImage = useAppStore((s) => s.setReferenceImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return
      const ref = await fileToReferenceImage(file)
      setReferenceImage(ref)
    },
    [setReferenceImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleFile(file)
            return
          }
        }
      }
    },
    [handleFile],
  )

  if (referenceImage) {
    return (
      <div className="relative inline-flex">
        <img
          src={referenceImage.dataUrl}
          alt="参考图"
          className="h-14 w-14 rounded-lg border border-accent-primary/30 object-cover"
        />
        <button
          onClick={() => setReferenceImage(null)}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bg-card border border-border-default text-text-muted hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-accent-primary/80 px-1 text-[9px] text-white whitespace-nowrap">
          参考图
        </div>
      </div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        title="上传参考图 (支持拖拽/粘贴)"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border-default text-text-muted transition-all hover:border-accent-primary/40 hover:bg-accent-primary/5 hover:text-accent-primary"
      >
        <ImagePlus className="h-4 w-4" />
      </button>
    </>
  )
}
