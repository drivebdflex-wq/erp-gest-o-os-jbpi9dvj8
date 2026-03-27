import { useState, useEffect } from 'react'
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
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import useAppStore, {
  OSStatus,
  Order,
  SERVICE_TYPE_COLORS,
  SERVICE_TYPE_LABELS,
} from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

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
  orders?: Order[]
  onRowClick?: (order: Order) => void
}

export default function OrderTable({ orders: propOrders, onRowClick }: OrderTableProps) {
  const { filteredOrders } = useAppStore()
  const displayOrders = propOrders || filteredOrders

  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(displayOrders.length / itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [displayOrders])

  const paginatedOrders = displayOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Contrato / Agência</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data / Prazo</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick?.(order)}
              >
                <TableCell className="font-medium">{order.shortId}</TableCell>
                <TableCell className="max-w-[200px] truncate">{order.title}</TableCell>
                <TableCell>
                  <div className="font-medium text-xs text-primary">
                    {order.contractName || 'Sem Contrato'}
                  </div>
                  <div className="text-muted-foreground text-[10px] truncate max-w-[150px]">
                    {order.client}
                  </div>
                  <div className="text-muted-foreground text-[10px] font-mono mt-0.5">
                    {order.unit}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'border bg-background shadow-sm',
                      SERVICE_TYPE_COLORS[order.serviceType],
                    )}
                  >
                    {SERVICE_TYPE_LABELS[order.serviceType]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(order.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.tech}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)} variant="secondary">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      order.priority === 'Alta' ? 'border-destructive text-destructive' : ''
                    }
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
            {displayOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma ordem de serviço encontrada para os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <div className="text-sm text-muted-foreground mr-4">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
