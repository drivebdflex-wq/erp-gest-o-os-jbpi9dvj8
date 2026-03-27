import FleetNav from '@/components/admin/fleet/FleetNav'
import useFleetStore from '@/stores/useFleetStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Droplet, AlertTriangle, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

export default function FleetDashboard() {
  const { vehicles, maintenances, refuelings } = useFleetStore()

  const { totalCost, vehicleStats, alerts } = useMemo(() => {
    let cost = 0
    const stats: Record<string, { cost: number; kmTotal: number; liters: number; name: string }> =
      {}

    vehicles.forEach((v) => {
      stats[v.id] = { cost: 0, kmTotal: 0, liters: 0, name: `${v.plate} - ${v.model}` }
    })

    maintenances.forEach((m) => {
      cost += m.cost
      if (stats[m.vehicle_id]) stats[m.vehicle_id].cost += m.cost
    })

    refuelings.forEach((r) => {
      cost += r.value
      if (stats[r.vehicle_id]) {
        stats[r.vehicle_id].cost += r.value
        stats[r.vehicle_id].liters += r.liters
      }
    })

    const generatedAlerts: any[] = []

    const vStats = Object.values(stats).map((s) => {
      if (s.cost > 5000) {
        generatedAlerts.push({
          type: 'high_cost',
          title: 'Custo Elevado',
          message: `${s.name} gerou R$ ${s.cost.toFixed(2)} em despesas.`,
        })
      }
      return s
    })

    vehicles.forEach((v) => {
      if (v.current_km % 10000 > 9000) {
        generatedAlerts.push({
          type: 'maintenance',
          title: 'Revisão Próxima',
          message: `${v.plate} - ${v.model} está com ${v.current_km} km.`,
        })
      }
    })

    return { totalCost: cost, vehicleStats: vStats, alerts: generatedAlerts }
  }, [vehicles, maintenances, refuelings])

  const avgConsumption = useMemo(() => {
    const validRefuels = refuelings.filter((r) => r.consumption)
    if (validRefuels.length === 0) return 0
    return validRefuels.reduce((acc, r) => acc + (r.consumption || 0), 0) / validRefuels.length
  }, [refuelings])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FleetNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard da Frota</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral de custos operacionais e saúde dos veículos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custo Total da Frota</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consumo Médio (Frota)</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConsumption.toFixed(1)} km/l</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {alerts.filter((a) => a.type === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {vehicles.filter((v) => v.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Centro de Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">Frota operando sem alertas críticos.</p>
            )}
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`p-3 rounded-md border ${a.type === 'high_cost' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-warning/10 border-warning/20 text-warning-foreground'}`}
              >
                <div className="font-bold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {a.title}
                </div>
                <div className="text-xs mt-1 opacity-90">{a.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
