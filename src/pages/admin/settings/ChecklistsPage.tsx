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
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Plus, Edit2, CheckSquare } from 'lucide-react'

export default function ChecklistsPage() {
  const [data, setData] = useState<any[]>([])
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
      if (form.id) {
        await supabase
          .from('checklists')
          .update({
            title: form.title,
            description: form.description,
          })
          .eq('id', form.id)
      } else {
        await supabase.from('checklists').insert([
          {
            title: form.title,
            description: form.description,
          },
        ])
      }
      toast({ title: 'Sucesso', description: 'Checklist salvo com sucesso.' })
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Modelos de Checklist</h1>
          <p className="text-muted-foreground">
            Gerenciamento de formulários padronizados para Ordens de Serviço
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ id: '', title: '', description: '' })
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Modelo
        </Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Título do Checklist</TableHead>
              <TableHead>Descrição do Uso</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" /> {row.title}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.description}</TableCell>
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
            <DialogTitle>{form.id ? 'Editar Modelo' : 'Novo Modelo de Checklist'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título do Checklist *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Vistoria Preventiva AC"
              />
            </div>
            <div className="space-y-2">
              <Label>Instruções / Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>
              Salvar Modelo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
