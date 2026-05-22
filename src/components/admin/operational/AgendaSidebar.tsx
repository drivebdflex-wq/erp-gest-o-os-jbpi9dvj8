import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle, PlayCircle, CalendarClock, HelpCircle } from 'lucide-react'
import { OrderContextMenu } from './OrderContextMenu'

interface AgendaSidebarProps {
  orders: any[]
}

export default function AgendaSidebar({ orders }: AgendaSidebarProps) {
  const now = new Date()

  // Deduplicate and filter
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values())

  const unassigned = uniqueOrders.filter(
    (o) => !o.technician_id && o.status !== 'completed' && o.status !== 'cancelled',
  )
  const late = uniqueOrders.filter(
    (o) =>
      o.status !== 'completed' &&
      o.status !== 'cancelled' &&
      o.deadline_at &&
      new Date(o.deadline_at) < now,
  )
  const urgent = uniqueOrders.filter(
    (o) => o.priority === 'urgent' && o.status !== 'completed' && o.status !== 'cancelled',
  )
  const inProgress = uniqueOrders.filter((o) => o.status === 'in_progress')
  const waiting = uniqueOrders.filter(
    (o) => (o.status === 'pending' || o.status === 'scheduled') && o.technician_id,
  )

  const Section = ({ title, items, icon: Icon, colorClass }: any) => {
    if (items.length === 0) return null
    return (
      <div className="mb-6 animate-fade-in">
        <div className={cn('flex items-center gap-2 mb-3 text-sm font-semibold', colorClass)}>
          <Icon className="w-4 h-4" />
          {title} ({items.length})
        </div>
        <div className="space-y-2">
          {items.map((o: any) => (
            <OrderContextMenu key={o.id} order={o}>
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', o.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="p-3 border rounded-md bg-background shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded text-primary">
                    {o.service_order_number}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full uppercase',
                      o.priority === 'urgent'
                        ? 'bg-red-500/10 text-red-600'
                        : o.priority === 'high'
                          ? 'bg-orange-500/10 text-orange-600'
                          : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {o.priority}
                  </span>
                </div>
                <div className="text-xs font-medium truncate mb-0.5" title={o.clients?.name}>
                  {o.clients?.name || 'Sem cliente'}
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                  {o.description || 'Sem descrição'}
                </div>
              </div>
            </OrderContextMenu>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="w-80 border-r bg-muted/5 flex-shrink-0 h-full p-4 custom-scrollbar">
      <Section
        title="Não Atribuídas"
        items={unassigned}
        icon={HelpCircle}
        colorClass="text-muted-foreground"
      />
      <Section title="Urgentes" items={urgent} icon={AlertTriangle} colorClass="text-red-500" />
      <Section title="Atrasadas" items={late} icon={Clock} colorClass="text-orange-500" />
      <Section
        title="Em Execução"
        items={inProgress}
        icon={PlayCircle}
        colorClass="text-blue-500"
      />
      <Section
        title="Aguardando"
        items={waiting}
        icon={CalendarClock}
        colorClass="text-foreground"
      />

      {unassigned.length === 0 &&
        urgent.length === 0 &&
        late.length === 0 &&
        inProgress.length === 0 &&
        waiting.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-10">
            Nenhuma ordem na fila.
          </div>
        )}
    </ScrollArea>
  )
}
