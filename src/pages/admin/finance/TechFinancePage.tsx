import FinanceNav from '@/components/admin/finance/FinanceNav'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo } from 'react'

export default function TechFinancePage() {
  const { orders } = useAppStore()

  const techStats = useMemo(() => {
    const techs = Array.from(new Set(orders.map((o) => o.tech)))
    return techs
      .map((tech) => {
        const techOrders = orders.filter((o) => o.tech === tech && o.status === 'Finalizada')
        const totalOS = techOrders.length
        const totalTime = techOrders.reduce((sum, o) => sum + (o.totalDuration || 0), 0)
        const avgTime = totalOS > 0 ? Math.round(totalTime / totalOS) : 0

        const monthlyCost = 5000 // Mocked fixed cost for the technician
        const avgCost = totalOS > 0 ? monthlyCost / totalOS : 0

        return { tech, totalOS, avgTime, monthlyCost, avgCost }
      })
      .sort((a, b) => b.avgCost - a.avgCost)
  }, [orders])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FinanceNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Eficiência e Custo Técnico</h2>
        <p className="text-sm text-muted-foreground">
          Análise de rentabilidade e desempenho da equipe de campo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas por Técnico (Período Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Técnico</TableHead>
                <TableHead className="text-right">OS Executadas</TableHead>
                <TableHead className="text-right">Tempo Médio / OS</TableHead>
                <TableHead className="text-right">Custo Mensal Fixo</TableHead>
                <TableHead className="text-right">Custo Médio / OS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techStats.map((t) => (
                <TableRow key={t.tech}>
                  <TableCell className="font-semibold">{t.tech}</TableCell>
                  <TableCell className="text-right font-medium">{t.totalOS}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {t.avgTime} min
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    R$ {t.monthlyCost.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono font-bold ${t.avgCost > 500 ? 'text-destructive' : 'text-success'}`}
                  >
                    R$ {t.avgCost.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-xs text-muted-foreground">
            * O Custo Médio por OS é estimado dividindo o custo fixo mensal do técnico pelo volume
            de ordens finalizadas no período. Valores altos indicam ociosidade.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
