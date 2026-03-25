import DashboardCards from '@/components/admin/DashboardCards'
import DashboardCharts from '@/components/admin/DashboardCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

export default function Index() {
  const { orders } = useAppStore()
  const delayedOrders = orders.filter((o) => o.priority === 'Alta' && o.status !== 'Finalizada')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h2>
        <p className="text-muted-foreground">Visão geral em tempo real das operações de campo.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <DashboardCards />
          <DashboardCharts />
        </div>

        <div className="xl:col-span-1">
          <Card className="h-full animate-slide-up" style={{ animationDelay: '600ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas Críticos
              </CardTitle>
              <Badge variant="destructive">{delayedOrders.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {delayedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-1 border-l-2 border-destructive pl-3 py-1 bg-destructive/5 rounded-r-md"
                  >
                    <span className="text-sm font-semibold">{order.shortId}</span>
                    <span className="text-xs text-muted-foreground truncate">{order.title}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] uppercase font-bold text-destructive">
                        SLA Estourado
                      </span>
                      <span className="text-xs font-medium">{order.tech}</span>
                    </div>
                  </div>
                ))}
                {delayedOrders.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Nenhum alerta crítico.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
