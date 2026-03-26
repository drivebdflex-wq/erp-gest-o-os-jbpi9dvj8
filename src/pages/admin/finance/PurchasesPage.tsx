import { useState } from 'react'
import useFinanceStore from '@/stores/useFinanceStore'
import useAppStore from '@/stores/useAppStore'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export default function PurchasesPage() {
  const { purchases, addPurchase } = useFinanceStore()
  const { contracts } = useAppStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ type: 'material' })

  const handleSave = () => {
    if (!form.contractId || !form.value || !form.date || !form.supplier) return
    addPurchase({
      contractId: form.contractId,
      supplier: form.supplier,
      type: form.type,
      value: Number(form.value),
      date: form.date,
      invoiceUrl: form.invoiceUrl,
      materialName: form.materialName,
      quantity: Number(form.quantity),
    })
    setOpen(false)
    setForm({ type: 'material' })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compras</h2>
          <p className="text-sm text-muted-foreground">
            Registre aquisições e alimente o estoque automaticamente.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Compra
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrato</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((p) => {
              const c = contracts.find((c) => c.id === p.contractId)
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{c?.name || 'Desconhecido'}</TableCell>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell>{p.supplier}</TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell className="text-right font-mono">R$ {p.value.toFixed(2)}</TableCell>
                </TableRow>
              )
            })}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhuma compra registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contrato</Label>
              <Select onValueChange={(v) => setForm({ ...form, contractId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input
                  value={form.supplier || ''}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Material (Estoque)</SelectItem>
                    <SelectItem value="serviço">Serviço (Custo Direto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === 'material' && (
              <div className="grid grid-cols-2 gap-4 bg-secondary/50 p-3 rounded-md border border-border">
                <div className="space-y-2">
                  <Label>Nome do Material</Label>
                  <Input
                    value={form.materialName || ''}
                    onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.quantity || ''}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  value={form.value || ''}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.date || ''}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL da Nota Fiscal (Opcional)</Label>
              <Input
                placeholder="https://..."
                value={form.invoiceUrl || ''}
                onChange={(e) => setForm({ ...form, invoiceUrl: e.target.value })}
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
