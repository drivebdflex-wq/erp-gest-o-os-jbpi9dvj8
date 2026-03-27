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
import { useNavigate } from 'react-router-dom'
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

export default function VehiclesPage() {
  const { vehicles, addVehicle } = useFleetStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ type: 'car', fuel_type: 'flex', status: 'active' })

  const handleSave = () => {
    if (!form.plate || !form.model || !form.brand) return
    addVehicle({
      plate: form.plate,
      model: form.model,
      brand: form.brand,
      year: Number(form.year),
      type: form.type,
      fuel_type: form.fuel_type,
      status: form.status,
      current_km: Number(form.current_km),
      purchase_date: form.purchase_date || new Date().toISOString().split('T')[0],
      purchase_value: Number(form.purchase_value || 0),
    })
    setOpen(false)
    setForm({ type: 'car', fuel_type: 'flex', status: 'active' })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FleetNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Veículos</h2>
          <p className="text-sm text-muted-foreground">Gestão de ativos da frota.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Veículo
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>KM Atual</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow
                key={v.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/frotas/veiculos/${v.id}`)}
              >
                <TableCell className="font-bold">{v.plate}</TableCell>
                <TableCell>
                  {v.brand} {v.model}
                </TableCell>
                <TableCell>{v.year}</TableCell>
                <TableCell className="capitalize">
                  {v.type === 'car' ? 'Carro' : v.type === 'motorcycle' ? 'Moto' : 'Caminhão'}
                </TableCell>
                <TableCell>{v.current_km} km</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      v.status === 'active'
                        ? 'default'
                        : v.status === 'maintenance'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {v.status === 'active'
                      ? 'Ativo'
                      : v.status === 'maintenance'
                        ? 'Manutenção'
                        : 'Inativo'}
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
            <DialogTitle>Registrar Veículo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Placa</Label>
              <Input
                value={form.plate || ''}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={form.brand || ''}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input
                value={form.model || ''}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                value={form.year || ''}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Carro</SelectItem>
                  <SelectItem value="motorcycle">Moto</SelectItem>
                  <SelectItem value="truck">Caminhão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Combustível</Label>
              <Select
                value={form.fuel_type}
                onValueChange={(v) => setForm({ ...form, fuel_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasolina</SelectItem>
                  <SelectItem value="ethanol">Etanol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>KM Atual</Label>
              <Input
                type="number"
                value={form.current_km || ''}
                onChange={(e) => setForm({ ...form, current_km: e.target.value })}
              />
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
