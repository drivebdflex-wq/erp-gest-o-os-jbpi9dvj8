import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Plus, Edit2, MapPin } from 'lucide-react'

export default function UnitsPage() {
  const [data, setData] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ id: '', client_id: '', name: '', prefix: '', address: '' })

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
      if (!form.client_id) throw new Error('Selecione um cliente.')
      if (!form.name) throw new Error('Nome é obrigatório.')

      if (form.id) {
        await supabase
          .from('units')
          .update({
            client_id: form.client_id,
            name: form.name,
            prefix: form.prefix,
            address: form.address,
          })
          .eq('id', form.id)
      } else {
        await supabase.from('units').insert([
          {
            client_id: form.client_id,
            name: form.name,
            prefix: form.prefix,
            address: form.address,
          },
        ])
      }
      toast({ title: 'Sucesso', description: 'Unidade salva com sucesso.' })
      setOpen(false)
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Unidades Físicas</h1>
          <p className="text-muted-foreground">Locais de atendimento vinculados aos clientes</p>
        </div>
        <Button
          onClick={() => {
            setForm({ id: '', client_id: '', name: '', prefix: '', address: '' })
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Unidade
        </Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome da Unidade</TableHead>
              <TableHead>Prefixo / Cód</TableHead>
              <TableHead>Cliente Vinculado</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> {row.name}
                </TableCell>
                <TableCell>{row.prefix}</TableCell>
                <TableCell>{row.clients?.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.address}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={form.client_id}
                onValueChange={(v) => setForm({ ...form, client_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente pai" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome da Unidade *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo / Cód. Agência</Label>
              <Input
                value={form.prefix}
                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>
              Salvar Unidade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
