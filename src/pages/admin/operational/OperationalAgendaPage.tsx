import { useState, useMemo, useRef, useEffect } from 'react'
import useAppStore, { Order } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { Badge } from '@/components/ui/badge'
import { Clock, CalendarIcon } from 'lucide-react'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const TIMELINE_START = 7
const TIMELINE_END = 19
const TOTAL_MINS = (TIMELINE_END - TIMELINE_START) * 60

const getStatusStyles = (order: Order) => {
  const isOverdue =
    new Date(order.scheduledAt) < new Date() &&
    !['completed', 'in_progress'].includes(order.dbStatus)
  if (isOverdue) return 'bg-destructive/20 border-destructive text-destructive dark:text-red-400'
  if (order.dbStatus === 'completed')
    return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
  if (order.dbStatus === 'in_progress')
    return 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'
  if (order.dbStatus === 'scheduled' || order.dbStatus === 'deslocamento')
    return 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400'
  return 'bg-muted border-muted-foreground/30 text-foreground'
}

export default function OperationalAgendaPage() {
  const { orders, updateOrder } = useAppStore()
  const { technicians, teams } = useOperationalStore()

  const [date, setDate] = useState<Date>(new Date())
  const [team, setTeam] = useState<string>('all')
  const [tech, setTech] = useState<string>('all')

  const timelineRef = useRef<HTMLDivElement>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [resizeWidth, setResizeWidth] = useState<number | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; orig: number } | null>(null)
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null)

  const dayOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.scheduledAt)
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      )
    })
  }, [orders, date])

  const unassignedOrders = dayOrders.filter((o) => !o.technicianId)
  const filteredTechs = technicians.filter(
    (t) => (team === 'all' || t.team_id === team) && (tech === 'all' || t.id === tech),
  )

  useEffect(() => {
    if (!resizingId || !resizeStart || !timelineRef.current) return
    const onMove = (e: PointerEvent) => {
      const pxPerMin = timelineRef.current!.getBoundingClientRect().width / TOTAL_MINS
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
  }, [resizingId, resizeStart, resizeWidth, updateOrder])

  const handleDropOnTech = async (e: React.DragEvent, techId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('orderId')
    if (!id || !timelineRef.current) return
    const rowRect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rowRect.left) / rowRect.width))
    const startMins = TIMELINE_START * 60 + Math.round((pct * TOTAL_MINS) / 15) * 15
    const dropDate = new Date(date)
    dropDate.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0)

    const oToMove = orders.find((o) => o.id === id)
    const newEndMs = dropDate.getTime() + (oToMove?.estimatedDuration || 60) * 60000
    const conflict = dayOrders.some(
      (o) =>
        o.technicianId === techId &&
        o.id !== id &&
        dropDate.getTime() <
          new Date(o.scheduledAt).getTime() + (o.estimatedDuration || 60) * 60000 &&
        newEndMs > new Date(o.scheduledAt).getTime(),
    )
    if (conflict)
      return toast({
        title: 'Conflito de Agenda',
        description: 'Técnico ocupado neste horário.',
        variant: 'destructive',
      })
    try {
      await updateOrder(id, { technician_id: techId, scheduled_at: dropDate.toISOString() })
      toast({ title: 'OS reagendada com sucesso' })
    } catch {
      toast({ title: 'Erro ao reagendar', variant: 'destructive' })
    }
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-3 rounded-lg border shadow-sm gap-4">
        <h2 className="text-xl font-bold tracking-tight">Agenda Operacional</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP', { locale: ptBR })}
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
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger className="w-[160px]">
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
          <Select value={tech} onValueChange={setTech}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Técnico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Técnicos</SelectItem>
              {technicians.map((t) => (
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
          <div className="p-3 border-b bg-muted/30 font-semibold flex justify-between items-center h-12">
            <span>Fila de Trabalho</span>
            <Badge variant="secondary">{unassignedOrders.length}</Badge>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('orderId')
              if (id) {
                const fallbackTeam =
                  orders.find((o) => o.id === id)?.teamId || teams[0]?.id || 'team-alpha'
                await updateOrder(id, { technician_id: null, team_id: fallbackTeam }).catch(() =>
                  toast({ title: 'Erro', variant: 'destructive' }),
                )
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
                  'p-3 rounded-lg border-2 cursor-grab shadow-sm text-sm hover:border-primary transition-all',
                  draggedOrder === o.id ? 'opacity-50' : 'bg-background',
                )}
              >
                <div className="font-bold">{o.shortId}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.title}</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {o.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    <Clock className="w-3 h-3 mr-1 inline" />
                    {o.estimatedDuration}m
                  </Badge>
                </div>
              </div>
            ))}
            {unassignedOrders.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10">
                Nenhuma OS pendente.
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80} className="flex flex-col relative">
          <div className="flex h-12 border-b bg-muted/30">
            <div className="w-48 flex-shrink-0 border-r flex items-center px-4 font-semibold text-sm">
              Técnicos
            </div>
            <div className="flex-1 relative" ref={timelineRef}>
              {Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/50 text-[10px] text-muted-foreground pl-1 pt-1"
                  style={{ left: `${((i * 60) / TOTAL_MINS) * 100}%` }}
                >
                  {String(TIMELINE_START + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filteredTechs.map((t) => (
              <div key={t.id} className="flex min-h-[80px] border-b group">
                <div className="w-48 flex-shrink-0 border-r p-3 flex flex-col justify-center bg-card group-hover:bg-muted/10">
                  <span className="font-medium text-sm truncate">{t.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {t.specialty || t.role || 'Técnico'}
                  </span>
                </div>

                <div
                  className="flex-1 relative bg-card/50 group-hover:bg-muted/5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnTech(e, t.id)}
                >
                  {Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-border/50 pointer-events-none"
                      style={{ left: `${((i * 60) / TOTAL_MINS) * 100}%` }}
                    />
                  ))}

                  {dayOrders
                    .filter((o) => o.technicianId === t.id)
                    .map((o) => {
                      const st = Math.max(
                        0,
                        new Date(o.scheduledAt).getHours() * 60 +
                          new Date(o.scheduledAt).getMinutes() -
                          TIMELINE_START * 60,
                      )
                      const isRes = resizingId === o.id
                      const dur =
                        isRes && resizeWidth !== null ? resizeWidth : o.estimatedDuration || 60
                      const visStart = Math.max(0, st)
                      const visDur = Math.min(TOTAL_MINS, st + dur) - visStart
                      if (visDur <= 0) return null
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
                            'absolute top-2 bottom-2 rounded-md border shadow-sm p-1.5 text-xs overflow-hidden flex flex-col transition-all hover:shadow-md cursor-grab active:cursor-grabbing',
                            getStatusStyles(o),
                            isRes && 'z-50 ring-2 ring-primary cursor-col-resize',
                            draggedOrder === o.id && 'opacity-40 scale-95',
                          )}
                          style={{
                            left: `${(visStart / TOTAL_MINS) * 100}%`,
                            width: `${(visDur / TOTAL_MINS) * 100}%`,
                          }}
                        >
                          <div className="font-bold truncate select-none">{o.shortId}</div>
                          <div className="truncate opacity-90 select-none hidden md:block">
                            {o.title}
                          </div>
                          <div className="text-[10px] mt-auto font-medium select-none">
                            {format(new Date(o.scheduledAt), 'HH:mm')} -{' '}
                            {format(
                              new Date(new Date(o.scheduledAt).getTime() + dur * 60000),
                              'HH:mm',
                            )}
                          </div>
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
            {filteredTechs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum técnico corresponde aos filtros.
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
