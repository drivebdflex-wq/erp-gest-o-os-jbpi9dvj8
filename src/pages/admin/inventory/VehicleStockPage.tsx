import { useEffect, useState } from 'react'
import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'

export default function VehicleStockPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVehicles() {
      const { data } = await supabase.from('vehicles').select('id, plate, model').order('plate')
      if (data) setVehicles(data)
    }
    loadVehicles()
  }, [])

  useEffect(() => {
    async function loadStock() {
      setLoading(true)
      let query = supabase
        .from('inventory')
        .select('*, materials(name, unit_type, sku), vehicles(plate, model)')
        .not('vehicle_id', 'is', null)

      if (selectedVehicle !== 'all') {
        query = query.eq('vehicle_id', selectedVehicle)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (!error && data) setItems(data)
      setLoading(false)
    }
    loadStock()
  }, [selectedVehicle])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <InventoryNav />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque por Veículo</h2>
          <p className="text-sm text-muted-foreground">
            Monitoramento do estoque alocado em cada veículo técnico.
          </p>
        </div>
        <div className="w-[250px]">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os veículos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate} {v.model ? `- ${v.model}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiais nos Veículos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Produto/Material</TableHead>
                <TableHead className="text-right">Qtd Atual</TableHead>
                <TableHead>Unidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-10 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum item alocado nos veículos selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.vehicles?.plate}</TableCell>
                    <TableCell className="font-mono">{item.materials?.sku || '-'}</TableCell>
                    <TableCell>{item.materials?.name}</TableCell>
                    <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                    <TableCell>{item.materials?.unit_type}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
