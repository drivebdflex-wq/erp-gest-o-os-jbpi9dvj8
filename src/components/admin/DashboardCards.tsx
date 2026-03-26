import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, ClipboardList, Clock } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

export default function DashboardCards() {
  const { orders } = useAppStore()

  const openOrders = orders.filter(
    (o) => !['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status),
  ).length

  const inProgressOrders = orders.filter((o) => o.status === 'Em Execução').length

  const todayStr = new Date().toISOString().split('T')[0]
  const finishedToday = orders.filter(
    (o) =>
      o.status === 'Finalizada' &&
      (o.finishedAt?.startsWith(todayStr) || o.updatedAt?.startsWith(todayStr)),
  ).length

  const slaBreached = orders.filter(
    (o) =>
      !['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status) && o.slaStatus === 'breached',
  ).length

  const cards = [
    {
      title: 'Total Abertas',
      value: openOrders.toString(),
      description: 'Não finalizadas',
      icon: ClipboardList,
      color: 'text-primary',
    },
    {
      title: 'Em Execução',
      value: inProgressOrders.toString(),
      description: 'Atividade no momento',
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: 'Concluídas Hoje',
      value: finishedToday.toString(),
      description: 'Baixadas no dia',
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      title: 'SLA Estourado',
      value: slaBreached.toString(),
      description: 'Atrasadas',
      icon: AlertCircle,
      color: 'text-destructive',
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
            <card.icon className={`h-4 w-4 ${card.color}`} />
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
