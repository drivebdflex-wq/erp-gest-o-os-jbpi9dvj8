import FinanceNav from '@/components/admin/finance/FinanceNav'
import { useState, useMemo } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, X, Send, AlertOctagon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'

export default function PurchasesPage() {
  const { purchases, addPurchase, updatePurchaseStatus, revenues, costs } = useFinanceStore()
  const { contracts, role } = useAppStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ type: 'material', exceptionAuth: false })

  const selectedContractStats = useMemo(() => {
    if (!form.contractId) return null
    const contractRevs = revenues
      .filter((r) => r.contractId === form.contractId && r.status === 'recebido')
      .reduce((a, b) => a + b.value, 0)
    const contractCosts = costs
      .filter((c) => c.contractId === form.contractId)
      .reduce((a, b) => a + b.value, 0)
    return { revs: contractRevs, csts: contractCosts, isNegative: contractCosts > contractRevs }
  }, [form.contractId, revenues, costs])

  const handleSave = () => {
    if (!form.contractId || !form.value || !form.date || !form.supplier) return

    if (selectedContractStats?.isNegative && !form.exceptionAuth) {
      toast({
        title: 'Trava de Prejuízo Ativa',
        description: 'Contrato negativo. Requer autorização de exceção pelo Admin.',
        variant: 'destructive',
      })
      return
    }

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
    setForm({ type: 'material', exceptionAuth: false })
    toast({ title: 'Solicitação Criada', description: 'Compra enviada para aprovação.' })
  }

  const renderTable = (filterStatus: string[]) => {
    const data = purchases
      .filter((p) => filterStatus.includes(p.status))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contrato</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => {
            const c = contracts.find((c) => c.id === p.contractId)
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{c?.name || 'Desconhecido'}</TableCell>
                <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                <TableCell>{p.supplier}</TableCell>
                <TableCell className="capitalize">{p.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.status === 'aprovado'
                        ? 'secondary'
                        : p.status === 'liberado'
                          ? 'default'
                          : p.status === 'reprovado'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">R$ {p.value.toFixed(2)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {p.status === 'solicitado' && role === 'admin' && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-success hover:text-success hover:bg-success/20"
                        onClick={() => updatePurchaseStatus(p.id, 'aprovado')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/20"
                        onClick={() => updatePurchaseStatus(p.id, 'reprovado')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {p.status === 'aprovado' && role === 'admin' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updatePurchaseStatus(p.id, 'liberado')
                        toast({
                          title: 'Recurso Liberado',
                          description: 'Estoque ou custos operacionais foram atualizados.',
                        })
                      }}
                    >
                      <Send className="w-3 h-3 mr-2" /> Liberar Recurso
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Nenhuma compra encontrada nesta etapa.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FinanceNav />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Solicitações de Compra</h2>
          <p className="text-sm text-muted-foreground">
            Workflow de aprovação e governança financeira de suprimentos.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Solicitação
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Tabs defaultValue="solicitadas" className="w-full">
          <div className="px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="solicitadas">Pendentes</TabsTrigger>
              <TabsTrigger value="aprovadas">Aprovadas (Aguard. Liberação)</TabsTrigger>
              <TabsTrigger value="liberadas">Histórico Liberado</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="solicitadas" className="m-0">
            {renderTable(['solicitado'])}
          </TabsContent>
          <TabsContent value="aprovadas" className="m-0">
            {renderTable(['aprovado'])}
          </TabsContent>
          <TabsContent value="liberadas" className="m-0">
            {renderTable(['liberado', 'reprovado'])}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Solicitação</DialogTitle>
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

            {selectedContractStats?.isNegative && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertOctagon className="w-4 h-4" />
                  Trava de Prejuízo Ativada
                </div>
                <p className="text-xs text-destructive mt-1">
                  Este contrato possui custos maiores que a receita recebida. Novas compras estão
                  bloqueadas.
                </p>
                {role === 'admin' && (
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="auth"
                      checked={form.exceptionAuth}
                      onCheckedChange={(c) => setForm({ ...form, exceptionAuth: c })}
                    />
                    <Label htmlFor="auth" className="text-xs font-medium cursor-pointer">
                      Autorizar Exceção Administrativa
                    </Label>
                  </div>
                )}
              </div>
            )}

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedContractStats?.isNegative && !form.exceptionAuth}
            >
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
