import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  MoreHorizontal,
  Edit,
  UserPlus,
  FileText,
  ClipboardList,
} from 'lucide-react'
import useAppStore, {
  OSStatus,
  Order,
  SERVICE_TYPE_COLORS,
  SERVICE_TYPE_LABELS,
} from '@/stores/useAppStore'
import AssignOrderDialog from '@/components/admin/contracts/AssignOrderDialog'
import EditOrderDialog from '@/components/admin/contracts/EditOrderDialog'
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
  isDeletedView?: boolean
  onRestore?: (order: Order) => void
  onRefresh?: () => void
}

import { useToast } from '@/hooks/use-toast'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'

export default function OrderTable({
  orders: propOrders,
  onRowClick,
  isDeletedView,
  onRestore,
  onRefresh,
}: OrderTableProps) {
  const { toast } = useToast()
  const { filteredOrders } = useAppStore()
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const baseOrders = propOrders || filteredOrders
  const displayOrders = isDeletedView
    ? baseOrders.filter((o: any) => o.deletedAt || o.deleted_at)
    : baseOrders.filter((o: any) => !o.deletedAt && !o.deleted_at)

  const [page, setPage] = useState(1)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null)
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (order: Order) => {
    setIsDeleting(true)
    try {
      if (order.status === 'Em Execução' || order.status === 'Em Auditoria') {
        throw new Error('Não é possível excluir uma OS em execução ou auditoria.')
      }

      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/service-orders/${order.id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Error deleting record. Please try again.')
      }

      useAppStore.setState((state: any) => {
        const orderToDel = state.orders.find((o: any) => o.id === order.id) || order
        const now = new Date().toISOString()
        return {
          orders: state.orders.map((o: any) =>
            o.id === order.id ? { ...o, deletedAt: now, deleted_at: now } : o,
          ),
          filteredOrders: state.filteredOrders.map((o: any) =>
            o.id === order.id ? { ...o, deletedAt: now, deleted_at: now } : o,
          ),
          deletedOrders: state.deletedOrders
            ? [...state.deletedOrders, { ...orderToDel, deletedAt: now, deleted_at: now }]
            : [{ ...orderToDel, deletedAt: now, deleted_at: now }],
        }
      })
      toast({ title: 'Sucesso', description: 'OS excluída com sucesso.' })
      onRefresh?.()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao excluir OS.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setOrderToDelete(null)
    }
  }
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
              <TableHead>{isDeletedView ? 'Data de Exclusão' : 'Data / Prazo'}</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick?.(order)}
              >
                <TableCell className="font-medium">
                  {(order as any).order_number || order.shortId}
                </TableCell>
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
                  {isDeletedView && (order as any).deletedAt
                    ? new Date((order as any).deletedAt).toLocaleDateString()
                    : new Date(order.date).toLocaleDateString()}
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
                      order.priority === 'Emergencial (48h)' ||
                      order.priority === 'Urgente (4 dias)' ||
                      order.priority === 'Alta' ||
                      order.priority === 'urgent'
                        ? 'border-destructive text-destructive'
                        : ''
                    }
                  >
                    {order.priority}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isDeletedView ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRestore?.(order)
                          }}
                          title="Restaurar OS"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setOrderToAssign(order)
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Atribuir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setOrderToEdit(order)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                toast({
                                  title: 'OS Duplicada',
                                  description:
                                    'Nova ordem em rascunho com base nesta OS será implementada em breve.',
                                })
                              }}
                            >
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Duplicar OS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                window.print()
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Imprimir / PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOrderToDelete(order)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {displayOrders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 9 : 8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {isDeletedView
                    ? 'Nenhuma ordem de serviço na lixeira.'
                    : 'Nenhuma ordem de serviço encontrada para os filtros aplicados.'}
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

      {orderToAssign && (
        <AssignOrderDialog
          open={!!orderToAssign}
          onOpenChange={(open) => !open && setOrderToAssign(null)}
          order={orderToAssign}
          onSuccess={() => {
            setOrderToAssign(null)
            onRefresh?.()
          }}
        />
      )}

      {orderToEdit && (
        <EditOrderDialog
          open={!!orderToEdit}
          onOpenChange={(open) => !open && setOrderToEdit(null)}
          order={orderToEdit}
          onSuccess={() => {
            setOrderToEdit(null)
            onRefresh?.()
          }}
        />
      )}

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a OS <strong>{orderToDelete?.shortId}</strong>? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (orderToDelete) handleDelete(orderToDelete)
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
