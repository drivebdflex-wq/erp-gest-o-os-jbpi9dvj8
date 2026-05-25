import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Users, ClipboardList } from 'lucide-react'

export default function SupervisorPanelPage() {
  const { orders } = useAppStore()
  const { technicians, teams } = useOperationalStore()

  const openOrders = useMemo(() => {
    return orders.filter((o) =>
      ['Pendente', 'Agendado', 'Em Deslocamento', 'Em Execução', 'Pausado'].includes(o.status),
    )
  }, [orders])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Painel do Supervisor</h2>
        <p className="text-sm text-muted-foreground">
          Controle central operacional: OS abertas, técnicos disponíveis e equipes ativas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> OS Abertas e Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {openOrders.map((o) => (
              <div
                key={o.id}
                className="p-4 border rounded-md bg-secondary/20 flex justify-between items-center hover:border-primary transition-colors"
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {o.shortId} - {o.title}
                    <Badge variant="outline" className="text-[10px]">
                      {o.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status atual: {o.status} | Prazo: {o.date}
                  </div>
                  <div className="text-xs font-medium text-primary mt-1">
                    Responsável:{' '}
                    {o.technicianId ? o.tech : o.teamId ? 'Equipe Atribuída' : 'Não atribuído'}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
            {openOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma OS em aberto no momento.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Equipes Dinâmicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[250px] overflow-y-auto">
              {teams
                .filter((t) => t.active !== false)
                .map((t) => (
                  <div key={t.id} className="p-3 border rounded-md hover:bg-secondary/20">
                    <div className="font-bold text-sm flex justify-between items-center">
                      {t.name}{' '}
                      <Badge variant="secondary" className="text-[10px]">
                        {t.members.length} unid
                      </Badge>
                    </div>
                  </div>
                ))}
              {teams.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma equipe ativa.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Técnicos e Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {technicians
                .filter((t) => t.status === 'active')
                .map((t) => {
                  const assignedOS = openOrders.filter((o) => o.technicianId === t.id).length
                  return (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-2 border-b last:border-0"
                    >
                      <div>
                        <div className="font-medium text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                      <Badge
                        variant={assignedOS > 0 ? 'secondary' : 'default'}
                        className="text-[10px]"
                      >
                        {assignedOS > 0 ? `${assignedOS} OS` : 'Livre'}
                      </Badge>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
