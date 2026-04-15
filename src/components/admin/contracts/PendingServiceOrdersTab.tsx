import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PendingServiceOrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/service-orders?status=pending`)

      if (!response.ok) {
        throw new Error(`Falha ao buscar ordens de serviço pendentes (${response.status})`)
      }

      const data = await response.json()
      setOrders(Array.isArray(data) ? data.filter((o: any) => !o.deleted_at && !o.deletedAt) : [])
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao conectar com a API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    const handleOrderCreated = () => {
      fetchOrders()
    }
    const handleOrderUpdated = () => {
      fetchOrders()
    }

    window.addEventListener('service-order-created', handleOrderCreated)
    window.addEventListener('service-order-updated', handleOrderUpdated)
    return () => {
      window.removeEventListener('service-order-created', handleOrderCreated)
      window.removeEventListener('service-order-updated', handleOrderUpdated)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 bg-card border rounded-md p-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Sincronização</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="ml-4 border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-card border rounded-md text-muted-foreground">
        Nenhuma ordem de serviço pendente encontrada.
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20 py-3">
        <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
        <div>
          <AlertTitle className="text-sm font-semibold mb-1">Aviso de Volatilidade</AlertTitle>
          <AlertDescription className="text-xs">
            Nenhum banco de dados conectado. Os dados persistem apenas em memória e serão perdidos
            ao reiniciar o servidor.
          </AlertDescription>
        </div>
      </Alert>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID da OS</TableHead>
              <TableHead>Cliente ID</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-xs">
                  {order.id.split('-')[0].toUpperCase()}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="font-medium truncate max-w-[150px]" title={order.client_id}>
                    {order.client_id}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-sm" title={order.description}>
                  {order.description}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.created_at
                    ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
                    Pendente
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
