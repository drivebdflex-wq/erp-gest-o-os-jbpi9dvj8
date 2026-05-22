import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

const FINANCE_TYPES = [
  { value: 'purchase', label: 'Compras', color: 'text-orange-500' },
  { value: 'operational_cost', label: 'Custos Operacionais', color: 'text-red-500' },
  { value: 'revenue', label: 'Receitas', color: 'text-green-500' },
  { value: 'misc_expense', label: 'Despesas Diversas', color: 'text-blue-500' },
]

const CATEGORIES: Record<string, string[]> = {
  purchase: ['Materiais', 'Fornecedores', 'Pedidos'],
  operational_cost: ['Combustível', 'Locação', 'Alimentação', 'Hospedagem', 'Equipamentos'],
  revenue: ['Faturamento', 'Medições', 'Recebimentos'],
  misc_expense: ['Multas', 'Taxas', 'Emergências'],
}

export default function ProjectFinancePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [records, setRecords] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<any>({ type: 'purchase', category: '' })

  useEffect(() => {
    fetchProjects()
  }, [])
  useEffect(() => {
    if (selectedProjectId) fetchRecords(selectedProjectId)
  }, [selectedProjectId])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name')
    if (data) setProjects(data)
  }

  const fetchRecords = async (pid: string) => {
    const { data } = await supabase
      .from('project_finance')
      .select('*')
      .eq('project_id', pid)
      .order('date', { ascending: false })
    if (data) setRecords(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) return toast.error('Selecione uma obra')

    const { error } = await supabase
      .from('project_finance')
      .insert([{ ...formData, project_id: selectedProjectId }])
    if (error) toast.error('Erro ao salvar registro')
    else {
      toast.success('Registro salvo')
      setIsOpen(false)
      setFormData({ type: 'purchase', category: '' })
      fetchRecords(selectedProjectId)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro da Obra</h2>
        <div className="w-64">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma obra..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedProjectId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registros Financeiros</CardTitle>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Novo Registro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lançamento Financeiro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select
                        required
                        value={formData.type}
                        onValueChange={(v) => setFormData({ ...formData, type: v, category: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {FINANCE_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoria</label>
                      <Select
                        required
                        value={formData.category}
                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES[formData.type]?.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      required
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor</label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <Input
                        type="date"
                        required
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {records.map((r) => {
                  const tInfo = FINANCE_TYPES.find((f) => f.value === r.type)
                  const isPositive = r.type === 'revenue'
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        {isPositive ? (
                          <ArrowUpCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-500" />
                        )}
                        {tInfo?.label}
                      </TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell
                        className={`text-right font-bold ${isPositive ? 'text-green-600' : ''}`}
                      >
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(r.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
