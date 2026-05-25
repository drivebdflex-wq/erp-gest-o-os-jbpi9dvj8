import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function FinanceNav() {
  const location = useLocation()
  const links = [
    { name: 'Dashboard Executivo', path: '/financeiro/dashboard' },
    { name: 'DRE', path: '/financeiro/dre' },
    { name: 'Fluxo de Caixa', path: '/financeiro/fluxo-caixa' },
    { name: 'Receitas', path: '/financeiro/receitas' },
    { name: 'Custos Operacionais', path: '/financeiro/custos' },
    { name: 'Compras', path: '/financeiro/compras' },
    { name: 'Estoque & Análise', path: '/financeiro/estoque' },
    { name: 'Eficiência Técnica', path: '/financeiro/tecnicos' },
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
