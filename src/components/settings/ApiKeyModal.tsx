import { useState } from 'react'
import { X, Key, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { getApiKey, setApiKey, hasCustomApiKey } from '@/constants'

interface ApiKeyModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSaved: () => void
}

export default function ApiKeyModal({ open, onClose, onSaved }: ApiKeyModalProps) {
  const [value, setValue] = useState(() => hasCustomApiKey() ? getApiKey() : '')
  const [visible, setVisible] = useState(false)

  if (!open) return null

  const handleSave = () => {
    setApiKey(value)
    onSaved()
    onClose()
  }

  const handleReset = () => {
    setValue('')
    setApiKey('')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border-default bg-bg-primary p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">API Key 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-hover hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          配置自定义 API Key。留空将使用默认 Key。
        </p>

        <div className="relative mb-4">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-xl border border-border-default bg-bg-secondary px-4 py-3 pr-12 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {hasCustomApiKey() && (
          <p className="mb-4 text-xs text-accent-primary">
            当前使用自定义 Key
          </p>
        )}

        <div className="flex gap-2">
          {hasCustomApiKey() && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              恢复默认
            </button>
          )}
          <button
            onClick={handleSave}
            className="ml-auto rounded-xl bg-accent-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-primary/90"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
