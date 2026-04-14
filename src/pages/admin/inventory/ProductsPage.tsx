import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { useState } from 'react'
import useInventoryStore from '@/stores/useInventoryStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export default function ProductsPage() {
  const { products, addProduct } = useInventoryStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({})

  const handleSave = () => {
    if (!form.name || !form.code) return
    addProduct({
      code: form.code,
      name: form.name,
      category: form.category || 'Geral',
      unit: form.unit || 'un',
      average_cost: Number(form.average_cost || 0),
      minimum_stock: Number(form.minimum_stock || 0),
    })
    setOpen(false)
    setForm({})
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro mestre de materiais e insumos.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Unidade</TableHead>
              <TableHead className="text-right">Estoque Mín.</TableHead>
              <TableHead className="text-right">Custo Médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono">{p.code}</TableCell>
                <TableCell className="font-semibold">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className="text-center">{p.unit}</TableCell>
                <TableCell className="text-right">{p.minimum_stock}</TableCell>
                <TableCell className="text-right font-mono">
                  R$ {p.average_cost.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Produto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome do Produto</Label>
              <Input onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Código (SKU)</Label>
              <Input onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Unidade de Medida</Label>
              <Input
                placeholder="Ex: un, m, kg"
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Custo Médio Inicial (R$)</Label>
              <Input
                type="number"
                onChange={(e) => setForm({ ...form, average_cost: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
