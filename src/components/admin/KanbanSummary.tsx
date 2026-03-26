import { Card, CardContent } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { Clock, Calendar, Truck, PlayCircle, ShieldCheck } from 'lucide-react'

export default function KanbanSummary() {
  const { orders } = useAppStore()

  const stages = [
    {
      id: 'pending',
      label: 'Pendente',
      icon: Clock,
      count: orders.filter((o) => o.status === 'Pendente').length,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50',
    },
    {
      id: 'scheduled',
      label: 'Agendado',
      icon: Calendar,
      count: orders.filter((o) => o.status === 'Agendado').length,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'deslocamento',
      label: 'Deslocamento',
      icon: Truck,
      count: orders.filter((o) => o.status === 'Em Deslocamento').length,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      id: 'in_progress',
      label: 'Em Execução',
      icon: PlayCircle,
      count: orders.filter((o) => o.status === 'Em Execução').length,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      id: 'in_audit',
      label: 'Em Auditoria',
      icon: ShieldCheck,
      count: orders.filter((o) => o.status === 'Em Auditoria').length,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stages.map((s, i) => (
        <Card
          key={s.id}
          className="animate-slide-up border-none shadow-sm"
          style={{ animationDelay: `${200 + i * 50}ms` }}
        >
          <CardContent
            className={`p-4 flex flex-col items-center justify-center text-center ${s.bg} rounded-xl h-full`}
          >
            <s.icon className={`h-6 w-6 mb-2 ${s.color}`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs font-medium text-foreground/80 mt-1">{s.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
