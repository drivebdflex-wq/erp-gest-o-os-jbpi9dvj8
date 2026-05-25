import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const INITIAL_SLA = [
  {
    id: 'emergencial',
    name: 'Emergencial (48h)',
    respond: 4,
    resolve: 48,
    color: 'bg-destructive/20 text-destructive',
  },
  {
    id: 'urgente',
    name: 'Urgente (4 dias)',
    respond: 12,
    resolve: 96,
    color: 'bg-warning/20 text-warning',
  },
  {
    id: 'normal',
    name: 'Normal (10 dias)',
    respond: 24,
    resolve: 240,
    color: 'bg-secondary text-foreground',
  },
  {
    id: 'parcial',
    name: 'Parcial (3 dias)',
    respond: 12,
    resolve: 72,
    color: 'bg-primary/20 text-primary',
  },
  {
    id: 'garantia',
    name: 'Garantia (3 dias)',
    respond: 12,
    resolve: 72,
    color: 'bg-emerald-500/20 text-emerald-500',
  },
]

export default function SLASettings() {
  const [slas, setSlas] = useState(INITIAL_SLA)

  const handleSave = () => {
    toast({
      title: 'Políticas de SLA Salvas',
      description: 'Os novos tempos de resposta e resolução foram aplicados.',
    })
  }

  const updateSla = (id: string, field: 'respond' | 'resolve', value: string) => {
    const num = parseInt(value, 10) || 0
    setSlas(slas.map((s) => (s.id === id ? { ...s, [field]: num } : s)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Políticas de SLA
        </CardTitle>
        <CardDescription>
          Configure os limites de tempo (em horas) para resposta e solução baseados na prioridade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-md divide-y">
          <div className="grid grid-cols-3 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div>Nível de Prioridade</div>
            <div>Tempo Resposta (h)</div>
            <div>Tempo Solução (h)</div>
          </div>
          {slas.map((sla) => (
            <div key={sla.id} className="grid grid-cols-3 p-4 items-center gap-4">
              <div>
                <Badge variant="outline" className={`font-bold border-transparent ${sla.color}`}>
                  {sla.name}
                </Badge>
              </div>
              <div>
                <div className="relative w-24">
                  <Input
                    type="number"
                    min="0"
                    value={sla.respond}
                    onChange={(e) => updateSla(sla.id, 'respond', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">h</span>
                </div>
              </div>
              <div>
                <div className="relative w-24">
                  <Input
                    type="number"
                    min="0"
                    value={sla.resolve}
                    onChange={(e) => updateSla(sla.id, 'resolve', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">h</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Políticas</Button>
        </div>
      </CardContent>
    </Card>
  )
}
