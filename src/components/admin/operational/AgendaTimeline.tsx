import { useMemo } from 'react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { OrderContextMenu } from './OrderContextMenu'

interface AgendaTimelineProps {
  date: Date
  orders: any[]
  technicians: any[]
  onUpdateOrder: (id: string, updates: any) => void
}

const START_HOUR = 7
const END_HOUR = 20
const CELL_WIDTH = 140 // px per hour

export default function AgendaTimeline({
  date,
  orders,
  technicians,
  onUpdateOrder,
}: AgendaTimelineProps) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i)

  const dayOrders = useMemo(() => {
    return orders.filter((o) => o.scheduled_at && isSameDay(new Date(o.scheduled_at), date))
  }, [orders, date])

  const handleDrop = (e: React.DragEvent, techId: string, hour: number) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('text/plain')
    if (!orderId) return

    const newDate = new Date(date)
    newDate.setHours(hour, 0, 0, 0)

    onUpdateOrder(orderId, {
      technician_id: techId,
      scheduled_at: newDate.toISOString(),
      status: 'scheduled',
    })
  }

  const getStatusColor = (o: any) => {
    if (o.status === 'in_progress')
      return 'bg-blue-500 border-blue-600 text-white shadow-blue-500/20'
    if (o.status === 'completed')
      return 'bg-green-500 border-green-600 text-white shadow-green-500/20'
    if (o.priority === 'urgent') return 'bg-red-500 border-red-600 text-white shadow-red-500/20'
    if (o.priority === 'high')
      return 'bg-orange-500 border-orange-600 text-white shadow-orange-500/20'
    return 'bg-secondary border-border text-foreground shadow-black/5'
  }

  return (
    <ScrollArea className="flex-1 h-full bg-background relative" type="always">
      <div className="flex flex-col min-w-max">
        {/* Header Hours */}
        <div className="flex sticky top-0 z-20 bg-muted/90 backdrop-blur-sm border-b shadow-sm h-10 items-center">
          <div className="w-56 sticky left-0 z-30 bg-muted/90 backdrop-blur-sm border-r px-4 font-semibold text-sm flex items-center justify-between">
            <span>Equipe Técnica</span>
            <span className="text-xs text-muted-foreground font-normal capitalize">
              {format(date, 'dd MMM', { locale: ptBR })}
            </span>
          </div>
          {hours.map((h) => (
            <div
              key={h}
              className="border-r text-center text-xs font-medium text-muted-foreground shrink-0 flex items-center justify-center"
              style={{ width: CELL_WIDTH }}
            >
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Timeline Rows */}
        <div className="relative">
          {technicians.map((tech) => {
            const techOrders = dayOrders.filter((o) => o.technician_id === tech.id)
            return (
              <div
                key={tech.id}
                className="flex border-b relative group hover:bg-muted/5 transition-colors h-20"
              >
                {/* Fixed Tech Name Column */}
                <div className="w-56 sticky left-0 z-10 bg-background border-r p-3 shrink-0 flex flex-col justify-center group-hover:bg-muted/5 transition-colors">
                  <div className="text-sm font-semibold truncate" title={tech.users?.name}>
                    {tech.users?.name || 'Técnico sem nome'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {tech.specialty || 'Geral'}
                  </div>
                </div>

                {/* Drop Zones and Orders */}
                <div className="flex relative shrink-0">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="border-r h-full shrink-0 border-dashed border-border/50"
                      style={{ width: CELL_WIDTH }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, tech.id, h)}
                    />
                  ))}

                  {/* Render Orders */}
                  {techOrders.map((o) => {
                    const start = new Date(o.scheduled_at)
                    const startHour = start.getHours()
                    const startMin = start.getMinutes()

                    const effectiveHour = Math.max(START_HOUR, Math.min(startHour, END_HOUR))
                    const left = (effectiveHour - START_HOUR + startMin / 60) * CELL_WIDTH
                    const durMins = o.total_duration_minutes || 60
                    const width = Math.max(CELL_WIDTH * 0.5, (durMins / 60) * CELL_WIDTH)

                    return (
                      <OrderContextMenu
                        key={o.id}
                        order={o}
                        technicians={technicians}
                        onUpdateOrder={onUpdateOrder}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', o.id)
                          }}
                          className={cn(
                            'absolute top-2 bottom-2 rounded-md border shadow-sm p-2 text-xs overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.02] transition-all z-10 flex flex-col',
                            getStatusColor(o),
                          )}
                          style={{
                            left,
                            width: Math.min(
                              width,
                              (END_HOUR - START_HOUR + 1) * CELL_WIDTH - left - 4,
                            ),
                          }}
                          title={`${o.service_order_number} - ${o.clients?.name}`}
                        >
                          <div className="font-bold truncate">{o.service_order_number}</div>
                          <div className="truncate opacity-90">{o.clients?.name}</div>
                          <div className="mt-auto flex items-center gap-1 opacity-80 text-[10px]">
                            <Clock className="w-3 h-3" />
                            {format(start, 'HH:mm')}
                          </div>
                        </div>
                      </OrderContextMenu>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
