import { useMemo } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
import useAppStore from '@/stores/useAppStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function IndicatorsPage() {
  const { technicians } = useOperationalStore()
  const { orders } = useAppStore()

  const techStats = useMemo(() => {
    return technicians.map((t) => {
      const tOrders = orders.filter((o) => o.tech === t.name)
      const total = tOrders.length
      const late = tOrders.filter((o) => o.slaStatus === 'breached').length
      const withinSla = tOrders.filter((o) => o.slaStatus === 'within_sla').length
      const slaPercent = total > 0 ? (withinSla / total) * 100 : 100
      const avgTime =
        total > 0 ? tOrders.reduce((acc, o) => acc + (o.totalDuration || 0), 0) / total : 0
      const productivity = total > 0 ? Math.min(100, 50 + total * 2) : 0
      const rework = total > 0 ? Math.min(100, Math.floor(Math.random() * 10)) : 0
      return { ...t, total, late, slaPercent, avgTime, productivity, rework }
    })
  }, [technicians, orders])

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Indicadores de Performance</h2>
        <p className="text-sm text-muted-foreground">
          Resultados calculados automaticamente com base nas Ordens de Serviço.
        </p>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Técnico</TableHead>
              <TableHead className="text-right">Total de OS</TableHead>
              <TableHead className="text-right">OS Atrasadas</TableHead>
              <TableHead className="text-right">Tempo Médio</TableHead>
              <TableHead className="text-right">SLA (%)</TableHead>
              <TableHead className="text-right">Produtividade</TableHead>
              <TableHead className="text-right">Retrabalho</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {techStats.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold">{t.name}</TableCell>
                <TableCell className="text-right">{t.total}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={t.late > 0 ? 'destructive' : 'secondary'} className="font-mono">
                    {t.late}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{Math.round(t.avgTime)} min</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      t.slaPercent >= 90
                        ? 'text-success font-bold'
                        : t.slaPercent >= 75
                          ? 'text-warning font-bold'
                          : 'text-destructive font-bold'
                    }
                  >
                    {t.slaPercent.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {t.productivity}%
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      t.rework > 5 ? 'text-destructive font-bold' : 'text-muted-foreground'
                    }
                  >
                    {t.rework}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground">
        * As métricas de Produtividade e Retrabalho estão utilizando cálculo simulado na versão
        atual.
      </div>
    </div>
  )
}
