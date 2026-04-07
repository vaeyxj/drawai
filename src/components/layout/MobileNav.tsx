import { NavLink } from 'react-router-dom'
import { Sparkles, Images, Heart, Gamepad2 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Sparkles, label: '生成' },
  { to: '/gallery', icon: Images, label: '画廊' },
  { to: '/favorites', icon: Heart, label: '收藏' },
  { to: '/assets', icon: Gamepad2, label: '素材' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-default bg-bg-primary/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 text-xs transition-colors ${
                isActive ? 'text-accent-primary' : 'text-text-muted'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
