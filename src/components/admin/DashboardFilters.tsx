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
  const { filters, setDashboardFilter, clients, orders } = useAppStore()

  const units = useMemo(() => {
    const u = new Set(orders.map((o) => o.unit))
    return Array.from(u).sort()
  }, [orders])

  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:flex xl:flex-row gap-4 xl:items-center animate-fade-in">
      <div className="flex items-center gap-2 text-muted-foreground xl:mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <Select value={filters.client} onValueChange={(v) => setDashboardFilter('client', v)}>
        <SelectTrigger className="w-full xl:w-[200px]">
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

      <Select value={filters.unit} onValueChange={(v) => setDashboardFilter('unit', v)}>
        <SelectTrigger className="w-full xl:w-[200px]">
          <SelectValue placeholder="Unidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Unidades</SelectItem>
          {units.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(v) => setDashboardFilter('type', v)}>
        <SelectTrigger className="w-full xl:w-[180px]">
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
        <SelectTrigger className="w-full xl:w-[180px]">
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
