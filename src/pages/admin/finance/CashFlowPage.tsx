import FinanceNav from '@/components/admin/finance/FinanceNav'
import useFinanceStore from '@/stores/useFinanceStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMemo, useState } from 'react'

export default function CashFlowPage() {
  const { revenues, costs, purchases } = useFinanceStore()
  const [view, setView] = useState('month')

  const chartData = useMemo(() => {
    const periods: Record<string, { in: number; out: number }> = {}
    const allData = [
      ...revenues.map((r) => ({ d: r.date, val: r.value, type: 'in' })),
      ...costs.map((c) => ({ d: c.date, val: c.value, type: 'out' })),
      ...purchases.map((p) => ({ d: p.date, val: p.value, type: 'out' })),
    ]

    allData.forEach((item) => {
      let key = item.d
      if (view === 'month') key = item.d.substring(0, 7) // YYYY-MM
      if (!periods[key]) periods[key] = { in: 0, out: 0 }
      if (item.type === 'in') periods[key].in += item.val
      else periods[key].out += item.val
    })

    let accumulated = 0
    return Object.keys(periods)
      .sort()
      .map((k) => {
        const p = periods[k]
        const periodBalance = p.in - p.out
        accumulated += periodBalance
        return { name: k, Entradas: p.in, Saídas: p.out, Saldo: accumulated }
      })
  }, [revenues, costs, purchases, view])

  const config = {
    Entradas: { label: 'Entradas', color: 'hsl(var(--success))' },
    Saídas: { label: 'Saídas', color: 'hsl(var(--destructive))' },
    Saldo: { label: 'Saldo Acumulado', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FinanceNav />
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projeção de Fluxo de Caixa</h2>
          <p className="text-sm text-muted-foreground">
            Entradas e saídas esperadas ao longo do tempo.
          </p>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="day">Diário</TabsTrigger>
            <TabsTrigger value="month">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico e Projeção (Saldo Acumulado)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="Entradas"
                  stroke="hsl(var(--success))"
                  fill="url(#fillIn)"
                />
                <Area
                  type="monotone"
                  dataKey="Saídas"
                  stroke="hsl(var(--destructive))"
                  fill="url(#fillOut)"
                />
                <Area
                  type="monotone"
                  dataKey="Saldo"
                  stroke="hsl(var(--primary))"
                  fill="url(#fillBal)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
