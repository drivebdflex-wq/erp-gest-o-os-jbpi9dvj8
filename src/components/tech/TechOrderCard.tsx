import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import { Order } from '@/stores/useAppStore'

export default function TechOrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/tech/execucao/${order.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer bg-card shadow-sm border border-border/50">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-sm">
              {(order as any).order_number || order.shortId}
            </span>
            <Badge variant={order.status === 'Em Execução' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
          <p className="font-medium text-sm mb-3 text-foreground line-clamp-2">{order.title}</p>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary/70" /> {order.address}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary/70" /> {order.date}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
