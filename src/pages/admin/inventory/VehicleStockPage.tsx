import InventoryNav from '@/components/admin/inventory/InventoryNav'
import useInventoryStore from '@/stores/useInventoryStore'
import useFleetStore from '@/stores/useFleetStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export default function VehicleStockPage() {
  const { products, balances } = useInventoryStore()
  const { vehicles } = useFleetStore()
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')

  const vehicleBalances = balances.filter(
    (b) =>
      b.location_type === 'vehicle' &&
      (selectedVehicle === 'all' || b.location_id === selectedVehicle),
  )

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque por Veículo</h2>
          <p className="text-sm text-muted-foreground">
            Gestão de materiais alocados nas viaturas em campo.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar Veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Veículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate} - {v.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Unidade</TableHead>
              <TableHead className="text-right">Quantidade Atual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleBalances.map((b) => {
              const p = products.find((x) => x.id === b.product_id)
              const v = vehicles.find((x) => x.id === b.location_id)
              if (!p) return null
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    {v ? `${v.plate} (${v.model})` : 'Desconhecido'}
                  </TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-center">{p.unit}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {b.quantity}
                  </TableCell>
                </TableRow>
              )
            })}
            {vehicleBalances.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum estoque alocado no veículo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
