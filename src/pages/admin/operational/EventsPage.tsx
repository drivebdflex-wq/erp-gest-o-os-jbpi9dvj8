import { useState } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EventsPage() {
  const { events, technicians, addEvent } = useOperationalStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ type: 'falta' })

  const handleSave = () => {
    if (!form.technician_id || !form.description || !form.date) return
    addEvent({
      technician_id: form.technician_id,
      type: form.type,
      description: form.description,
      date: form.date,
      created_by: 'Administrador',
    })
    setOpen(false)
    setForm({ type: 'falta' })
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Eventos & Disciplina</h2>
          <p className="text-sm text-muted-foreground">
            Registro de faltas, advertências e reuniões de alinhamento.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Evento
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Registrado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((e) => {
              const tech = technicians.find((t) => t.id === e.technician_id)
              return (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold">{tech?.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.type === 'falta' || e.type === 'suspensão'
                          ? 'destructive'
                          : e.type === 'advertência'
                            ? 'secondary'
                            : 'default'
                      }
                      className="capitalize"
                    >
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.created_by}</TableCell>
                </TableRow>
              )
            })}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum evento disciplinar registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Evento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Técnico</Label>
              <Select onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="falta">Falta</SelectItem>
                  <SelectItem value="advertência">Advertência</SelectItem>
                  <SelectItem value="suspensão">Suspensão</SelectItem>
                  <SelectItem value="reunião">Reunião</SelectItem>
                  <SelectItem value="alinhamento">Alinhamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data do Evento</Label>
              <Input type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descrição / Motivo</Label>
              <Input onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
