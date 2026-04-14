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
import useAppStore, { OSStatus, Order } from '@/stores/useAppStore'

const getStatusColor = (status: OSStatus) => {
  switch (status) {
    case 'Finalizada':
      return 'bg-success hover:bg-success/80 text-success-foreground'
    case 'Em Execução':
      return 'bg-primary hover:bg-primary/80 text-primary-foreground'
    case 'Pendente':
      return 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
    default:
      return 'bg-warning hover:bg-warning/80 text-warning-foreground'
  }
}

interface OrderTableProps {
  onRowClick?: (order: Order) => void
}

export default function OrderTable({ onRowClick }: OrderTableProps) {
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
            <TableRow
              key={order.id}
              className="group cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(order)}
            >
              <TableCell className="font-medium">{order.shortId}</TableCell>
              <TableCell className="max-w-[200px] truncate">{order.title}</TableCell>
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
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhuma ordem de serviço encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
