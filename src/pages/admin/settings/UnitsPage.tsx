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
import { Search, Plus, Filter, MapPin, Edit2 } from 'lucide-react'
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

export default function UnitsPage() {
  const [data, setData] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ id: '', client_id: 'none', name: '', prefix: '', address: '' })

  const loadData = async () => {
    const { data: res } = await supabase.from('units').select('*, clients(name)').order('name')
    if (res) setData(res)
    const { data: cls } = await supabase.from('clients').select('id, name').order('name')
    if (cls) setClients(cls)
  }
  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        prefix: form.prefix,
        address: form.address,
        client_id: form.client_id === 'none' ? null : form.client_id,
      }
      if (form.id) await supabase.from('units').update(payload).eq('id', form.id)
      else await supabase.from('units').insert([payload])
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      setOpen(false)
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const filtered = data.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.prefix?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Unidades"
        description="Locais de atendimento vinculados aos clientes"
        breadcrumbs={[{ label: 'Configurações' }, { label: 'Unidades' }]}
        action={
          <Button
            onClick={() => {
              setForm({ id: '', client_id: 'none', name: '', prefix: '', address: '' })
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
              <TableHead>Unidade</TableHead>
              <TableHead>Prefixo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" /> {row.name}
                  </TableCell>
                  <TableCell>{row.prefix}</TableCell>
                  <TableCell>{row.clients?.name || '-'}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{row.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({ ...row, client_id: row.client_id || 'none' })
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
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} Unidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo / Cód.</Label>
              <Input
                value={form.prefix}
                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente Vinculado</Label>
              <Select
                value={form.client_id}
                onValueChange={(v) => setForm({ ...form, client_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
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
