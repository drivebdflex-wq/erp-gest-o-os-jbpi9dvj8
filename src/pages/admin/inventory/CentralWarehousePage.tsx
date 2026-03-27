import InventoryNav from '@/components/admin/inventory/InventoryNav'
import useInventoryStore from '@/stores/useInventoryStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function CentralWarehousePage() {
  const { products, balances } = useInventoryStore()

  const centralBalances = balances.filter((b) => b.location_type === 'central')

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Almoxarifado Central</h2>
        <p className="text-sm text-muted-foreground">Posição de estoque no depósito principal.</p>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Unidade</TableHead>
              <TableHead className="text-right">Quantidade Atual</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const bal = centralBalances.find((b) => b.product_id === p.id)
              const qty = bal ? bal.quantity : 0
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.code}</TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-center">{p.unit}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{qty}</TableCell>
                  <TableCell className="text-center">
                    {qty === 0 ? (
                      <Badge variant="destructive">Zerado</Badge>
                    ) : qty < p.minimum_stock ? (
                      <Badge variant="secondary" className="bg-warning text-warning-foreground">
                        Baixo
                      </Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground">Ok</Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
