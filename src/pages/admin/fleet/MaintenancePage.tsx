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

export default function MaintenancePage() {
  const { maintenances, vehicles, addMaintenance } = useFleetStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ type: 'Preventive' })

  const handleSave = () => {
    if (!form.vehicle_id || !form.cost || !form.date) return
    addMaintenance({
      vehicle_id: form.vehicle_id,
      type: form.type,
      description: form.description || '',
      date: form.date,
      km: Number(form.km),
      cost: Number(form.cost),
    })
    setOpen(false)
    setForm({ type: 'Preventive' })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FleetNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manutenções</h2>
          <p className="text-sm text-muted-foreground">
            Registro de serviços realizados nos veículos.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Manutenção
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenances
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((m) => {
                const v = vehicles.find((x) => x.id === m.vehicle_id)
                return (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{v?.plate}</TableCell>
                    <TableCell>
                      <Badge variant={m.type === 'Preventive' ? 'default' : 'secondary'}>
                        {m.type === 'Preventive' ? 'Preventiva' : 'Corretiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.description}</TableCell>
                    <TableCell className="text-right">{m.km}</TableCell>
                    <TableCell className="text-right text-destructive font-bold">
                      R$ {m.cost.toFixed(2)}
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
            <DialogTitle>Registrar Manutenção</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Veículo</Label>
              <Select onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} - {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventiva</SelectItem>
                  <SelectItem value="Corrective">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descrição do Serviço</Label>
              <Input onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>KM no momento</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, km: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Custo Total (R$)</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, cost: e.target.value })} />
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
