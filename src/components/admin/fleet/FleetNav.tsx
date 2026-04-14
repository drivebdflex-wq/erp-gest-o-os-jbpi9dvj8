import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function FleetNav() {
  const location = useLocation()
  const links = [
    { name: 'Dashboard', path: '/frotas/dashboard' },
    { name: 'Veículos', path: '/veiculos' },
    { name: 'Motoristas', path: '/frotas/motoristas' },
    { name: 'Manutenções', path: '/frotas/manutencoes' },
    { name: 'Abastecimentos', path: '/frotas/abastecimentos' },
    { name: 'Histórico', path: '/frotas/historico' },
  ]

  return (
    <div className="flex overflow-x-auto pb-[2px] mb-6 border-b border-border no-scrollbar gap-6">
      {links.map((l) => {
        // Exact match check for active tab selection styling except vehicles where subroutes exist
        const isActuallyActive =
          location.pathname === l.path ||
          (l.path === '/veiculos' && location.pathname.startsWith('/veiculos/'))

        return (
          <Link
            key={l.path}
            to={l.path}
            className={cn(
              'text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors',
              isActuallyActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {l.name}
          </Link>
        )
      })}
    </div>
  )
}
