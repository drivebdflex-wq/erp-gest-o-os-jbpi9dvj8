import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, AlertCircle, RefreshCw, Bug } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsPage() {
  const { products, isLoading, error, fetchData, addProduct } = useInventoryStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = () => {
    if (!form.name || !form.code) return
    addProduct({
      code: form.code,
      name: form.name,
      description: form.description || '',
      category: form.category || 'geral',
      unit: form.unit || 'un',
      price: Number(form.price || 0),
      average_cost: Number(form.average_cost || 0),
      minimum_stock: Number(form.minimum_stock || 0),
    })
    setOpen(false)
    setForm({})
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <InventoryNav />
        <div className="max-w-2xl mx-auto mt-10">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">Módulo Indisponível (Erro {error.code})</AlertTitle>
            <AlertDescription className="mt-2 text-sm">
              {error.code === '42P01' || error.message.includes('relation')
                ? 'A tabela solicitada não existe no banco de dados. Verifique se as migrations do Supabase foram aplicadas corretamente.'
                : error.message}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-4 justify-center">
            <Button onClick={() => fetchData()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro mestre de materiais e insumos integrados ao Supabase.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            title="Simular Erro de Tabela (Para Teste)"
            onClick={() => fetchData(true)}
          >
            <Bug className="h-4 w-4 text-destructive" />
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome & Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Unidade</TableHead>
              <TableHead className="text-right">Preço Venda</TableHead>
              <TableHead className="text-right">Data Inclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum produto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{p.category}</TableCell>
                  <TableCell className="text-center">{p.unit}</TableCell>
                  <TableCell className="text-right font-mono">
                    R$ {(p.price || p.average_cost || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
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
            <div className="space-y-2 col-span-2">
              <Label>Descrição</Label>
              <Input
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes adicionais"
              />
            </div>
            <div className="space-y-2">
              <Label>Código (SKU)</Label>
              <Input onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eletrica">Elétrica</SelectItem>
                  <SelectItem value="hidraulica">Hidráulica</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="geral">Geral / Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade de Medida</Label>
              <Input
                placeholder="Ex: un, m, kg"
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda (R$)</Label>
              <Input type="number" onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Custo Médio (R$)</Label>
              <Input
                type="number"
                onChange={(e) => setForm({ ...form, average_cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })}
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
