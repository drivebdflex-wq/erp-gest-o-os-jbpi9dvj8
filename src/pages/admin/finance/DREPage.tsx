import FinanceNav from '@/components/admin/finance/FinanceNav'
import useFinanceStore from '@/stores/useFinanceStore'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function DREPage() {
  const { revenues, costs } = useFinanceStore()
  const [period, setPeriod] = useState('all')

  const { revenue, opCosts, adminExpenses, grossProfit, netProfit } = useMemo(() => {
    let fRevenues = revenues.filter((r) => r.status === 'recebido')
    let fCosts = costs.filter((c) => new Date(c.date) <= new Date())

    if (period !== 'all') {
      fRevenues = fRevenues.filter((r) => r.date.startsWith(period))
      fCosts = fCosts.filter((c) => c.date.startsWith(period))
    }

    const rev = fRevenues.reduce((sum, r) => sum + r.value, 0)
    const op = fCosts
      .filter((c) => c.category !== 'administrativo')
      .reduce((sum, c) => sum + c.value, 0)
    const admin = fCosts
      .filter((c) => c.category === 'administrativo')
      .reduce((sum, c) => sum + c.value, 0)

    return {
      revenue: rev,
      opCosts: op,
      adminExpenses: admin,
      grossProfit: rev - op,
      netProfit: rev - op - admin,
    }
  }, [revenues, costs, period])

  const availableMonths = Array.from(
    new Set([
      ...revenues.map((r) => r.date.substring(0, 7)),
      ...costs.map((c) => c.date.substring(0, 7)),
    ]),
  )
    .sort()
    .reverse()

  return (
    <div className="space-y-6 animate-fade-in">
      <FinanceNav />
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DRE Consolidado</h2>
          <p className="text-sm text-muted-foreground">Demonstrativo de Resultados do Exercício.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o Histórico</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="max-w-3xl">
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell className="font-bold text-lg py-4">
                  1. Receita Operacional Bruta
                </TableCell>
                <TableCell className="text-right font-bold text-lg py-4 text-success">
                  R$ {revenue.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">
                  (-) Custos Operacionais (Materiais, Serviços, Equipe)
                </TableCell>
                <TableCell className="text-right text-destructive">
                  R$ {opCosts.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableCell className="font-bold text-lg py-4 pl-4">
                  2. Lucro Bruto Operacional
                </TableCell>
                <TableCell
                  className={`text-right font-bold text-lg py-4 ${grossProfit >= 0 ? 'text-primary' : 'text-destructive'}`}
                >
                  R$ {grossProfit.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">
                  (-) Despesas Administrativas (Software, Taxas)
                </TableCell>
                <TableCell className="text-right text-destructive">
                  R$ {adminExpenses.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-primary/10 hover:bg-primary/10 border-t-2 border-primary/20">
                <TableCell className="font-bold text-xl py-6 pl-4">3. Lucro Líquido</TableCell>
                <TableCell
                  className={`text-right font-bold text-xl py-6 ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  R$ {netProfit.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
