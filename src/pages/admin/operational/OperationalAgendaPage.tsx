import { useState, useMemo } from 'react'
import useAppStore, { Order, SERVICE_TYPE_LABELS } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CalendarIcon,
  LayoutTemplate,
  CalendarDays,
  CalendarRange,
  X,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  format,
  startOfWeek,
  endOfMonth,
  startOfMonth,
  addMinutes,
  getDaysInMonth,
  addDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import CreateOrderDialog from '@/components/admin/CreateOrderDialog'
import OrderDetailsDialog from '@/components/admin/OrderDetailsDialog'

const getStatusColor = (status: string, dateStr: string | null) => {
  if (dateStr) {
    const isDelayed = new Date(dateStr) < new Date() && !['completed', 'cancelled'].includes(status)
    if (isDelayed) return 'bg-destructive/10 border-destructive/50 text-destructive dark:text-red-400'
  }
  if (['pending', 'scheduled'].includes(status))
    return 'bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400'
  if (['in_progress', 'deslocamento', 'paused'].includes(status))
    return 'bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-400'
  if (['completed'].includes(status))
    return 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400'
  return 'bg-muted border-muted-foreground/30 text-foreground'
}

export default function OperationalAgendaPage() {
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const { orders, updateOrder, contracts } = useAppStore()
  const { teams } = useOperationalStore()

  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [date, setDate] = useState<Date>(new Date())
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [contractId, setContractId] = useState<string>('all')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all')

  const [draggedOrder, setDraggedOrder] = useState<string | null>(null)
  
  // Dialogs State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ teamId?: string; date?: Date }>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const bounds = useMemo(() => {
    if (view === 'daily') {
      const s = startOfDay(date)
      s.setHours(7, 0, 0, 0)
      const e = startOfDay(date)
      e.setHours(19, 0, 0, 0)
      return { start: s, end: e }
    }
    if (view === 'weekly') {
      const s = startOfWeek(date, { weekStartsOn: 1 })
      const e = endOfDay(addDays(s, 6))
      return { start: s, end: e }
    }
    const s = startOfMonth(date)
    const e = endOfMonth(date)
    return { start: s, end: e }
  }, [view, date])

  const columns = useMemo(() => {
    if (view === 'daily') {
      return Array.from({ length: 12 }).map((_, i) => ({
        key: `h-${i}`,
        label: `${String(7 + i).padStart(2, '0')}:00`,
        start: addMinutes(bounds.start, i * 60),
        end: addMinutes(bounds.start, (i + 1) * 60),
      }))
    }
    if (view === 'weekly') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(bounds.start, i)
        return {
          key: `d-${i}`,
          label: format(d, 'EEEE', { locale: ptBR }),
          start: startOfDay(d),
          end: endOfDay(d),
        }
      })
    }
    const days = getDaysInMonth(bounds.start)
    return Array.from({ length: days }).map((_, i) => {
      const d = addDays(bounds.start, i)
      return {
        key: `d-${i}`,
        label: format(d, 'dd/MM'),
        start: startOfDay(d),
        end: endOfDay(d),
      }
    })
  }, [view, bounds])

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (contractId === 'all' || o.contractId === contractId) &&
        (serviceTypeFilter === 'all' || o.serviceType === serviceTypeFilter)
    )
  }, [orders, contractId, serviceTypeFilter])

  const unassignedOrders = useMemo(() => {
    return filteredOrders.filter((o) => !o.teamId && !o.technicianId)
  }, [filteredOrders])

  const viewOrders = useMemo(() => {
    return filteredOrders.filter((o) => {
      if (!o.scheduledAt) return false
      const s = new Date(o.scheduledAt)
      return s >= bounds.start && s <= bounds.end
    })
  }, [filteredOrders, bounds])

  const ordersByTeamAndCol = useMemo(() => {
    const map = new Map<string, Order[]>()
    viewOrders.forEach((o) => {
      if (!o.teamId || !o.scheduledAt) return
      const s = new Date(o.scheduledAt)
      const col = columns.find((c) => s >= c.start && s <= c.end)
      if (col) {
        const key = `${o.teamId}-${col.key}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(o)
      }
    })
    return map
  }, [viewOrders, columns])

  const filteredTeams = teams.filter((t) => teamFilter === 'all' || t.id === teamFilter)

  const handleDropOnCell = async (e: React.DragEvent, teamId: string, colStart: Date) => {
    e.preventDefault()
    e.stopPropagation()
    const id = e.dataTransfer.getData('orderId')
    if (!id) return

    try {
      await updateOrder(id, {
        team_id: teamId,
        technician_id: null,
        scheduled_at: colStart.toISOString(),
        status: 'scheduled',
      })
      toast({ title: 'OS escalada com sucesso' })
    } catch {
      toast({ title: 'Erro ao escalar OS', variant: 'destructive' })
    }
  }

  const handleUnassign = async (id: string) => {
    try {
      await updateOrder(id, {
        team_id: null,
        technician_id: null,
        scheduled_at: null,
        status: 'pending',
      })
      toast({ title: 'OS Desvinculada', description: 'A OS retornou para a fila pendente.' })
    } catch {
      toast({ title: 'Erro ao desvincular', variant: 'destructive' })
    }
  }

  const openCreateDialog = (teamId?: string, colStart?: Date) => {
    setCreateDefaults({ teamId, date: colStart })
    setIsCreateOpen(true)
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
      {/* Top Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-card p-3 rounded-lg border shadow-sm gap-4">
        <h2 className="text-xl font-bold tracking-tight shrink-0">Agenda e Escalas</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex border rounded-md overflow-hidden bg-background">
            <Button
              variant={view === 'daily' ? 'default' : 'ghost'}
              onClick={() => setView('daily')}
              className="rounded-none h-9 px-3"
            >
              <LayoutTemplate className="w-4 h-4 mr-2 hidden sm:block" /> Diário
            </Button>
            <Button
              variant={view === 'weekly' ? 'default' : 'ghost'}
              onClick={() => setView('weekly')}
              className="rounded-none h-9 px-3"
            >
              <CalendarDays className="w-4 h-4 mr-2 hidden sm:block" /> Semanal
            </Button>
            <Button
              variant={view === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setView('monthly')}
              className="rounded-none h-9 px-3"
            >
              <CalendarRange className="w-4 h-4 mr-2 hidden sm:block" /> Mensal
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal h-9"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {view === 'monthly'
                  ? format(date, 'MMMM yyyy', { locale: ptBR })
                  : format(date, 'PPP', { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={contractId} onValueChange={setContractId}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Contratos</SelectItem>
              {contracts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Equipes</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Tipo Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border bg-card">
        {/* Fila Pendente Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} className="flex flex-col">
          <div className="p-3 border-b bg-muted/30 font-semibold flex justify-between items-center h-12 shrink-0">
            <span>Fila Pendente</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unassignedOrders.length}</Badge>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openCreateDialog()}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('orderId')
              if (id) await handleUnassign(id)
            }}
          >
            {unassignedOrders.map((o) => (
              <div
                key={o.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('orderId', o.id)
                  setDraggedOrder(o.id)
                }}
                onDragEnd={() => setDraggedOrder(null)}
                onClick={() => setSelectedOrder(o)}
                className={cn(
                  'group/card p-3 rounded-lg border-2 cursor-grab shadow-sm text-sm hover:border-primary transition-all bg-background relative',
                  getStatusColor(o.status, null),
                  draggedOrder === o.id && 'opacity-50',
                )}
              >
                <div className="font-bold pr-6">{o.shortId}</div>
                <div className="text-xs opacity-80 mt-1 line-clamp-2 pr-2">{o.title}</div>
                <div className="mt-2 flex gap-2 flex-wrap items-center">
                  <Badge variant="outline" className="text-[10px] bg-background/80 text-foreground border-foreground/20 uppercase">
                    {o.priority}
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground ml-auto uppercase">
                    {SERVICE_TYPE_LABELS[o.serviceType]}
                  </span>
                </div>
              </div>
            ))}
            {unassignedOrders.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10 px-2">
                Nenhuma OS aguardando escalação.
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Grid Area */}
        <ResizablePanel defaultSize={80} className="flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-auto bg-card/50">
            {/* Grid Header */}
            <div className="flex h-12 border-b bg-muted/30 sticky top-0 z-20 w-max min-w-full">
              <div className="w-48 flex-shrink-0 border-r flex items-center px-4 font-semibold text-sm sticky left-0 bg-muted/80 backdrop-blur-md z-30">
                Equipes Operacionais
              </div>
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex-1 min-w-[120px] border-r flex items-center justify-center text-xs font-medium text-muted-foreground uppercase"
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="flex flex-col w-max min-w-full pb-4">
              {filteredTeams.map((team) => (
                <div key={team.id} className="flex min-h-[120px] border-b group hover:bg-muted/5 transition-colors">
                  {/* Row Header (Team) */}
                  <div className="w-48 flex-shrink-0 border-r p-3 flex flex-col justify-center bg-card sticky left-0 z-10 shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
                    <span className="font-bold text-sm truncate text-primary">{team.name}</span>
                    <span className="text-xs text-muted-foreground truncate mt-0.5">
                      {team.members.length} membro(s)
                    </span>
                    {team.shift_start && (
                      <span className="text-[10px] text-muted-foreground mt-1 bg-secondary w-fit px-1.5 rounded">
                        {team.shift_start} - {team.shift_end}
                      </span>
                    )}
                  </div>

                  {/* Row Cells */}
                  {columns.map((col) => {
                    const cellKey = `${team.id}-${col.key}`
                    const cellOrders = ordersByTeamAndCol.get(cellKey) || []
                    const count = cellOrders.length
                    const isOverloaded = count > 5

                    return (
                      <div
                        key={col.key}
                        className={cn(
                          "flex-1 min-w-[120px] border-r p-1.5 flex flex-col gap-1.5 transition-colors relative",
                          draggedOrder ? "hover:bg-primary/5" : ""
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnCell(e, team.id, col.start)}
                        onClick={(e) => {
                          if (e.target === e.currentTarget && isAdmin) {
                            openCreateDialog(team.id, col.start)
                          }
                        }}
                      >
                        {/* Cell Header with Density Indicator */}
                        <div className="flex justify-between items-center mb-1 h-5 shrink-0 px-1 pointer-events-none">
                          <span className="text-[10px] text-muted-foreground/50 font-medium">
                            {view === 'daily' ? format(col.start, 'HH:mm') : format(col.start, 'dd/MM')}
                          </span>
                          <div className="flex items-center gap-1">
                            {isOverloaded && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent>Equipe sobrecarregada neste período (>5 OS)</TooltipContent>
                              </Tooltip>
                            )}
                            {count > 0 && (
                              <Badge variant={isOverloaded ? 'destructive' : 'secondary'} className="text-[9px] h-4 px-1.5 py-0">
                                {count}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Order Cards in Cell */}
                        <div className="flex flex-col gap-1.5 flex-1 z-10 pointer-events-none">
                          {cellOrders.map((o) => (
                            <div
                              key={o.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('orderId', o.id)
                                setDraggedOrder(o.id)
                              }}
                              onDragEnd={() => setDraggedOrder(null)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(o)
                              }}
                              className={cn(
                                'group/item p-1.5 rounded border shadow-sm text-xs cursor-grab hover:shadow-md transition-all flex flex-col pointer-events-auto',
                                getStatusColor(o.status, o.scheduledAt),
                                draggedOrder === o.id && 'opacity-40 scale-95'
                              )}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-bold truncate">{o.shortId}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleUnassign(o.id)
                                  }}
                                  className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded-full hover:bg-background/50 transition-all shrink-0"
                                  title="Retornar à fila"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-[10px] opacity-80 truncate mt-0.5 leading-tight">
                                {o.title}
                              </div>
                              <div className="text-[9px] font-medium mt-1 flex items-center gap-1 opacity-70">
                                <Clock className="w-2.5 h-2.5" />
                                {format(new Date(o.scheduledAt!), 'HH:mm')}
                              </div>
                            </div>
                          ))}
                          
                          {/* Empty state prompt on hover if admin */}
                          {count === 0 && isAdmin && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none bg-muted/10 transition-opacity m-1 rounded border border-dashed border-muted-foreground/30">
                              <Plus className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              {filteredTeams.length === 0 && (
                <div className="p-8 text-center text-muted-foreground w-full">
                  Nenhuma equipe corresponde aos filtros.
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Dialogs */}
      <CreateOrderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultTeamId={createDefaults.teamId}
        defaultDate={createDefaults.date}
      />
      
      <OrderDetailsDialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  )
}
