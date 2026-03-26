import DashboardCards from '@/components/admin/DashboardCards'
import DashboardCharts from '@/components/admin/DashboardCharts'
import DashboardFilters from '@/components/admin/DashboardFilters'
import KanbanSummary from '@/components/admin/KanbanSummary'
import TechnicianLeaderboard from '@/components/admin/TechnicianLeaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

export default function Index() {
  const { filteredOrders: orders } = useAppStore()

  const alerts: any[] = []
  const now = new Date().getTime()

  orders.forEach((o) => {
    if (['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status)) return

    const updatedAt = new Date(o.updatedAt).getTime()
    const hoursSinceUpdate = (now - updatedAt) / (1000 * 60 * 60)

    if (hoursSinceUpdate > 24) {
      alerts.push({
        id: `${o.id}-stuck`,
        type: 'stuck',
        title: `OS ${o.shortId} estagnada`,
        message: `Há mais de 24h em '${o.status}'`,
        tech: o.tech,
      })
    }

    if (o.slaStatus === 'warning') {
      alerts.push({
        id: `${o.id}-warning`,
        type: 'warning',
        title: `OS ${o.shortId} perto do prazo`,
        message: `SLA expira em breve`,
        tech: o.tech,
      })
    }

    if (o.status === 'Em Auditoria' && hoursSinceUpdate > 12) {
      alerts.push({
        id: `${o.id}-audit`,
        type: 'audit',
        title: `OS ${o.shortId} em auditoria prolongada`,
        message: `Revisão pendente > 12h`,
        tech: o.tech,
      })
    }
  })

  if (alerts.length === 0) {
    alerts.push({
      id: 'mock-1',
      type: 'stuck',
      title: 'Sem alertas críticos',
      message: 'A operação está fluindo perfeitamente.',
      tech: 'Sistema',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Operacional</h2>
        <p className="text-muted-foreground">
          Monitoramento em tempo real de contratos, serviços e projetos.
        </p>
      </div>

      <DashboardFilters />

      <DashboardCards />

      <KanbanSummary />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DashboardCharts />
          <TechnicianLeaderboard />
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card className="h-full animate-slide-up" style={{ animationDelay: '600ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-warning" />
                Alertas Inteligentes
              </CardTitle>
              <Badge variant="secondary">{alerts[0]?.id === 'mock-1' ? '0' : alerts.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex flex-col gap-1 border-l-2 pl-3 py-2 rounded-r-md ${
                      alert.type === 'stuck'
                        ? 'border-muted-foreground bg-muted/30'
                        : alert.type === 'warning'
                          ? 'border-warning bg-warning/10'
                          : 'border-destructive bg-destructive/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold">{alert.title}</span>
                      {alert.type === 'warning' && <Clock className="h-3 w-3 text-warning mt-1" />}
                      {alert.type === 'stuck' && (
                        <AlertTriangle className="h-3 w-3 text-muted-foreground mt-1" />
                      )}
                      {alert.type === 'audit' && (
                        <ShieldAlert className="h-3 w-3 text-destructive mt-1" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.message}</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium text-foreground/80">{alert.tech}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
