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
import { Search, Plus, Filter, CheckSquare, Edit2 } from 'lucide-react'
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

export default function ChecklistsPage() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ id: '', title: '', description: '' })

  const loadData = async () => {
    const { data: res } = await supabase
      .from('checklists')
      .select('*')
      .order('created_at', { ascending: false })
    if (res) setData(res)
  }
  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    try {
      const payload = { title: form.title, description: form.description }
      if (form.id) await supabase.from('checklists').update(payload).eq('id', form.id)
      else await supabase.from('checklists').insert([payload])
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      setOpen(false)
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const filtered = data.filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Checklists"
        description="Modelos de formulários padronizados"
        breadcrumbs={[{ label: 'Configurações' }, { label: 'Checklists' }]}
        action={
          <Button
            onClick={() => {
              setForm({ id: '', title: '', description: '' })
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
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-muted-foreground" /> {row.title}
                  </TableCell>
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
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
            <DialogTitle>{form.id ? 'Editar' : 'Novo'} Modelo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
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
