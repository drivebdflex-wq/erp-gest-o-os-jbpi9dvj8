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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function PhysicalInventoryPage() {
  const { products, balances, adjustInventory } = useInventoryStore()
  const { vehicles } = useFleetStore()
  const { toast } = useToast()

  const [locationType, setLocationType] = useState<'central' | 'vehicle'>('central')
  const [locationId, setLocationId] = useState<string>('central')
  const [counts, setCounts] = useState<Record<string, string>>({})

  const activeBalances = balances.filter((b) => b.location_id === locationId)

  const handleAdjust = (productId: string) => {
    const val = parseInt(counts[productId])
    if (isNaN(val) || val < 0) {
      toast({
        title: 'Aviso',
        description: 'Insira um valor válido para ajustar.',
        variant: 'destructive',
      })
      return
    }
    adjustInventory(productId, locationType, locationId, val)
    toast({ title: 'Ajuste Realizado', description: 'Estoque sincronizado com a contagem física.' })
    setCounts((prev) => ({ ...prev, [productId]: '' }))
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventário Físico (Stock Take)</h2>
        <p className="text-sm text-muted-foreground">
          Contagem manual e acerto de divergências de estoque.
        </p>
      </div>

      <div className="flex gap-4 mt-6 bg-card p-4 rounded-md border">
        <div className="w-48">
          <Select
            value={locationType}
            onValueChange={(v: any) => {
              setLocationType(v)
              setLocationId(v === 'central' ? 'central' : vehicles[0]?.id || '')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central">Almoxarifado Central</SelectItem>
              <SelectItem value="vehicle">Veículo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {locationType === 'vehicle' && (
          <div className="w-64">
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Veículo" />
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
        )}
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Qtd Atual no Sistema</TableHead>
              <TableHead className="text-center w-48">Contagem Física</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const bal = activeBalances.find((b) => b.product_id === p.id)
              const currentQty = bal ? bal.quantity : 0
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-center font-mono">{currentQty}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={counts[p.id] || ''}
                      onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })}
                      placeholder="Qtd Real"
                      className="text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!counts[p.id]}
                      onClick={() => handleAdjust(p.id)}
                    >
                      Ajustar Saldo
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
