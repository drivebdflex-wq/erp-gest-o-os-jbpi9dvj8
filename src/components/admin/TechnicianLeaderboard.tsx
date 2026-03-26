import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAppStore from '@/stores/useAppStore'
import { Trophy } from 'lucide-react'

export default function TechnicianLeaderboard() {
  const { orders } = useAppStore()

  const techStats = useMemo(() => {
    const stats: Record<string, { total: number; withinSla: number; duration: number }> = {}
    const completed = orders.filter((o) => o.status === 'Finalizada')

    completed.forEach((o) => {
      if (!stats[o.tech]) stats[o.tech] = { total: 0, withinSla: 0, duration: 0 }
      stats[o.tech].total += 1
      if (o.slaStatus === 'within_sla') stats[o.tech].withinSla += 1
      stats[o.tech].duration += o.totalDuration || 0
    })

    const result = Object.entries(stats)
      .map(([name, data]) => ({
        name,
        total: data.total,
        avgDuration: Math.round(data.duration / data.total),
        slaPercent: Math.round((data.withinSla / data.total) * 100),
      }))
      .sort((a, b) => b.slaPercent - a.slaPercent || b.total - a.total)

    if (result.length === 0) {
      return [
        { name: 'Carlos Silva', total: 45, avgDuration: 110, slaPercent: 95 },
        { name: 'Ana Souza', total: 38, avgDuration: 95, slaPercent: 92 },
        { name: 'João Santos', total: 41, avgDuration: 130, slaPercent: 88 },
      ]
    }
    return result
  }, [orders])

  return (
    <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Ranking de Técnicos (Concluídas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Técnico</TableHead>
              <TableHead className="text-right">OS Concluídas</TableHead>
              <TableHead className="text-right">Tempo Médio (min)</TableHead>
              <TableHead className="text-right">SLA no Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {techStats.map((tech, i) => (
              <TableRow key={tech.name}>
                <TableCell className="font-medium flex items-center gap-2">
                  {i === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {i === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                  {i === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                  {i > 2 && <span className="w-4 inline-block text-center">{i + 1}</span>}
                  {tech.name}
                </TableCell>
                <TableCell className="text-right">{tech.total}</TableCell>
                <TableCell className="text-right">{tech.avgDuration}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      tech.slaPercent >= 90
                        ? 'text-success font-semibold'
                        : tech.slaPercent >= 75
                          ? 'text-warning font-semibold'
                          : 'text-destructive font-semibold'
                    }
                  >
                    {tech.slaPercent}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
