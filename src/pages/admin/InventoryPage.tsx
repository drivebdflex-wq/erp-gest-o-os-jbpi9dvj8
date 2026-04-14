import useFinanceStore from '@/stores/useFinanceStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function InventoryPage() {
  const { inventory } = useFinanceStore()

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estoque Financeiro</h2>
        <p className="text-sm text-muted-foreground">
          Posição de materiais, volumes e custos unitários atualizados automaticamente.
        </p>
      </div>
      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead className="text-right">Quantidade Disponível</TableHead>
              <TableHead className="text-right">Custo Unitário Médio</TableHead>
              <TableHead className="text-right">Custo Total Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.materialName}</TableCell>
                <TableCell className="text-right font-mono font-medium">{item.quantity}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  R$ {item.unitCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  R$ {item.totalCost.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum material no estoque.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
