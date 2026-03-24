import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, ClipboardList, Users, DollarSign } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

export default function DashboardCards() {
  const { orders } = useAppStore()
  const activeOrders = orders.filter(
    (o) => o.status !== 'Finalizada' && o.status !== 'Reprovada',
  ).length
  const completedOrders = orders.filter((o) => o.status === 'Finalizada').length
  const slaPercentage = Math.round((completedOrders / (orders.length || 1)) * 100) || 94

  const cards = [
    {
      title: 'SLA Cumprido',
      value: `${slaPercentage}%`,
      description: '+2% desde ontem',
      icon: Target,
      trend: 'up',
    },
    {
      title: 'OS Abertas/Andamento',
      value: activeOrders.toString(),
      description: '12 pendentes de despacho',
      icon: ClipboardList,
      trend: 'neutral',
    },
    {
      title: 'Técnicos em Campo',
      value: '24/28',
      description: '4 em pausa/deslocamento',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Custo Total (Mês)',
      value: 'R$ 142.5K',
      description: '-5% em materiais',
      icon: DollarSign,
      trend: 'down',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={i}
          className="hover:shadow-md transition-shadow animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
