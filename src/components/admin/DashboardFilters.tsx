import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore from '@/stores/useAppStore'
import { Filter } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardFilters() {
  const { filters, setDashboardFilter, clients, orders, contracts } = useAppStore()

  const units = useMemo(() => {
    const u = new Set(orders.map((o) => o.unit))
    return Array.from(u).sort()
  }, [orders])

  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center animate-fade-in w-full">
      <div className="flex items-center gap-2 text-muted-foreground mr-2 col-span-1 sm:col-span-2 md:col-span-1">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtros Operacionais:</span>
      </div>

      <Select value={filters.client} onValueChange={(v) => setDashboardFilter('client', v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.contract || 'all'}
        onValueChange={(v) => setDashboardFilter('contract', v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Contrato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Contratos</SelectItem>
          {contracts.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(v) => setDashboardFilter('type', v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tipo de Serviço" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          <SelectItem value="Preventiva">Preventiva</SelectItem>
          <SelectItem value="Corretiva">Corretiva</SelectItem>
          <SelectItem value="Obra">Obra</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.period} onValueChange={(v) => setDashboardFilter('period', v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo o Período</SelectItem>
          <SelectItem value="Hoje">Hoje</SelectItem>
          <SelectItem value="Semana">Esta Semana</SelectItem>
          <SelectItem value="Mês">Este Mês</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
