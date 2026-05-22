import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PageHeader } from '@/components/PageHeader'
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
import { Search, Plus, Filter, Clock, Edit2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function SlaPage() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    id: '',
    name: '',
    response_time_minutes: 0,
    resolution_time_minutes: 0,
    description: '',
  })

  const loadData = async () => {
    const { data: res } = await supabase.from('sla_definitions').select('*').order('name')
    if (res) setData(res)
  }
  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        response_time_minutes: Number(form.response_time_minutes),
        resolution_time_minutes: Number(form.resolution_time_minutes),
      }
      if (form.id) await supabase.from('sla_definitions').update(payload).eq('id', form.id)
      else await supabase.from('sla_definitions').insert([payload])
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      setOpen(false)
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const filtered = data.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Service Level Agreements (SLA)"
        description="Definições de tempo de resposta e solução"
        breadcrumbs={[{ label: 'Configurações' }, { label: 'SLA' }]}
        action={
          <Button
            onClick={() => {
              setForm({
                id: '',
                name: '',
                response_time_minutes: 60,
                resolution_time_minutes: 240,
                description: '',
              })
              setOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome do SLA</TableHead>
              <TableHead>Tempo de Resposta</TableHead>
              <TableHead>Tempo de Solução</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> {row.name}
                  </TableCell>
                  <TableCell>{row.response_time_minutes} min</TableCell>
                  <TableCell>{row.resolution_time_minutes} min</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm(row)
                        setOpen(true)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Novo'} SLA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resposta (min)</Label>
                <Input
                  type="number"
                  value={form.response_time_minutes}
                  onChange={(e) =>
                    setForm({ ...form, response_time_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Solução (min)</Label>
                <Input
                  type="number"
                  value={form.resolution_time_minutes}
                  onChange={(e) =>
                    setForm({ ...form, resolution_time_minutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
