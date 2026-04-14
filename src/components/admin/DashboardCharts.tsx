import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const productivityData = [
  { name: 'Seg', concluida: 12, reprovada: 2 },
  { name: 'Ter', concluida: 19, reprovada: 1 },
  { name: 'Qua', concluida: 15, reprovada: 3 },
  { name: 'Qui', concluida: 22, reprovada: 0 },
  { name: 'Sex', concluida: 28, reprovada: 1 },
]

const volumeData = [
  { time: '08:00', volume: 5 },
  { time: '10:00', volume: 15 },
  { time: '12:00', volume: 30 },
  { time: '14:00', volume: 25 },
  { time: '16:00', volume: 45 },
  { time: '18:00', volume: 10 },
]

export default function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Produtividade (Semanal)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              concluida: { color: 'hsl(var(--success))', label: 'Concluídas' },
              reprovada: { color: 'hsl(var(--destructive))', label: 'Reprovadas' },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={productivityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="concluida" fill="var(--color-concluida)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reprovada" fill="var(--color-reprovada)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle>Volume de OS (Hoje)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ volume: { color: 'hsl(var(--primary))', label: 'Aberturas' } }}
            className="h-[300px] w-full"
          >
            <LineChart data={volumeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="var(--color-volume)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
