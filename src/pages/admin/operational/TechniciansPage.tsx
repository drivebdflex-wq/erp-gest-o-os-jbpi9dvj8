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

export default function TechniciansPage() {
  const { technicians, addTechnician } = useOperationalStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({
    level: 'junior',
    status: 'active',
    salary_type: 'mensal',
  })

  const handleSave = () => {
    if (!form.name || !form.role) return
    let cost = form.cost_per_hour || 0
    if (form.salary_type === 'mensal' && form.salary_amount) cost = form.salary_amount / 220
    else if (form.salary_type === 'diária' && form.salary_amount) cost = form.salary_amount / 8
    else if (form.salary_type === 'hora') cost = form.salary_amount

    addTechnician({
      name: form.name,
      phone: form.phone || '',
      role: form.role,
      level: form.level,
      status: form.status,
      salary_type: form.salary_type,
      salary_amount: Number(form.salary_amount || 0),
      cost_per_hour: cost,
    })
    setOpen(false)
    setForm({ level: 'junior', status: 'active', salary_type: 'mensal' })
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Técnicos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o quadro e custos da mão de obra.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Técnico
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Custo/Hora</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-bold">{t.name}</TableCell>
                <TableCell>{t.role}</TableCell>
                <TableCell className="capitalize">{t.level}</TableCell>
                <TableCell className="text-primary font-medium">
                  {t.cost_per_hour ? `R$ ${t.cost_per_hour.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>
                    {t.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Técnico</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Júnior</SelectItem>
                  <SelectItem value="pleno">Pleno</SelectItem>
                  <SelectItem value="senior">Sênior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Salário</Label>
              <Select
                value={form.salary_type}
                onValueChange={(v) => setForm({ ...form, salary_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="diária">Diária</SelectItem>
                  <SelectItem value="hora">Hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor Base (R$)</Label>
              <Input
                type="number"
                value={form.salary_amount || ''}
                onChange={(e) => setForm({ ...form, salary_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
