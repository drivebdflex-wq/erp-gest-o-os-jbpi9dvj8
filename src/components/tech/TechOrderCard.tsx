import { Order } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function TechOrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()

  const isExecuting = order.status === 'Em Execução'

  return (
    <Card
      className={cn(
        'overflow-hidden active:scale-[0.98] transition-transform cursor-pointer',
        isExecuting ? 'border-primary shadow-md' : '',
      )}
      onClick={() => navigate(`/tech/execucao/${order.id}`)}
    >
      <div
        className={cn(
          'h-1 w-full',
          isExecuting ? 'bg-primary' : order.priority === 'Alta' ? 'bg-destructive' : 'bg-muted',
        )}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {order.id}
          </Badge>
          {isExecuting && <Badge className="bg-primary animate-pulse">Ativa</Badge>}
        </div>
        <h3 className="font-semibold text-base leading-snug mb-3">{order.title}</h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2 leading-tight">{order.address}</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {order.distance} est.
            </div>
            <div className="flex items-center text-primary font-semibold text-xs uppercase">
              {isExecuting ? 'Continuar' : 'Iniciar'} <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
