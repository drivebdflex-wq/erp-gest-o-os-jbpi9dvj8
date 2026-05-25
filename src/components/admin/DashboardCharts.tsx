import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import useAppStore from '@/stores/useAppStore'

export default function DashboardCharts() {
  const { filteredOrders: orders } = useAppStore()

  const slaData = useMemo(() => {
    const active = orders.filter(
      (o) => !['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status),
    )
    let within = 0,
      warning = 0,
      breached = 0

    active.forEach((o) => {
      if (o.slaStatus === 'breached') breached++
      else if (o.slaStatus === 'warning') warning++
      else within++
    })

    if (within === 0 && warning === 0 && breached === 0 && orders.length === 0) {
      return []
    }

    if (within === 0 && warning === 0 && breached === 0) {
      within = 1
    }

    return [
      { name: 'No Prazo', value: within, fill: 'var(--color-within)' },
      { name: 'Risco', value: warning, fill: 'var(--color-warning)' },
      { name: 'Atrasado', value: breached, fill: 'var(--color-breached)' },
    ]
  }, [orders])

  const typeData = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'Finalizada')
    const stats: Record<string, { total: number; duration: number }> = {
      Preventiva: { total: 0, duration: 0 },
      Corretiva: { total: 0, duration: 0 },
      Obra: { total: 0, duration: 0 },
    }

    completed.forEach((o) => {
      if (stats[o.type]) {
        stats[o.type].total++
        stats[o.type].duration += o.totalDuration || 0
      }
    })

    const result = Object.entries(stats).map(([name, data]) => ({
      name,
      avg: data.total > 0 ? Math.round(data.duration / data.total) : 0,
    }))

    return result
  }, [orders])

  const slaConfig = {
    within: { label: 'No Prazo', color: 'hsl(var(--success))' },
    warning: { label: 'Risco', color: 'hsl(var(--warning))' },
    breached: { label: 'Atrasado', color: 'hsl(var(--destructive))' },
    value: { label: 'OSs' },
  }

  const typeConfig = {
    avg: { label: 'Tempo Médio (min)', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Status de SLA (Ativas)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={slaConfig} className="h-[250px] w-full">
            {slaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={slaData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {slaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle>Tempo Médio por Tipo (min)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={typeConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avg" fill="var(--color-avg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
