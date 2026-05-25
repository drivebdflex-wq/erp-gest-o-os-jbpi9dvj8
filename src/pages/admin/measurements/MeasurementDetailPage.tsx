import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Edit, Paperclip, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_conferencia: 'bg-yellow-100 text-yellow-800',
  enviada: 'bg-purple-100 text-purple-800',
  aprovada: 'bg-green-100 text-green-800',
  faturada: 'bg-emerald-100 text-emerald-800',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_conferencia: 'Em Conferência',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  faturada: 'Faturada',
}

export default function MeasurementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [measurement, setMeasurement] = useState<any>(null)
  const [serviceOrders, setServiceOrders] = useState<any[]>([])
  const [availableOS, setAvailableOS] = useState<any[]>([])
  const [selectedOS, setSelectedOS] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchMeasurement()
      fetchLinkedOS()
      fetchAttachments()
    }
  }, [id])

  async function fetchAttachments() {
    const { data } = await supabase
      .from('measurement_attachments')
      .select('*')
      .eq('measurement_id', id)
      .order('created_at', { ascending: false })
    if (data) setAttachments(data)
  }

  async function fetchMeasurement() {
    const { data, error } = await supabase
      .from('measurements')
      .select(`
        *,
        contracts (
          contract_number,
          clients (name)
        )
      `)
      .eq('id', id)
      .single()

    if (!error && data) {
      setMeasurement(data)
    }
  }

  async function fetchLinkedOS() {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('measurement_id', id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setServiceOrders(data)
    }
    setLoading(false)
  }

  async function fetchAvailableOS() {
    if (!measurement) return
    
    // Filter pending OS within the measurement period
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('contract_id', measurement.contract_id)
      .is('measurement_id', null)
      .gte('created_at', measurement.start_date)
      .lte('created_at', measurement.end_date)

    if (!error && data) {
      setAvailableOS(data)
    }
  }

  async function handleUpdateMeasurement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string
    
    if (new Date(start_date) > new Date(end_date)) {
      toast({ title: 'Erro de Validação', description: 'A data inicial não pode ser maior que a data final', variant: 'destructive' })
      return
    }

    const payload = {
      number: formData.get('number') as string,
      start_date,
      end_date,
    }

    const { error } = await supabase.from('measurements').update(payload).eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Medição atualizada com sucesso' })
      setIsEditDialogOpen(false)
      fetchMeasurement()
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Fake upload for demonstration
    const fakeUrl = `https://img.usecurling.com/p/800/600?q=document&seed=${Math.random()}`
    
    const { error } = await supabase.from('measurement_attachments').insert({
      measurement_id: id,
      file_name: file.name,
      storage_url: fakeUrl
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Anexo adicionado' })
      fetchAttachments()
    }
    
    e.target.value = ''
  }

  async function handleDeleteAttachment(attachmentId: string) {
    const { error } = await supabase.from('measurement_attachments').delete().eq('id', attachmentId)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Anexo removido' })
      fetchAttachments()
    }
  }

  async function handleLinkOS() {
    if (selectedOS.length === 0) return

    const { error } = await supabase
      .from('service_orders')
      .update({ measurement_id: id })
      .in('id', selectedOS)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'OS vinculadas com sucesso' })
      setIsDialogOpen(false)
      setSelectedOS([])
      fetchLinkedOS()
      updateTotals()
    }
  }

  async function handleUnlinkOS(osId: string) {
    const { error } = await supabase
      .from('service_orders')
      .update({ measurement_id: null })
      .eq('id', osId)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'OS desvinculada com sucesso' })
      fetchLinkedOS()
      updateTotals()
    }
  }

  async function updateTotals() {
    const { data } = await supabase
      .from('service_orders')
      .select('travel_cost, labor_cost, material_cost')
      .eq('measurement_id', id)

    if (data) {
      const totals = data.reduce(
        (acc, curr) => {
          const travel = Number(curr.travel_cost) || 0
          const labor = Number(curr.labor_cost) || 0
          const material = Number(curr.material_cost) || 0
          return {
            travel_total: acc.travel_total + travel,
            labor_total: acc.labor_total + labor,
            material_total: acc.material_total + material,
            total_value: acc.total_value + travel + labor + material,
          }
        },
        { travel_total: 0, labor_total: 0, material_total: 0, total_value: 0 },
      )

      await supabase.from('measurements').update(totals).eq('id', id)

      fetchMeasurement()
    }
  }

  async function handleStatusChange(newStatus: string) {
    const { error } = await supabase.from('measurements').update({ status: newStatus }).eq('id', id)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso' })
      fetchMeasurement()
    }
  }

  if (loading || !measurement) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/medicoes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medição {measurement.number}</h1>
          <p className="text-muted-foreground">
            {measurement.contracts?.contract_number} - {measurement.contracts?.clients?.name}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Medição</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateMeasurement} className="space-y-4">
                <div className="space-y-2">
                  <Label>Número da Medição</Label>
                  <Input name="number" required defaultValue={measurement.number} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input type="date" name="start_date" required defaultValue={measurement.start_date} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input type="date" name="end_date" required defaultValue={measurement.end_date} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Select value={measurement.status} onValueChange={handleStatusChange}>
            <SelectTrigger
              className={`w-[180px] font-medium ${statusColors[measurement.status] || ''}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detalhes e OS</TabsTrigger>
          <TabsTrigger value="attachments">Anexos ({attachments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="col-span-1 md:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ordens de Serviço Vinculadas</CardTitle>
                <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (open) fetchAvailableOS()
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar OS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Vincular OS à Medição</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableOS.map((os) => (
                        <TableRow key={os.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOS.includes(os.id)}
                              onCheckedChange={(checked) => {
                                setSelectedOS((prev) =>
                                  checked ? [...prev, os.id] : prev.filter((i) => i !== os.id),
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {os.service_order_number || os.order_number || os.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {os.unit_prefix} - {os.unit_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{os.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(os.total_cost || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {availableOS.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Nenhuma OS disponível para vincular.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleLinkOS} disabled={selectedOS.length === 0}>
                    Vincular Selecionadas
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceOrders.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell>
                      <Link to={`/ordens/${os.id}`} className="text-blue-600 hover:underline">
                        {os.service_order_number || os.order_number || os.id.substring(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {os.unit_prefix} {os.unit_name}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={os.description || ''}>
                      {os.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{os.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(os.total_cost || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkOS(os.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {serviceOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma OS vinculada a esta medição.
                    </TableCell>
                  </TableRow>
                )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Totais</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Deslocamento</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  measurement.travel_total || 0,
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Materiais</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  measurement.material_total || 0,
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Mão de Obra</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  measurement.labor_total || 0,
                )}
              </span>
            </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold">Total Geral</span>
                  <span className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      measurement.total_value || 0,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attachments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Anexos da Medição</CardTitle>
              <div>
                <Label htmlFor="file-upload" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Novo Anexo
                </Label>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map(att => (
                    <TableRow key={att.id}>
                      <TableCell>
                        <a href={att.storage_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {att.file_name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {new Date(att.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAttachment(att.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {attachments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum anexo encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
