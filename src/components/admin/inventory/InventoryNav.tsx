import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function InventoryNav() {
  const location = useLocation()
  const links = [
    { name: 'Dashboard', path: '/estoque/dashboard' },
    { name: 'Produtos', path: '/estoque/produtos' },
    { name: 'Almoxarifado Central', path: '/estoque/almoxarifado' },
    { name: 'Estoque por Veículo', path: '/estoque/veiculos' },
    { name: 'Movimentações', path: '/estoque/movimentacoes' },
    { name: 'Requisições', path: '/estoque/requisicoes' },
    { name: 'Inventário Físico', path: '/estoque/inventario' },
  ]

  return (
    <div className="flex overflow-x-auto pb-[2px] mb-6 border-b border-border no-scrollbar gap-6">
      {links.map((l) => {
        const active = location.pathname === l.path
        return (
          <Link
            key={l.path}
            to={l.path}
            className={cn(
              'text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors',
              active
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
