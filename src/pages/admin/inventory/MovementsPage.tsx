import { useEffect, useState } from 'react'
import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*, materials(name, sku)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) setMovements(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Movimentações</h2>
        <p className="text-sm text-muted-foreground">
          Histórico completo de entradas, saídas e transferências de estoque.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-10 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          mov.type === 'in'
                            ? 'default'
                            : mov.type === 'out'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {mov.type === 'in'
                          ? 'Entrada'
                          : mov.type === 'out'
                            ? 'Saída'
                            : 'Transferência'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{mov.materials?.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {mov.origin_location || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mov.destination_location || '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {mov.type === 'out' ? '-' : '+'}
                      {mov.quantity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
