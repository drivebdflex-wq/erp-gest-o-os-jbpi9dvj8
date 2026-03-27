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

export default function RefuelingPage() {
  const { refuelings, vehicles, drivers, addRefueling } = useFleetStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({})

  const handleSave = () => {
    if (!form.vehicle_id || !form.driver_id || !form.date) return
    addRefueling({
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id,
      liters: Number(form.liters),
      value: Number(form.value),
      km: Number(form.km),
      date: form.date,
    })
    setOpen(false)
    setForm({})
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FleetNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Abastecimentos</h2>
          <p className="text-sm text-muted-foreground">
            Registro de combustível e cálculo de consumo.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Abastecimento
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead className="text-right">Litros</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Consumo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refuelings
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((r) => {
                const v = vehicles.find((x) => x.id === r.vehicle_id)
                const d = drivers.find((x) => x.id === r.driver_id)
                return (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{v?.plate}</TableCell>
                    <TableCell className="text-muted-foreground">{d?.name}</TableCell>
                    <TableCell className="text-right">{r.liters} L</TableCell>
                    <TableCell className="text-right text-destructive font-bold">
                      R$ {r.value.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{r.km}</TableCell>
                    <TableCell className="text-right text-primary font-bold">
                      {r.consumption ? `${r.consumption.toFixed(1)} km/l` : '-'}
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
            <DialogTitle>Registrar Abastecimento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label>Motorista</Label>
              <Select onValueChange={(v) => setForm({ ...form, driver_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>KM no Painel</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, km: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Litros (L)</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, liters: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, value: e.target.value })} />
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
