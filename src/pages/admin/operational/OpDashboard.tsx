import { useMemo } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
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
import { Badge } from '@/components/ui/badge'
import { Users, ShieldAlert, Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react'

export default function OpDashboard() {
  const { technicians, teams, events } = useOperationalStore()
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
      return { ...t, total, late, slaPercent, avgTime, productivity }
    })
  }, [technicians, orders])

  const topPerformers = [...techStats].sort((a, b) => b.productivity - a.productivity).slice(0, 3)
  const bottomPerformers = [...techStats]
    .sort((a, b) => a.productivity - b.productivity)
    .slice(0, 3)

  const alerts = useMemo(() => {
    const result = []
    techStats.forEach((t) => {
      if (t.slaPercent < 80) {
        result.push({
          title: 'SLA Crítico',
          message: `${t.name} está com SLA de ${t.slaPercent.toFixed(1)}%.`,
        })
      }
      if (t.productivity < 40 && t.total > 0) {
        result.push({
          title: 'Baixa Produtividade',
          message: `${t.name} registrou apenas ${t.productivity}% de produtividade.`,
        })
      }
    })
    events
      .filter((e) => e.type === 'falta' || e.type === 'suspensão')
      .forEach((e) => {
        const tech = technicians.find((t) => t.id === e.technician_id)
        if (tech)
          result.push({ title: 'Evento Grave', message: `${tech.name} registrou: ${e.type}.` })
      })
    return result
  }, [techStats, events, technicians])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Operacional (Técnicos)</h2>
        <p className="text-sm text-muted-foreground">
          Monitoramento de produtividade e desenvolvimento da equipe.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Técnicos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {technicians.filter((t) => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipes Operacionais</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SLA Médio Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {(
                techStats.reduce((acc, t) => acc + t.slaPercent, 0) / (techStats.length || 1)
              ).toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Melhores Desempenhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-right">Produtividade</TableHead>
                    <TableHead className="text-right">SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold">{t.name}</TableCell>
                      <TableCell className="text-right text-success font-bold">
                        {t.productivity}%
                      </TableCell>
                      <TableCell className="text-right">{t.slaPercent.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" /> Pontos de Atenção (Menor
                Desempenho)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-right">Produtividade</TableHead>
                    <TableHead className="text-right">SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bottomPerformers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold">{t.name}</TableCell>
                      <TableCell className="text-right text-warning font-bold">
                        {t.productivity}%
                      </TableCell>
                      <TableCell className="text-right">{t.slaPercent.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Central de Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum alerta crítico no momento.
              </p>
            ) : (
              alerts.map((a, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-md bg-destructive/10 border-destructive/20"
                >
                  <div className="font-semibold text-destructive text-sm">{a.title}</div>
                  <div className="text-xs mt-1 text-foreground/80">{a.message}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
