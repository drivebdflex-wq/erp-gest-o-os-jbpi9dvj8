import { useState, useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function OperationalAgendaPage() {
  const { orders, updateOrder } = useAppStore()
  const { technicians } = useOperationalStore()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const dayOrders = useMemo(() => {
    if (!date) return []
    const dStr = date.toISOString().split('T')[0]
    return orders.filter((o) => o.date.startsWith(dStr))
  }, [orders, date])

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId)
    setDraggedId(orderId)
  }

  const handleDropOnTech = async (e: React.DragEvent, techId: string) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('orderId')
    setDraggedId(null)
    if (orderId && updateOrder) {
      try {
        await updateOrder(orderId, { technician_id: techId, team_id: null })
        toast({ title: 'Sucesso', description: 'OS atribuída ao técnico na agenda.' })
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao atribuir OS.', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agenda Operacional Visual</h2>
        <p className="text-sm text-muted-foreground">
          Arraste e solte Ordens de Serviço para atribuir e planejar a execução.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 xl:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Planejamento Diário: {date?.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[450px]">
              <div className="w-72 flex-shrink-0 bg-secondary/20 p-4 rounded-xl flex flex-col border border-border">
                <h3 className="font-semibold mb-4 text-sm flex justify-between items-center">
                  Pendentes / Na Fila{' '}
                  <Badge variant="secondary">
                    {dayOrders.filter((o) => !o.technicianId && !o.teamId).length}
                  </Badge>
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {dayOrders
                    .filter((o) => !o.technicianId && !o.teamId)
                    .map((o) => (
                      <div
                        key={o.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, o.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={`p-3 bg-background border-2 rounded-lg cursor-grab hover:border-primary shadow-sm transition-all ${draggedId === o.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        <div className="font-bold text-sm">{o.shortId}</div>
                        <div className="text-xs mt-1 text-foreground/80 line-clamp-2">
                          {o.title}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <Badge variant="outline" className="text-[10px]">
                            {o.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{o.unit}</span>
                        </div>
                      </div>
                    ))}
                  {dayOrders.filter((o) => !o.technicianId && !o.teamId).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-10">
                      Nenhuma OS livre.
                    </p>
                  )}
                </div>
              </div>

              {technicians
                .filter((t) => t.status === 'active')
                .map((tech) => {
                  const assigned = dayOrders.filter((o) => o.technicianId === tech.id)
                  return (
                    <div
                      key={tech.id}
                      className="w-72 flex-shrink-0 bg-card p-4 rounded-xl flex flex-col border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnTech(e, tech.id)}
                    >
                      <h3 className="font-semibold mb-4 text-sm flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" /> {tech.name}
                        </span>
                        <Badge variant={assigned.length > 0 ? 'default' : 'secondary'}>
                          {assigned.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {assigned.map((o) => (
                          <div
                            key={o.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, o.id)}
                            onDragEnd={() => setDraggedId(null)}
                            className="p-3 bg-secondary/10 border-l-4 border-l-primary rounded-r-lg cursor-grab shadow-sm"
                          >
                            <div className="font-bold text-sm">{o.shortId}</div>
                            <div className="text-xs mt-1 text-foreground/80 line-clamp-1">
                              {o.title}
                            </div>
                            <div className="mt-2 text-[10px] text-muted-foreground">{o.status}</div>
                          </div>
                        ))}
                        {assigned.length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center">
                            Arraste uma OS para atribuir
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
