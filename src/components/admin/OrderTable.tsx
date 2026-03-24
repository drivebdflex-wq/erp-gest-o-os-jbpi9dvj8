import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import useAppStore, { OrderStatus } from '@/stores/useAppStore'

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'Finalizada':
      return 'bg-success hover:bg-success/80 text-success-foreground'
    case 'Em Execução':
      return 'bg-primary hover:bg-primary/80 text-primary-foreground'
    case 'Aberta':
      return 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
    case 'Reprovada':
      return 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
    default:
      return 'bg-warning hover:bg-warning/80 text-warning-foreground'
  }
}

export default function OrderTable() {
  const { orders } = useAppStore()

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Técnico</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="group">
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.title}</TableCell>
              <TableCell>{order.client}</TableCell>
              <TableCell>{order.tech}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={order.priority === 'Alta' ? 'border-destructive text-destructive' : ''}
                >
                  {order.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
