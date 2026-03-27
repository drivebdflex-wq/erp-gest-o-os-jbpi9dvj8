import FinanceNav from '@/components/admin/finance/FinanceNav'
import useFinanceStore from '@/stores/useFinanceStore'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  Activity,
  OctagonAlert,
} from 'lucide-react'

export default function FinanceDashboard() {
  const { contracts, orders } = useAppStore()
  const { revenues, costs } = useFinanceStore()

  const data = contracts
    .map((contract) => {
      const totalRev = revenues
        .filter((r) => r.contractId === contract.id && r.status === 'recebido')
        .reduce((sum, r) => sum + r.value, 0)
      const totalCost = costs
        .filter((c) => c.contractId === contract.id && new Date(c.date) <= new Date())
        .reduce((sum, c) => sum + c.value, 0)
      const profit = totalRev - totalCost
      const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0

      // Budget check
      const contractCosts = costs.filter((c) => c.contractId === contract.id)
      const laborCost = contractCosts
        .filter((c) => c.category === 'mão de obra')
        .reduce((s, c) => s + c.value, 0)
      const matCost = contractCosts
        .filter((c) => c.category === 'material_os')
        .reduce((s, c) => s + c.value, 0)

      const isLaborOverBudget = contract.budgetLabor && laborCost > contract.budgetLabor
      const isMatOverBudget = contract.budgetMaterial && matCost > contract.budgetMaterial

      return {
        ...contract,
        totalRev,
        totalCost,
        profit,
        margin,
        isLaborOverBudget,
        isMatOverBudget,
      }
    })
    .sort((a, b) => b.profit - a.profit)

  const globalRev = data.reduce((sum, d) => sum + d.totalRev, 0)
  const globalCost = data.reduce((sum, d) => sum + d.totalCost, 0)
  const globalProfit = globalRev - globalCost
  const globalMargin = globalRev > 0 ? (globalProfit / globalRev) * 100 : 0

  const alerts: any[] = []
  data.forEach((d) => {
    if (d.profit < 0) {
      alerts.push({
        id: `loss-${d.id}`,
        type: 'critical',
        title: 'Trava de Prejuízo Ativada',
        message: `${d.name} está com saldo negativo de R$ ${Math.abs(d.profit).toFixed(2)}. Compras bloqueadas.`,
      })
    } else if (d.margin > 0 && d.margin < 10) {
      alerts.push({
        id: `margin-${d.id}`,
        type: 'warning',
        title: 'Margem Baixa (<10%)',
        message: `${d.name} tem margem de apenas ${d.margin.toFixed(1)}%.`,
      })
    }

    if (d.isLaborOverBudget || d.isMatOverBudget) {
      alerts.push({
        id: `budget-${d.id}`,
        type: 'destructive',
        title: 'Estouro de Orçamento',
        message: `${d.name} excedeu o teto de ${d.isLaborOverBudget ? 'Mão de Obra' : ''} ${d.isLaborOverBudget && d.isMatOverBudget ? 'e' : ''} ${d.isMatOverBudget ? 'Materiais' : ''}.`,
      })
    }
  })

  const topTechs = Array.from(new Set(orders.map((o) => o.tech)))
    .map((tech) => {
      const techOrders = orders.filter((o) => o.tech === tech && o.status === 'Finalizada')
      const totalOS = techOrders.length
      const avgTime =
        totalOS > 0
          ? Math.round(techOrders.reduce((sum, o) => sum + (o.totalDuration || 0), 0) / totalOS)
          : 0
      return { tech, totalOS, avgTime }
    })
    .sort((a, b) => b.totalOS - a.totalOS)
    .slice(0, 3)

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FinanceNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Executivo</h2>
        <p className="text-sm text-muted-foreground">
          Visão consolidada de rentabilidade, governança e alertas estratégicos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Realizada)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {globalRev.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {globalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${globalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}
            >
              R$ {globalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem Operacional</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Contratos (Mais Rentáveis)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data
                .filter((d) => d.profit > 0)
                .slice(0, 3)
                .map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Margem: {d.margin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-success font-bold">+ R$ {d.profit.toFixed(2)}</div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planejamento vs Realidade de Equipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data
                .filter((d) => d.plannedTechs || d.plannedHours)
                .slice(0, 3)
                .map((d) => (
                  <div
                    key={`team-${d.id}`}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Planejado: {d.plannedTechs} técnicos, {d.plannedHours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">Orçamento Equipe:</p>
                      <p className="font-bold text-sm">
                        R$ {d.estimatedTeamCost?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                <AlertCircle className="h-5 w-5" /> Centro de Governança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">Operação dentro dos limites.</p>
              )}
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-md border ${
                    a.type === 'critical'
                      ? 'bg-destructive/10 border-destructive shadow-sm'
                      : a.type === 'warning'
                        ? 'bg-warning/10 border-warning/20'
                        : 'bg-orange-500/10 border-orange-500/30'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-bold text-sm mb-1 ${a.type === 'critical' ? 'text-destructive' : a.type === 'warning' ? 'text-warning' : 'text-orange-600'}`}
                  >
                    {a.type === 'critical' ? (
                      <OctagonAlert className="h-4 w-4" />
                    ) : a.type === 'destructive' ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {a.title}
                  </div>
                  <p className="text-xs text-foreground/80">{a.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
