import { useEffect, useState } from 'react'
import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function InboundsPage() {
  const [inbounds, setInbounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*, materials(name)')
        .eq('type', 'in')
        .order('created_at', { ascending: false })

      if (!error && data) setInbounds(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Entradas</h2>
        <p className="text-sm text-muted-foreground">
          Recebimento de materiais e reposição de estoque.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Entradas</CardTitle>
          <CardDescription>Movimentações do tipo "in".</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
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
              ) : inbounds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma entrada registrada.
                  </TableCell>
                </TableRow>
              ) : (
                inbounds.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{t.materials?.name}</TableCell>
                    <TableCell>{t.destination_location || 'Central'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {t.reference_id || '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      +{t.quantity}
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
