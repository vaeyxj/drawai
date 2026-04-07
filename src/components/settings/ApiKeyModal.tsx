import { useState } from 'react'
import { X, Key, Eye, EyeOff, RotateCcw, Globe } from 'lucide-react'
import {
  getApiKey, setApiKey, hasCustomApiKey,
  getBaseUrl, setBaseUrl, hasCustomBaseUrl,
  isOfficialKey,
} from '@/constants'

interface ApiKeyModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSaved: () => void
}

export default function ApiKeyModal({ open, onClose, onSaved }: ApiKeyModalProps) {
  const [keyValue, setKeyValue] = useState(() => hasCustomApiKey() ? getApiKey() : '')
  const [urlValue, setUrlValue] = useState(() => hasCustomBaseUrl() ? getBaseUrl() : '')
  const [visible, setVisible] = useState(false)

  if (!open) return null

  const detectedType = keyValue.trim()
    ? isOfficialKey(keyValue.trim()) ? 'official' : 'proxy'
    : null

  const handleSave = () => {
    setApiKey(keyValue)
    setBaseUrl(urlValue)
    onSaved()
    onClose()
  }

  const handleReset = () => {
    setKeyValue('')
    setUrlValue('')
    setApiKey('')
    setBaseUrl('')
    onSaved()
    onClose()
  }

  const hasCustomConfig = hasCustomApiKey() || hasCustomBaseUrl()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border-default bg-bg-primary p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">API 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-hover hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          支持 Google Gemini 官方 Key 和第三方中转 Key。
        </p>

        {/* API Key */}
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">API Key</label>
        <div className="relative mb-3">
          <input
            type={visible ? 'text' : 'password'}
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="AIza... (官方) 或 sk-... (中转)"
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

        {detectedType && (
          <p className="mb-3 text-xs text-accent-primary">
            {detectedType === 'official'
              ? '检测到 Google 官方 Key，将直接连接 Gemini API'
              : '检测到中转 Key，将使用 Bearer Token 认证'}
          </p>
        )}

        {/* Base URL */}
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            自定义 Base URL（可选）
          </span>
        </label>
        <input
          type="text"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          placeholder="https://your-proxy.com"
          className="mb-1.5 w-full rounded-xl border border-border-default bg-bg-secondary px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
        />
        <p className="mb-4 text-xs text-text-tertiary">
          留空则使用默认地址。填写后将拼接 /v1beta/models/... 路径。
        </p>

        {hasCustomConfig && (
          <p className="mb-4 text-xs text-accent-primary">
            当前使用自定义配置
          </p>
        )}

        <div className="flex gap-2">
          {hasCustomConfig && (
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
