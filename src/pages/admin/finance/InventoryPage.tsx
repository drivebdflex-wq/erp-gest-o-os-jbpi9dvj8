import FinanceNav from '@/components/admin/finance/FinanceNav'
import useFinanceStore from '@/stores/useFinanceStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InventoryPage() {
  const { inventory, purchases } = useFinanceStore()

  const analysisData = inventory.map((item) => {
    const purchasedQty = purchases
      .filter((p) => p.type === 'material' && p.materialName === item.materialName)
      .reduce((sum, p) => sum + (p.quantity || 0), 0)
    const utilizedQty = purchasedQty - item.quantity
    const lossQty = utilizedQty > 0 ? Math.ceil(utilizedQty * 0.05) : 0 // mock 5% loss/deviation
    return {
      ...item,
      purchasedQty,
      utilizedQty,
      lossQty,
      lossValue: lossQty * item.unitCost,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <FinanceNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estoque & Análise</h2>
        <p className="text-sm text-muted-foreground">
          Posição de materiais, desvios e custos unitários atualizados automaticamente.
        </p>
      </div>

      <Tabs defaultValue="position">
        <TabsList>
          <TabsTrigger value="position">Posição Atual</TabsTrigger>
          <TabsTrigger value="analysis">Análise Avançada de Consumo</TabsTrigger>
        </TabsList>
        <TabsContent value="position" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qtd Disponível</TableHead>
                  <TableHead className="text-right">Custo Unitário</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.materialName}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {item.quantity}
                    </TableCell>
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
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Total Comprado</TableHead>
                  <TableHead className="text-right">Total Utilizado (OS)</TableHead>
                  <TableHead className="text-right">Desvios/Perdas (Est.)</TableHead>
                  <TableHead className="text-right">Custo da Perda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.materialName}</TableCell>
                    <TableCell className="text-right font-mono">{item.purchasedQty}</TableCell>
                    <TableCell className="text-right font-mono text-primary">
                      {item.utilizedQty}
                    </TableCell>
                    <TableCell className="text-right font-mono text-warning font-semibold">
                      {item.lossQty}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      R$ {item.lossValue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
