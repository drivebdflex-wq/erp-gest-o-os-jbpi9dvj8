import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PendingServiceOrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOS() {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          service_order_number,
          description,
          status,
          priority,
          units(prefix, name)
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }
    fetchOS()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número da O.S.</TableHead>
            <TableHead>Prefixo</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-bold font-mono">
                <Link to={`/ordens/${o.id}`} className="text-primary hover:underline">
                  {o.service_order_number || 'Sem Número'}
                </Link>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {o.units?.prefix || '-'}
              </TableCell>
              <TableCell className="font-medium text-sm">
                {o.units?.name || 'Não informada'}
              </TableCell>
              <TableCell className="max-w-[300px] truncate" title={o.description}>
                {o.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{o.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    o.priority === 'high' || o.priority === 'urgent' ? 'destructive' : 'secondary'
                  }
                >
                  {o.priority}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma O.S. encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
