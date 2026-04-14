import InventoryNav from '@/components/admin/inventory/InventoryNav'
import useInventoryStore from '@/stores/useInventoryStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, XCircle, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function InventoryDashboard() {
  const { products, balances, movements } = useInventoryStore()

  const totalValue = balances.reduce((sum, b) => {
    const p = products.find((x) => x.id === b.product_id)
    return sum + (p?.average_cost || 0) * b.quantity
  }, 0)

  const productsBelowMin = products.filter((p) => {
    const total = balances
      .filter((b) => b.product_id === p.id)
      .reduce((sum, b) => sum + b.quantity, 0)
    return total > 0 && total < p.minimum_stock
  })

  const zeroStock = products.filter((p) => {
    const total = balances
      .filter((b) => b.product_id === p.id)
      .reduce((sum, b) => sum + b.quantity, 0)
    return total === 0
  })

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard de Estoque</h2>
        <p className="text-sm text-muted-foreground">
          Monitoramento consolidado de materiais e movimentações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{productsBelowMin.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fora de Estoque (Zero)</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{zeroStock.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.slice(0, 5).map((m) => {
                  const p = products.find((x) => x.id === m.product_id)
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{p?.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            m.type === 'entrada'
                              ? 'default'
                              : m.type === 'saída'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Críticos (Zerados ou Baixos)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Estoque Min.</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...zeroStock, ...productsBelowMin].slice(0, 5).map((p) => {
                  const total = balances
                    .filter((b) => b.product_id === p.id)
                    .reduce((sum, b) => sum + b.quantity, 0)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{p.minimum_stock}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        {total}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {zeroStock.length === 0 && productsBelowMin.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Nenhum produto crítico.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
