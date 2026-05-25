import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export function MeasurementsDashboard() {
  const [data, setData] = useState<any>({
    currentMonthTotal: 0,
    pendingApproval: 0,
    totalInvoiced: 0,
    chartData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const { data: measurements } = await supabase.from('measurements').select('*')
    
    if (!measurements) {
      setLoading(false)
      return
    }

    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    let currentMonthTotal = 0
    let pendingApproval = 0
    let totalInvoiced = 0

    const monthlyData: Record<string, { measured: number, invoiced: number }> = {}

    measurements.forEach(m => {
      const val = Number(m.total_value) || 0
      const mDate = new Date(m.created_at)

      if (mDate >= start && mDate <= end) {
        currentMonthTotal += val
      }

      if (m.status === 'em_conferencia' || m.status === 'enviada') {
        pendingApproval += val
      }

      if (m.status === 'faturada') {
        totalInvoiced += val
      }

      // Format like "Jan/26"
      const monthKey = format(mDate, 'MMM/yy')
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { measured: 0, invoiced: 0 }
      }

      monthlyData[monthKey].measured += val
      if (m.status === 'faturada') {
        monthlyData[monthKey].invoiced += val
      }
    })

    const chartData = Object.entries(monthlyData).map(([name, values]) => ({
      name,
      ...values
    }))

    setData({ currentMonthTotal, pendingApproval, totalInvoiced, chartData })
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Medido (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.currentMonthTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendente de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.pendingApproval)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Faturado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalInvoiced)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valor Medido vs. Faturado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={{
              measured: { label: 'Medido', color: 'hsl(var(--chart-1))' },
              invoiced: { label: 'Faturado', color: 'hsl(var(--chart-2))' }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `R$ ${val}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="measured" name="Medido" fill="var(--color-measured)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="invoiced" name="Faturado" fill="var(--color-invoiced)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
