import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sparkles, Images, Heart, Settings } from 'lucide-react'
import ApiKeyModal from '@/components/settings/ApiKeyModal'
import { useAppStore } from '@/store/useAppStore'

const navItems = [
  { to: '/', icon: Sparkles, label: '生成' },
  { to: '/gallery', icon: Images, label: '画廊' },
  { to: '/favorites', icon: Heart, label: '收藏' },
]

export default function Header() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const addToast = useAppStore((s) => s.addToast)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-default bg-bg-primary/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-lg font-bold text-transparent">
              DrawAI
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setShowApiKeyModal(true)}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            title="API Key 设置"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSaved={() => addToast('success', 'API Key 已更新')}
      />
    </>
  )
}
