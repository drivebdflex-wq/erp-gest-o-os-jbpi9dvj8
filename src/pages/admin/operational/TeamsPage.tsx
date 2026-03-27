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
import { Checkbox } from '@/components/ui/checkbox'

export default function TeamsPage() {
  const { teams, technicians, addTeam } = useOperationalStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ members: [], active: true })

  const handleSave = () => {
    if (!form.name || !form.supervisor_id || !form.start_date) return
    addTeam({
      name: form.name,
      supervisor_id: form.supervisor_id,
      members: form.members || [],
      start_date: form.start_date,
      end_date: form.end_date,
      active: form.active,
    })
    setOpen(false)
    setForm({ members: [], active: true })
  }

  const handleMemberChange = (techId: string, checked: boolean) => {
    setForm((prev: any) => ({
      ...prev,
      members: checked
        ? [...(prev.members || []), techId]
        : (prev.members || []).filter((id: string) => id !== techId),
    }))
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipes Dinâmicas</h2>
          <p className="text-sm text-muted-foreground">
            Organize e gerencie a composição dos times.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Equipe
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Equipe</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead className="text-center">Membros</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t) => {
              const supervisor = technicians.find((x) => x.id === t.supervisor_id)
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-bold">{t.name}</TableCell>
                  <TableCell>{supervisor?.name || 'Desconhecido'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{t.members.length} membros</Badge>
                  </TableCell>
                  <TableCell>{new Date(t.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={t.active !== false ? 'default' : 'secondary'}>
                      {t.active !== false ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Equipe</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome da Equipe</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Supervisor Responsável</Label>
              <Select onValueChange={(v) => setForm({ ...form, supervisor_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {technicians
                    .filter((t) => t.status === 'active')
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.active !== false ? 'true' : 'false'}
                onValueChange={(v) => setForm({ ...form, active: v === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativa</SelectItem>
                  <SelectItem value="false">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Membros da Equipe</Label>
              <div className="border rounded-md p-3 h-32 overflow-y-auto space-y-3 bg-secondary/20">
                {technicians
                  .filter((t) => t.status === 'active')
                  .map((t) => (
                    <div key={t.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tech-${t.id}`}
                        checked={form.members?.includes(t.id)}
                        onCheckedChange={(c) => handleMemberChange(t.id, !!c)}
                      />
                      <Label htmlFor={`tech-${t.id}`} className="font-normal cursor-pointer">
                        {t.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
