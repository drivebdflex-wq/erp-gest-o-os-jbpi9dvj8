import useAppStore, { OSStatus, Order } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const columns: OSStatus[] = ['Aberta', 'Planejada', 'Em Execução', 'Em Auditoria', 'Finalizada']

interface OrderKanbanProps {
  onCardClick?: (order: Order) => void
}

export default function OrderKanban({ onCardClick }: OrderKanbanProps) {
  const { orders } = useAppStore()

  return (
    <div className="flex gap-4 h-[calc(100vh-250px)] overflow-x-auto pb-4">
      {columns.map((status) => {
        const columnOrders = orders.filter((o) => o.status === status)
        return (
          <div
            key={status}
            className="flex-shrink-0 w-80 bg-secondary/50 rounded-lg p-3 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-sm">{status}</h3>
              <Badge variant="secondary">{columnOrders.length}</Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
                    onClick={() => onCardClick?.(order)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold">{order.shortId}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-tight mb-2 line-clamp-2">
                        {order.title}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-3">
                        <span className="truncate max-w-[120px]">{order.client}</span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary/40" />
                          {order.tech.split(' ')[0]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}
