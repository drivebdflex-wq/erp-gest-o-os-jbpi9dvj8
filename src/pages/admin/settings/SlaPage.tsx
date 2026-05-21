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
import { Plus, Edit2, Clock } from 'lucide-react'

export default function SlaPage() {
  const [data, setData] = useState<any[]>([])
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
      if (form.id) {
        await supabase.from('sla_definitions').update(payload).eq('id', form.id)
      } else {
        await supabase.from('sla_definitions').insert([payload])
      }
      toast({ title: 'Sucesso', description: 'SLA salvo com sucesso.' })
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Service Level Agreements (SLA)
          </h1>
          <p className="text-muted-foreground">
            Definições de tempo de resposta e solução para contratos
          </p>
        </div>
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
          <Plus className="w-4 h-4 mr-2" /> Novo SLA
        </Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome do SLA</TableHead>
              <TableHead>Tempo de Resposta</TableHead>
              <TableHead>Tempo de Solução</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> {row.name}
                </TableCell>
                <TableCell>{row.response_time_minutes} min</TableCell>
                <TableCell>{row.resolution_time_minutes} min</TableCell>
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
            <DialogTitle>{form.id ? 'Editar SLA' : 'Novo SLA'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Alta Prioridade 4h"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resposta (Minutos)</Label>
                <Input
                  type="number"
                  value={form.response_time_minutes}
                  onChange={(e) =>
                    setForm({ ...form, response_time_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Solução (Minutos)</Label>
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
              Salvar SLA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
