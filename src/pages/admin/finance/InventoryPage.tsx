import FinanceNav from '@/components/admin/finance/FinanceNav'
import useInventoryStore from '@/stores/useInventoryStore'
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
  const { products, balances } = useInventoryStore()
  const { purchases } = useFinanceStore()

  const analysisData = products.map((item) => {
    const totalQty = balances
      .filter((b) => b.product_id === item.id)
      .reduce((sum, b) => sum + b.quantity, 0)
    const purchasedQty = purchases
      .filter((p) => p.type === 'material' && p.productId === item.id)
      .reduce((sum, p) => sum + (p.quantity || 0), 0)

    const utilizedQty = purchasedQty - totalQty
    const lossQty = utilizedQty > 0 ? Math.ceil(utilizedQty * 0.05) : 0 // mock 5% loss/deviation
    return {
      ...item,
      totalQty,
      purchasedQty,
      utilizedQty,
      lossQty,
      lossValue: lossQty * item.average_cost,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <FinanceNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estoque & Análise (Visão Financeira)</h2>
        <p className="text-sm text-muted-foreground">
          Custos, desvios e valores totais mantidos em estoque.
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
                  <TableHead className="text-right">Qtd Disponível (Global)</TableHead>
                  <TableHead className="text-right">Custo Unitário (Médio)</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {item.totalQty}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      R$ {item.average_cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {(item.totalQty * item.average_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {analysisData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum material cadastrado.
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
                    <TableCell className="font-semibold">{item.name}</TableCell>
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
