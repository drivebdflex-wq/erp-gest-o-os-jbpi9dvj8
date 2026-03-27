import { useState, useMemo, useRef, useEffect } from 'react'
import useAppStore, { Order, SERVICE_TYPE_COLORS } from '@/stores/useAppStore'
import useOperationalStore, { OpTeam } from '@/stores/useOperationalStore'
import { Badge } from '@/components/ui/badge'
import { Clock, CalendarIcon, LayoutTemplate, CalendarDays, CalendarRange, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
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
  differenceInMinutes,
  addMinutes,
  getDaysInMonth,
  addDays,
  differenceInDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const getCardStyles = (order: Order, isConflict: boolean) => {
  if (isConflict)
    return 'bg-destructive/20 border-destructive text-destructive dark:text-red-400 ring-2 ring-destructive ring-offset-1 animate-pulse'
  return (
    SERVICE_TYPE_COLORS[order.serviceType] || 'bg-muted border-muted-foreground/30 text-foreground'
  )
}

export default function OperationalAgendaPage() {
  const { orders, updateOrder, contracts } = useAppStore()
  const { teams } = useOperationalStore()

  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [date, setDate] = useState<Date>(new Date())
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [contractId, setContractId] = useState<string>('all')

  const timelineRef = useRef<HTMLDivElement>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [resizeWidth, setResizeWidth] = useState<number | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; orig: number } | null>(null)
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null)

  const bounds = useMemo(() => {
    if (view === 'daily') {
      const s = new Date(date)
      s.setHours(7, 0, 0, 0)
      const e = new Date(date)
      e.setHours(19, 0, 0, 0)
      return { start: s, end: e, totalMins: 12 * 60 }
    }
    if (view === 'weekly') {
      const s = startOfWeek(date, { weekStartsOn: 1 })
      s.setHours(0, 0, 0, 0)
      const e = new Date(s)
      e.setDate(e.getDate() + 7)
      return { start: s, end: e, totalMins: 7 * 24 * 60 }
    }
    const s = startOfMonth(date)
    s.setHours(0, 0, 0, 0)
    const days = getDaysInMonth(date)
    const e = new Date(s)
    e.setDate(e.getDate() + days)
    return { start: s, end: e, totalMins: days * 24 * 60 }
  }, [view, date])

  const viewOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = new Date(o.scheduledAt)
      const e = addMinutes(s, o.estimatedDuration || 60)
      return (
        s < bounds.end && e > bounds.start && (contractId === 'all' || o.contractId === contractId)
      )
    })
  }, [orders, bounds, contractId])

  const conflictingOrders = useMemo(() => {
    const conflicts = new Set<string>()
    const byTeam = viewOrders.reduce(
      (acc, o) => {
        if (o.teamId) {
          if (!acc[o.teamId]) acc[o.teamId] = []
          acc[o.teamId].push(o)
        }
        return acc
      },
      {} as Record<string, Order[]>,
    )

    for (const tId in byTeam) {
      const teamOrders = byTeam[tId]
      for (let i = 0; i < teamOrders.length; i++) {
        for (let j = i + 1; j < teamOrders.length; j++) {
          const o1 = teamOrders[i]
          const o2 = teamOrders[j]
          const s1 = new Date(o1.scheduledAt).getTime()
          const e1 = s1 + (o1.estimatedDuration || 60) * 60000
          const s2 = new Date(o2.scheduledAt).getTime()
          const e2 = s2 + (o2.estimatedDuration || 60) * 60000
          if (s1 < e2 && s2 < e1) {
            conflicts.add(o1.id)
            conflicts.add(o2.id)
          }
        }
      }
    }
    return conflicts
  }, [viewOrders])

  const unassignedOrders = useMemo(() => {
    return orders.filter((o) => !o.teamId && (contractId === 'all' || o.contractId === contractId))
  }, [orders, contractId])

  const filteredTeams = teams.filter((t) => teamFilter === 'all' || t.id === teamFilter)

  useEffect(() => {
    if (!resizingId || !resizeStart || !timelineRef.current) return
    const onMove = (e: PointerEvent) => {
      const pxPerMin = timelineRef.current!.getBoundingClientRect().width / bounds.totalMins
      const deltaMins = Math.round((e.clientX - resizeStart.x) / pxPerMin / 15) * 15
      setResizeWidth(Math.max(15, resizeStart.orig + deltaMins))
    }
    const onUp = async () => {
      if (resizingId && resizeWidth !== null && resizeWidth !== resizeStart.orig) {
        try {
          await updateOrder(resizingId, { estimated_duration_minutes: resizeWidth })
          toast({ title: 'Duração Atualizada', description: `Nova duração: ${resizeWidth} min.` })
        } catch {
          toast({ title: 'Erro ao atualizar', variant: 'destructive' })
        }
      }
      setResizingId(null)
      setResizeWidth(null)
      setResizeStart(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [resizingId, resizeStart, resizeWidth, updateOrder, bounds.totalMins])

  const handleDropOnTeam = async (e: React.DragEvent, teamId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('orderId')
    if (!id || !timelineRef.current) return

    const rowRect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rowRect.left) / rowRect.width))
    const startMins = Math.round((pct * bounds.totalMins) / 15) * 15
    const dropDate = addMinutes(bounds.start, startMins)

    try {
      await updateOrder(id, {
        team_id: teamId,
        technician_id: null,
        scheduled_at: dropDate.toISOString(),
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

  const renderColumns = () => {
    if (view === 'daily') {
      return Array.from({ length: 13 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-border/50 text-[10px] text-muted-foreground pl-1 pt-1"
          style={{ left: `${(i / 12) * 100}%` }}
        >
          {String(7 + i).padStart(2, '0')}:00
        </div>
      ))
    }
    if (view === 'weekly') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(bounds.start, i)
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-border/50 text-[10px] text-muted-foreground pl-1 pt-1"
            style={{ left: `${(i / 7) * 100}%`, width: `${100 / 7}%` }}
          >
            {format(d, 'EEEE', { locale: ptBR })}
          </div>
        )
      })
    }
    if (view === 'monthly') {
      const days = differenceInDays(bounds.end, bounds.start)
      return Array.from({ length: days }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-border/50 text-[10px] text-muted-foreground pl-1 pt-1 flex justify-center"
          style={{ left: `${(i / days) * 100}%`, width: `${100 / days}%` }}
        >
          {i + 1}
        </div>
      ))
    }
  }

  const numCols =
    view === 'daily' ? 12 : view === 'weekly' ? 7 : differenceInDays(bounds.end, bounds.start)

  const renderGridLines = () => {
    return Array.from({ length: numCols + 1 }).map((_, i) => (
      <div
        key={i}
        className="absolute top-0 bottom-0 border-l border-border/50 pointer-events-none"
        style={{ left: `${(i / numCols) * 100}%` }}
      />
    ))
  }

  const renderNonWorkingHours = (team: OpTeam) => {
    if (!team.shift_start || !team.shift_end) return null
    const [startH, startM] = team.shift_start.split(':').map(Number)
    const [endH, endM] = team.shift_end.split(':').map(Number)

    const blocks = []

    if (view === 'daily') {
      const shiftStartMins = startH * 60 + startM
      const shiftEndMins = endH * 60 + endM
      const viewStartMins = 7 * 60
      const viewEndMins = 19 * 60

      if (shiftStartMins > viewStartMins) {
        const dur = Math.min(shiftStartMins, viewEndMins) - viewStartMins
        if (dur > 0) blocks.push({ start: 0, dur })
      }
      if (shiftEndMins < viewEndMins) {
        const startInView = Math.max(shiftEndMins, viewStartMins) - viewStartMins
        const dur = viewEndMins - Math.max(shiftEndMins, viewStartMins)
        if (dur > 0) blocks.push({ start: startInView, dur })
      }
    } else {
      const days = view === 'weekly' ? 7 : getDaysInMonth(date)
      for (let i = 0; i < days; i++) {
        const dayStartMins = i * 24 * 60
        const shiftStartMins = dayStartMins + startH * 60 + startM
        const shiftEndMins = dayStartMins + endH * 60 + endM
        const dayEndMins = dayStartMins + 24 * 60

        blocks.push({ start: dayStartMins, dur: startH * 60 + startM })
        blocks.push({ start: shiftEndMins, dur: dayEndMins - shiftEndMins })
      }
    }

    return blocks.map((b, i) => (
      <div
        key={i}
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: `${(b.start / bounds.totalMins) * 100}%`,
          width: `${(b.dur / bounds.totalMins) * 100}%`,
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
        }}
      />
    ))
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
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
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border bg-card">
        <ResizablePanel defaultSize={20} minSize={15} className="flex flex-col">
          <div className="p-3 border-b bg-muted/30 font-semibold flex justify-between items-center h-12 shrink-0">
            <span>Fila Pendente</span>
            <Badge variant="secondary">{unassignedOrders.length}</Badge>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('orderId')
              if (id) {
                await handleUnassign(id)
              }
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
                className={cn(
                  'p-3 rounded-lg border-2 cursor-grab shadow-sm text-sm hover:border-primary transition-all bg-background',
                  SERVICE_TYPE_COLORS[o.serviceType],
                  draggedOrder === o.id && 'opacity-50',
                )}
              >
                <div className="font-bold">{o.shortId}</div>
                <div className="text-xs opacity-80 mt-1 line-clamp-2">{o.title}</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-background/80 text-foreground border-foreground/20"
                  >
                    {o.priority}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-background/80 text-foreground"
                  >
                    <Clock className="w-3 h-3 mr-1 inline" />
                    {o.estimatedDuration}m
                  </Badge>
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

        <ResizablePanel defaultSize={80} className="flex flex-col relative">
          <div className="flex h-12 border-b bg-muted/30 shrink-0">
            <div className="w-48 flex-shrink-0 border-r flex items-center px-4 font-semibold text-sm">
              Equipes Operacionais
            </div>
            <div className="flex-1 relative" ref={timelineRef}>
              {renderColumns()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filteredTeams.map((team) => (
              <div key={team.id} className="flex min-h-[90px] border-b group relative">
                <div className="w-48 flex-shrink-0 border-r p-3 flex flex-col justify-center bg-card group-hover:bg-muted/10 relative z-10">
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

                <div
                  className="flex-1 relative bg-card/50 group-hover:bg-muted/5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnTeam(e, team.id)}
                >
                  {renderNonWorkingHours(team)}
                  {renderGridLines()}

                  {viewOrders
                    .filter((o) => o.teamId === team.id)
                    .map((o) => {
                      const st = differenceInMinutes(new Date(o.scheduledAt), bounds.start)
                      const isRes = resizingId === o.id
                      const dur =
                        isRes && resizeWidth !== null ? resizeWidth : o.estimatedDuration || 60
                      const visStart = Math.max(0, st)
                      const visDur = Math.min(bounds.totalMins, st + dur) - visStart
                      if (visDur <= 0) return null

                      const isConflict = conflictingOrders.has(o.id)
                      const leftPct = (visStart / bounds.totalMins) * 100
                      const widthPct = (visDur / bounds.totalMins) * 100

                      return (
                        <div
                          key={o.id}
                          draggable={!isRes}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('orderId', o.id)
                            setDraggedOrder(o.id)
                          }}
                          onDragEnd={() => setDraggedOrder(null)}
                          className={cn(
                            'group/card absolute top-2 bottom-2 rounded-md border shadow-sm p-1.5 text-xs overflow-hidden flex flex-col transition-all hover:shadow-md cursor-grab active:cursor-grabbing min-w-[12px]',
                            getCardStyles(o, isConflict),
                            isRes && 'z-50 ring-2 ring-primary cursor-col-resize',
                            draggedOrder === o.id && 'opacity-40 scale-95',
                          )}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        >
                          <div className="font-bold truncate select-none pr-4">{o.shortId}</div>
                          {widthPct > 5 && (
                            <div className="truncate opacity-90 select-none hidden md:block pr-4">
                              {o.title}
                            </div>
                          )}
                          {widthPct > 10 && (
                            <div className="text-[10px] mt-auto font-medium select-none truncate pr-4">
                              {format(
                                new Date(o.scheduledAt),
                                view === 'daily' ? 'HH:mm' : 'dd/MM HH:mm',
                              )}{' '}
                              -{' '}
                              {format(
                                new Date(new Date(o.scheduledAt).getTime() + dur * 60000),
                                view === 'daily' ? 'HH:mm' : 'dd/MM HH:mm',
                              )}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleUnassign(o.id)
                            }}
                            className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 p-0.5 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all z-20"
                            title="Desvincular e retornar à fila"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div
                            className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center group/handle"
                            onPointerDown={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              setResizingId(o.id)
                              setResizeStart({ x: e.clientX, orig: dur })
                            }}
                          >
                            <div className="w-0.5 h-4 bg-foreground/30 rounded-full group-hover/handle:bg-foreground/60" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
            {filteredTeams.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma equipe corresponde aos filtros.
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
