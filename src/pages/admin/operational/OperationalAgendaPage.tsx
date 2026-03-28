import { useState, useMemo } from 'react'
import useAppStore, { Order, SERVICE_TYPE_LABELS } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, LayoutTemplate, CalendarDays, CalendarRange, X, Plus } from 'lucide-react'
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
import {
  format,
  startOfWeek,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  endOfWeek,
  addDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import CreateOrderDialog from '@/components/admin/CreateOrderDialog'
import OrderDetailsDialog from '@/components/admin/OrderDetailsDialog'
import { checkConflict } from '@/lib/schedule'

const HOUR_HEIGHT = 60
const START_HOUR = 7
const END_HOUR = 19
const HOURS_COUNT = END_HOUR - START_HOUR

const getStatusColor = (status: string, dateStr: string | null) => {
  if (dateStr) {
    const isDelayed = new Date(dateStr) < new Date() && !['completed', 'cancelled'].includes(status)
    if (isDelayed)
      return 'bg-destructive/10 border-destructive/50 text-destructive dark:text-red-400'
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

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createDefaults, setCreateDefaults] = useState<{ teamId?: string; date?: Date }>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (contractId === 'all' || o.contractId === contractId) &&
        (serviceTypeFilter === 'all' || o.serviceType === serviceTypeFilter),
    )
  }, [orders, contractId, serviceTypeFilter])

  const unassignedOrders = useMemo(() => {
    return filteredOrders.filter((o) => !o.teamId && !o.technicianId && o.status === 'pending')
  }, [filteredOrders])

  const filteredTeams = teams.filter((t) => teamFilter === 'all' || t.id === teamFilter)

  const handleDropOnTimeline = async (e: React.DragEvent, dropDate: Date, dropTeamId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    const id = e.dataTransfer.getData('orderId')
    if (!id) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const droppedMinutesFromStart = (y / HOUR_HEIGHT) * 60

    // Snap to 15 mins precision
    const snappedMinutes = Math.round(droppedMinutesFromStart / 15) * 15
    const totalMinutes = START_HOUR * 60 + snappedMinutes

    const newDate = new Date(dropDate)
    newDate.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0)

    const order = orders.find((o) => o.id === id)
    if (!order) return

    const teamToAssign = dropTeamId || order.teamId || null

    const hasConflict = checkConflict(
      orders as any[],
      teamToAssign,
      order.technicianId,
      newDate,
      order.estimatedDurationMinutes || 60,
      id,
    )

    if (hasConflict) {
      toast({
        title: 'Conflito de Horário',
        description:
          'Responsável indisponível neste horário (conflito ou intervalo obrigatório de 30m).',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateOrder(id, {
        team_id: teamToAssign,
        scheduled_at: newDate.toISOString(),
        status: order.status === 'pending' ? 'scheduled' : order.status,
      })
      toast({ title: 'OS reagendada com sucesso' })
    } catch {
      toast({ title: 'Erro ao reagendar', variant: 'destructive' })
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

  const renderMonthly = () => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="flex-1 flex flex-col h-full bg-card animate-fade-in">
        <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div
              key={d}
              className="p-2 border-r text-center font-semibold text-xs text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((d) => {
            const isCurrentMonth = isSameMonth(d, date)
            const dayOrders = filteredOrders.filter(
              (o) => o.scheduledAt && isSameDay(new Date(o.scheduledAt), d),
            )
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'border-r border-b p-2 flex flex-col gap-1 cursor-pointer hover:bg-muted/10 transition-colors relative',
                  !isCurrentMonth && 'bg-muted/5 opacity-50',
                )}
                onClick={() => {
                  setDate(d)
                  setView('daily')
                }}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                      isSameDay(d, new Date()) && 'bg-primary text-primary-foreground',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  {dayOrders.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1">
                      {dayOrders.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                  {Array.from(
                    new Set(dayOrders.map((o) => format(new Date(o.scheduledAt!), 'HH:mm'))),
                  )
                    .sort()
                    .slice(0, 6)
                    .map((t) => (
                      <span
                        key={t}
                        className="text-[9px] bg-secondary/60 px-1 py-0.5 rounded text-foreground font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  {dayOrders.length > 6 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{dayOrders.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTimeline = () => {
    let columns: { id: string; label: string; date: Date; teamId?: string }[] = []

    if (view === 'weekly') {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      columns = Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(weekStart, i)
        return {
          id: d.toISOString(),
          label: format(d, 'EEEE, dd/MM', { locale: ptBR }),
          date: d,
          teamId: teamFilter === 'all' ? undefined : teamFilter,
        }
      })
    } else if (view === 'daily') {
      if (filteredTeams.length === 0) {
        return (
          <div className="p-8 text-center text-muted-foreground w-full">
            Nenhuma equipe corresponde aos filtros.
          </div>
        )
      }
      columns = filteredTeams.map((t) => ({
        id: t.id,
        label: t.name,
        date: date,
        teamId: t.id,
      }))
    }

    const hours = Array.from({ length: HOURS_COUNT }).map((_, i) => START_HOUR + i)

    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-card relative animate-fade-in">
        <div className="flex sticky top-0 z-20 bg-muted/80 backdrop-blur-md border-b shrink-0">
          <div className="w-16 shrink-0 border-r" />
          {columns.map((c) => (
            <div
              key={c.id}
              className="flex-1 min-w-[150px] p-2 text-center border-r font-semibold text-sm capitalize truncate"
            >
              {c.label}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="flex relative min-w-max w-full">
            <div
              className="w-16 shrink-0 border-r bg-muted/5 relative pointer-events-none sticky left-0 z-10"
              style={{ height: HOURS_COUNT * HOUR_HEIGHT }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute w-full text-right pr-2 text-xs font-medium text-muted-foreground"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT - 8 }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {columns.map((c) => {
              const colOrders = filteredOrders.filter((o) => {
                if (!o.scheduledAt) return false
                const oDate = new Date(o.scheduledAt)
                if (!isSameDay(oDate, c.date)) return false
                if (c.teamId && o.teamId !== c.teamId) return false
                return true
              })

              return (
                <div
                  key={c.id}
                  className="flex-1 min-w-[150px] border-r relative group/col hover:bg-muted/5 transition-colors"
                  style={{ height: HOURS_COUNT * HOUR_HEIGHT }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnTimeline(e, c.date, c.teamId)}
                  onClick={(e) => {
                    if (e.target === e.currentTarget && isAdmin) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const y = e.clientY - rect.top
                      const droppedMinutesFromStart = (y / HOUR_HEIGHT) * 60
                      const newDate = new Date(c.date)
                      const totalMins =
                        START_HOUR * 60 + Math.round(droppedMinutesFromStart / 15) * 15
                      newDate.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0)
                      openCreateDialog(c.teamId, newDate)
                    }
                  }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute w-full border-t border-border/40 pointer-events-none"
                      style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    />
                  ))}
                  {colOrders.map((o) => {
                    const oDate = new Date(o.scheduledAt!)
                    const startMins = oDate.getHours() * 60 + oDate.getMinutes()
                    const top = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
                    const duration = o.estimatedDurationMinutes || 60
                    const height = (duration / 60) * HOUR_HEIGHT

                    return (
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
                          'absolute left-1 right-1 rounded border shadow-sm text-xs overflow-hidden cursor-grab hover:shadow-md transition-all z-10 flex flex-col group/item p-1.5',
                          getStatusColor(o.status, o.scheduledAt),
                          draggedOrder === o.id && 'opacity-40 scale-95',
                        )}
                        style={{ top, height: Math.max(height, 24) }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold truncate leading-tight">{o.shortId}</span>
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
                        {height >= 45 && (
                          <div className="text-[10px] truncate opacity-80 mt-0.5 leading-tight">
                            {o.title}
                          </div>
                        )}
                        {height >= 35 && (
                          <div className="text-[9px] mt-auto pt-1 opacity-70 font-medium">
                            {format(oDate, 'HH:mm')} -{' '}
                            {format(new Date(oDate.getTime() + duration * 60000), 'HH:mm')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {isAdmin && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/col:opacity-100 pointer-events-none">
                      <div className="bg-background/80 px-2 py-1 rounded shadow-sm border text-[10px] text-muted-foreground backdrop-blur-sm">
                        Clique para agendar
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-card p-3 rounded-lg border shadow-sm gap-4 shrink-0">
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
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border bg-card">
        <ResizablePanel defaultSize={20} minSize={15} className="flex flex-col">
          <div className="p-3 border-b bg-muted/30 font-semibold flex justify-between items-center h-12 shrink-0">
            <span>Fila Pendente</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unassignedOrders.length}</Badge>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => openCreateDialog()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/5 custom-scrollbar"
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
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-background/80 text-foreground border-foreground/20 uppercase"
                  >
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

        <ResizablePanel defaultSize={80} className="flex flex-col relative overflow-hidden">
          {view === 'monthly' ? renderMonthly() : renderTimeline()}
        </ResizablePanel>
      </ResizablePanelGroup>

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
