import useAppStore from '@/stores/useAppStore'
import TechOrderCard from '@/components/tech/TechOrderCard'
import { WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TechQueue() {
  const { orders } = useAppStore()

  const myOrders = orders.filter(
    (o) => o.tech === 'Carlos Silva' && (o.status === 'Pendente' || o.status === 'Em Execução'),
  )

  const sortedOrders = [...myOrders].sort((a, b) => {
    if (a.status === 'Em Execução') return -1
    if (b.status === 'Em Execução') return 1
    if (a.priority === 'Alta' && b.priority !== 'Alta') return -1
    if (b.priority === 'Alta' && a.priority !== 'Alta') return 1
    return 0
  })

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-card p-3 rounded-xl shadow-sm border border-border/50">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">Fila de Trabalho</h2>
          <p className="text-xl font-bold">{sortedOrders.length} Pendentes</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Online
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Sincronizado há 2m
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          Próximas Tarefas
          <div className="h-px flex-1 bg-border" />
        </h3>

        {sortedOrders.map((order) => (
          <TechOrderCard key={order.id} order={order} />
        ))}

        {sortedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="bg-secondary p-4 rounded-full mb-3">
              <WifiOff className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">Nenhuma OS atribuída</p>
            <p className="text-xs text-center px-8 mt-1">
              Aproveite para revisar seu estoque ou aguarde novos despachos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
