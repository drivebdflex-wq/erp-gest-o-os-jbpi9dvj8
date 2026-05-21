import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function InventoryNav() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/estoque/dashboard' },
    { name: 'Produtos', path: '/estoque/produtos' },
    { name: 'Almox. Central', path: '/estoque/almoxarifado' },
    { name: 'Por Veículo', path: '/estoque/veiculos' },
    { name: 'Movimentos', path: '/estoque/movimentacoes' },
    { name: 'Entradas', path: '/estoque/entradas' },
    { name: 'Saídas', path: '/estoque/saidas' },
    { name: 'Transf.', path: '/estoque/transferencias' },
    { name: 'Inventário', path: '/estoque/inventario' },
    { name: 'Fornecedores', path: '/estoque/fornecedores' },
    { name: 'Compras', path: '/estoque/compras' },
  ]

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide border-b">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors border-b-2',
            location.pathname === item.path
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}
