import FleetNav from '@/components/admin/fleet/FleetNav'
import useFleetStore from '@/stores/useFleetStore'
import { useState } from 'react'
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

export default function DriversPage() {
  const { drivers, addDriver } = useFleetStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ status: 'active', category: 'B' })

  const handleSave = () => {
    if (!form.name || !form.cnh) return
    addDriver({
      name: form.name,
      cpf: form.cpf,
      cnh: form.cnh,
      cnh_expiration: form.cnh_expiration,
      category: form.category,
      status: form.status,
    })
    setOpen(false)
    setForm({ status: 'active', category: 'B' })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FleetNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Motoristas</h2>
          <p className="text-sm text-muted-foreground">Cadastro de condutores autorizados.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Motorista
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Validade CNH</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-bold">{d.name}</TableCell>
                <TableCell>{d.cpf}</TableCell>
                <TableCell>{d.cnh}</TableCell>
                <TableCell>{d.category}</TableCell>
                <TableCell
                  className={
                    new Date(d.cnh_expiration) < new Date() ? 'text-destructive font-bold' : ''
                  }
                >
                  {new Date(d.cnh_expiration).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={d.status === 'active' ? 'default' : 'secondary'}>
                    {d.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Motorista</DialogTitle>
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
              <Label>CPF</Label>
              <Input
                value={form.cpf || ''}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNH</Label>
              <Input
                value={form.cnh || ''}
                onChange={(e) => setForm({ ...form, cnh: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria CNH</Label>
              <Input
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Validade CNH</Label>
              <Input
                type="date"
                value={form.cnh_expiration || ''}
                onChange={(e) => setForm({ ...form, cnh_expiration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
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
