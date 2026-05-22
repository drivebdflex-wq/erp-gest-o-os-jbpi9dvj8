import { useState } from 'react'
import { addDays, addMonths, subDays, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AgendaSidebar from '@/components/admin/operational/AgendaSidebar'
import AgendaTimeline from '@/components/admin/operational/AgendaTimeline'
import AgendaCalendar from '@/components/admin/operational/AgendaCalendar'
import { useAgendaData } from '@/hooks/use-agenda-data'

export default function OperationalAgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'timeline' | 'day' | 'week' | 'month'>('timeline')

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    technician: 'all',
    client: 'all',
  })

  const { orders, technicians, clients, loading, updateOrder } = useAgendaData(currentDate)

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate((prev) => subMonths(prev, 1))
    else if (viewMode === 'week') setCurrentDate((prev) => subDays(prev, 7))
    else setCurrentDate((prev) => subDays(prev, 1))
  }

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate((prev) => addMonths(prev, 1))
    else if (viewMode === 'week') setCurrentDate((prev) => addDays(prev, 7))
    else setCurrentDate((prev) => addDays(prev, 1))
  }

  const filteredOrders = orders.filter((o) => {
    if (filters.priority !== 'all' && o.priority !== filters.priority) return false
    if (filters.status !== 'all' && o.status !== filters.status) return false
    if (filters.technician !== 'all' && o.technician_id !== filters.technician) return false
    if (filters.client !== 'all' && o.client_id !== filters.client) return false
    return true
  })

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Centro de Despacho Operacional
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciamento, roteirização e atribuição de ordens de serviço em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/30 rounded-md border p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 text-sm font-semibold capitalize min-w-[140px] text-center flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              {viewMode === 'month'
                ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                : format(currentDate, "dd 'de' MMM, yyyy", { locale: ptBR })}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 ml-1"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
          </div>

          <ToggleGroup
            type="single"
            value={viewMode === 'day' ? 'timeline' : viewMode}
            onValueChange={(v: any) => v && setViewMode(v)}
          >
            <ToggleGroupItem value="timeline" aria-label="Timeline" className="text-xs px-3 h-9">
              Gantt / Dia
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week" className="text-xs px-3 h-9">
              Semana
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month" className="text-xs px-3 h-9">
              Mês
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-3 rounded-lg border shadow-sm flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Filter className="w-4 h-4" /> Filtros:
        </div>

        <Select
          value={filters.client}
          onValueChange={(v) => setFilters((f) => ({ ...f, client: v }))}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.technician}
          onValueChange={(v) => setFilters((f) => ({ ...f, technician: v }))}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Técnicos</SelectItem>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.users?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
        >
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="in_progress">Em Execução</SelectItem>
          </SelectContent>
        </Select>

        {(filters.client !== 'all' ||
          filters.technician !== 'all' ||
          filters.priority !== 'all' ||
          filters.status !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              setFilters({ client: 'all', technician: 'all', priority: 'all', status: 'all' })
            }
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 bg-card rounded-lg border shadow-sm flex overflow-hidden">
        <AgendaSidebar orders={filteredOrders} />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Sincronizando despacho...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-muted/5 relative">
            {viewMode === 'timeline' || viewMode === 'day' ? (
              <AgendaTimeline
                date={currentDate}
                orders={filteredOrders}
                technicians={technicians}
                onUpdateOrder={updateOrder}
              />
            ) : (
              <AgendaCalendar date={currentDate} viewMode={viewMode} orders={filteredOrders} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
