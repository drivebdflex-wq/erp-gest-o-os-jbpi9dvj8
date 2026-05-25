import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Mail, Plus, Trash2, CalendarClock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'

type Schedule = {
  id: string
  frequency: 'weekly' | 'monthly'
  emails: string
  filters: { client: string; unit: string; type: string }
}

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    frequency: 'weekly',
    emails: 'diretoria@cliente.com, ops@cliente.com',
    filters: { client: 'all', unit: 'all', type: 'all' },
  },
]

export default function ReportSchedulesSettings() {
  const { clients, orders } = useAppStore()
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<Schedule, 'id'>>({
    frequency: 'weekly',
    emails: '',
    filters: { client: 'all', unit: 'all', type: 'all' },
  })

  const units = useMemo(() => {
    const u = new Set(orders.map((o) => o.unit))
    return Array.from(u).sort()
  }, [orders])

  const resetForm = () => {
    setFormData({
      frequency: 'weekly',
      emails: '',
      filters: { client: 'all', unit: 'all', type: 'all' },
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSchedules([...schedules, { id: crypto.randomUUID(), ...formData }])
    setIsOpen(false)
    resetForm()
    toast({
      title: 'Agendamento Criado',
      description: 'O envio automático do relatório foi configurado com sucesso.',
    })
  }

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id))
    toast({ title: 'Agendamento Removido', description: 'A automação foi excluída.' })
  }

  const subjectPreview = `Relatório Operacional - ${formData.filters.client === 'all' ? 'Todos os Clientes' : formData.filters.client} - ${formData.frequency === 'weekly' ? 'Últimos 7 dias' : 'Mês Anterior'}`

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Envio Automático de Relatórios
            </CardTitle>
            <CardDescription className="mt-1">
              Agende relatórios em PDF (Semanal ou Mensal) com base em filtros predefinidos.
            </CardDescription>
          </div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>Configurar Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    O sistema irá gerar um PDF idêntico à exportação manual e enviar por e-mail.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="emails">E-mails Destinatários (separados por vírgula)</Label>
                    <Input
                      id="emails"
                      required
                      placeholder="email1@exemplo.com, gestor@empresa.com"
                      value={formData.emails}
                      onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Frequência</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(val: 'weekly' | 'monthly') =>
                          setFormData({ ...formData, frequency: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal (Segunda-feira)</SelectItem>
                          <SelectItem value="monthly">Mensal (Dia 1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Cliente</Label>
                      <Select
                        value={formData.filters.client}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, client: val },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Clientes</SelectItem>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Unidade</Label>
                      <Select
                        value={formData.filters.unit}
                        onValueChange={(val) =>
                          setFormData({ ...formData, filters: { ...formData.filters, unit: val } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo de Serviço</Label>
                      <Select
                        value={formData.filters.type}
                        onValueChange={(val) =>
                          setFormData({ ...formData, filters: { ...formData.filters, type: val } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Preventiva">Preventiva</SelectItem>
                          <SelectItem value="Corretiva">Corretiva</SelectItem>
                          <SelectItem value="Obra">Obra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <Label className="text-xs text-muted-foreground uppercase mb-1 block">
                      Preview do Assunto do E-mail
                    </Label>
                    <p className="text-sm font-medium">{subjectPreview}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar Automação</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frequência</TableHead>
              <TableHead>Destinatários</TableHead>
              <TableHead>Filtros Ativos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  <Badge variant={schedule.frequency === 'weekly' ? 'secondary' : 'default'}>
                    {schedule.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={schedule.emails}>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {schedule.emails}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  C: {schedule.filters.client === 'all' ? 'Todos' : schedule.filters.client} | U:{' '}
                  {schedule.filters.unit === 'all' ? 'Todas' : schedule.filters.unit} | T:{' '}
                  {schedule.filters.type === 'all' ? 'Todos' : schedule.filters.type}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento configurado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
