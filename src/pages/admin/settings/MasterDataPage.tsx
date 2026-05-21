import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Plus, Edit2 } from 'lucide-react'

function GenericCrud({
  tableName,
  title,
  cols,
}: {
  tableName: string
  title: string
  cols: string[]
}) {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ id: '' })

  const load = async () => {
    const { data: res } = await supabase.from(tableName).select('*').order(cols[0])
    if (res) setData(res)
  }

  useEffect(() => {
    load()
  }, [tableName])

  const handleSave = async () => {
    try {
      const payload = { ...form }
      delete payload.id
      if (form.id) await supabase.from(tableName).update(payload).eq('id', form.id)
      else await supabase.from(tableName).insert([payload])
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      setOpen(false)
      load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button
          onClick={() => {
            setForm({ id: '' })
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((c) => (
                <TableHead key={c} className="capitalize">
                  {c}
                </TableHead>
              ))}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.id}>
                {cols.map((c) => (
                  <TableCell key={c}>{r[c]}</TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm(r)
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
            <DialogTitle>
              {form.id ? 'Editar' : 'Novo'} {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {cols.map((c) => (
              <div key={c} className="space-y-2">
                <Label className="capitalize">{c}</Label>
                <Input
                  value={form[c] || ''}
                  onChange={(e) => setForm({ ...form, [c]: e.target.value })}
                />
              </div>
            ))}
            <Button className="w-full" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MasterDataPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Tabelas Auxiliares</h1>
        <p className="text-muted-foreground">
          Gerenciamento de categorias, tipos e empresas parceiras.
        </p>
      </div>
      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0 mb-6">
          <TabsTrigger
            value="companies"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Empresas (Terceirizadas)
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Categorias de Serviço
          </TabsTrigger>
          <TabsTrigger
            value="types"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Tipos de Atendimento
          </TabsTrigger>
          <TabsTrigger
            value="params"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Parâmetros Globais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <GenericCrud
            tableName="companies"
            title="Empresas"
            cols={['name', 'document', 'address']}
          />
        </TabsContent>
        <TabsContent value="categories">
          <GenericCrud
            tableName="service_categories"
            title="Categorias de Serviço"
            cols={['name', 'description']}
          />
        </TabsContent>
        <TabsContent value="types">
          <GenericCrud
            tableName="service_types_config"
            title="Tipos de Atendimento"
            cols={['name', 'description']}
          />
        </TabsContent>
        <TabsContent value="params">
          <GenericCrud
            tableName="system_parameters"
            title="Parâmetros Globais"
            cols={['key', 'description']}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
