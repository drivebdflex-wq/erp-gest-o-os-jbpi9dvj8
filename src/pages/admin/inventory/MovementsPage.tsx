import InventoryNav from '@/components/admin/inventory/InventoryNav'
import useInventoryStore from '@/stores/useInventoryStore'
import useFleetStore from '@/stores/useFleetStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function MovementsPage() {
  const { movements, products } = useInventoryStore()
  const { vehicles } = useFleetStore()

  const getLocationName = (locId?: string) => {
    if (!locId) return '-'
    if (locId === 'central') return 'Central'
    const v = vehicles.find((v) => v.id === locId)
    return v ? `${v.plate} (${v.model})` : locId
  }

  const sortedMovements = [...movements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Histórico de Movimentações</h2>
        <p className="text-sm text-muted-foreground">
          Log de auditoria de entradas, saídas, transferências e ajustes.
        </p>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Origem Estoque</TableHead>
              <TableHead>Destino Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMovements.map((m) => {
              const p = products.find((x) => x.id === m.product_id)
              return (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(m.date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.type === 'entrada'
                          ? 'default'
                          : m.type === 'saída'
                            ? 'destructive'
                            : m.type === 'transferência'
                              ? 'secondary'
                              : 'outline'
                      }
                    >
                      {m.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{m.origin}</TableCell>
                  <TableCell className="font-medium">{p?.name}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{m.quantity}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getLocationName(m.source_location)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getLocationName(m.destination_location)}
                  </TableCell>
                </TableRow>
              )
            })}
            {sortedMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhuma movimentação registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
