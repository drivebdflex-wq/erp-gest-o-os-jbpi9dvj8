import { ClipboardList, Map as MapIcon, UserCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function TechBottomNav() {
  const location = useLocation()

  const navItems = [
    { title: 'Minhas OS', url: '/tech', icon: ClipboardList },
    { title: 'Rotas', url: '/tech/rotas', icon: MapIcon },
    { title: 'Perfil', url: '/tech/perfil', icon: UserCircle },
  ]

  return (
    <div className="absolute bottom-0 w-full border-t bg-background px-6 py-3 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url
          return (
            <Link key={item.title} to={item.url} className="flex flex-col items-center gap-1 group">
              <div
                className={cn(
                  'p-2 rounded-2xl transition-all duration-300',
                  isActive
                    ? 'bg-primary/10 text-primary scale-110'
                    : 'text-muted-foreground group-hover:text-primary',
                )}
              >
                <item.icon className={cn('h-6 w-6', isActive && 'fill-primary/20')} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
