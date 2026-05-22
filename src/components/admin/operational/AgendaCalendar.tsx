import { useMemo } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { OrderContextMenu } from './OrderContextMenu'

interface AgendaCalendarProps {
  date: Date
  viewMode: 'week' | 'month'
  orders: any[]
}

export default function AgendaCalendar({ date, viewMode, orders }: AgendaCalendarProps) {
  const days = useMemo(() => {
    const d = []
    if (viewMode === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 1 })
      for (let i = 0; i < 7; i++) d.push(addDays(start, i))
    } else {
      const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
      const end = endOfMonth(date)
      let curr = start
      while (curr <= end || d.length % 7 !== 0) {
        d.push(curr)
        curr = addDays(curr, 1)
      }
    }
    return d
  }, [date, viewMode])

  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-fade-in">
      <div className="grid grid-cols-7 border-b shrink-0">
        {weekdays.map((w) => (
          <div key={w} className="p-2 text-center text-sm font-semibold bg-muted/30 border-r">
            {w}
          </div>
        ))}
      </div>
      <div
        className={cn(
          'grid grid-cols-7 flex-1 overflow-y-auto',
          viewMode === 'month' ? `grid-rows-${Math.ceil(days.length / 7)}` : 'grid-rows-1',
        )}
      >
        {days.map((d) => {
          const dayOrders = orders.filter(
            (o) => o.scheduled_at && isSameDay(new Date(o.scheduled_at), d),
          )
          const isCurrentMonth = isSameMonth(d, date)

          return (
            <div
              key={d.toISOString()}
              className={cn(
                'border-r border-b p-2 flex flex-col min-h-[120px] transition-colors hover:bg-muted/5',
                !isCurrentMonth && 'bg-muted/5 opacity-50',
              )}
            >
              <div
                className={cn(
                  'text-sm font-medium mb-2',
                  isSameDay(d, new Date())
                    ? 'text-primary bg-primary/10 w-7 h-7 flex items-center justify-center rounded-full'
                    : '',
                )}
              >
                {format(d, 'd')}
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {dayOrders.slice(0, viewMode === 'month' ? 3 : 10).map((o) => (
                  <OrderContextMenu key={o.id} order={o}>
                    <div className="text-[10px] truncate px-1.5 py-1 rounded bg-secondary border shadow-sm text-secondary-foreground hover:bg-secondary/80 cursor-pointer">
                      <span className="font-bold mr-1">
                        {format(new Date(o.scheduled_at), 'HH:mm')}
                      </span>
                      {o.service_order_number}
                    </div>
                  </OrderContextMenu>
                ))}
                {dayOrders.length > (viewMode === 'month' ? 3 : 10) && (
                  <div className="text-[10px] text-primary font-semibold pl-1 mt-1">
                    + {dayOrders.length - (viewMode === 'month' ? 3 : 10)} ordens
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
