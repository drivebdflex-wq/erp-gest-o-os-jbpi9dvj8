import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2, Plus, Minus, Calculator } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
// @ts-expect-error - dynamic store import
import useAuthStore from '@/stores/useAuthStore'
import useOperationalStore from '@/stores/useOperationalStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { orders, updateOrder } = useAppStore() as any
  const user = useAuthStore((state: any) => state.user)
  const { technicians, teams } = useOperationalStore()

  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const [order, setOrder] = useState<any>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    order_number: '',
    call_code: '',
    contract_id: '',
    asset_number: '',
    requested_by: '',
    requester_registration: '',
    requester_phone: '',

    client_unit: '',
    address: '',
    floor: '',
    distance_km: 0,
    environment: '',

    description: '',
    service_type: 'Preventiva',
    criticality: 'Normal',
    is_incident: false,

    scheduled_at: '',
    started_at: '',
    finished_at: '',
    deadline_at: '',
    technician_id: '',
    team_id: '',
    status: 'pending',

    displacement_cost: 0,
    labor_cost: 0,
    material_cost: 0,
    total_cost: 0,

    notes: '',
    situation_code: 1,
    items: [] as any[],
  })

  useEffect(() => {
    if (id && orders) {
      const found = orders.find((o: any) => o.id === id)
      if (found) {
        setOrder(found)
        setFormData({
          order_number: found.order_number || found.shortId || '',
          call_code: found.call_code || '',
          contract_id: found.contractId || '',
          asset_number: found.asset_number || '',
          requested_by: found.requested_by || '',
          requester_registration: found.requester_registration || '',
          requester_phone: found.requester_phone || '',

          client_unit: found.client_unit || found.unitName || '',
          address: found.address || '',
          floor: found.floor || '',
          distance_km: found.distance_km || 0,
          environment: found.environment || '',

          description: found.description || '',
          service_type: found.service_type || found.serviceType || 'Preventiva',
          criticality: found.criticality || found.priority || 'Normal',
          is_incident: found.is_incident || false,

          scheduled_at:
            found.scheduled_at || found.scheduledAt
              ? new Date(found.scheduled_at || found.scheduledAt).toISOString().slice(0, 16)
              : '',
          started_at: found.started_at ? new Date(found.started_at).toISOString().slice(0, 16) : '',
          finished_at: found.finished_at
            ? new Date(found.finished_at).toISOString().slice(0, 16)
            : '',
          deadline_at: found.deadline_at
            ? new Date(found.deadline_at).toISOString().slice(0, 16)
            : '',
          technician_id: found.technician_id || found.technicianId || '',
          team_id: found.team_id || found.teamId || '',
          status: found.status || 'pending',

          displacement_cost: found.displacement_cost || 0,
          labor_cost: found.labor_cost || 0,
          material_cost: found.material_cost || 0,
          total_cost: found.total_cost || found.serviceValue || 0,

          notes: found.notes || found.observations || '',
          situation_code: found.situation_code || 1,
          items: found.items || [],
        })
      }
    }
  }, [id, orders])

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0,
    )
    const total = Number(formData.displacement_cost) + Number(formData.labor_cost) + itemsTotal
    setFormData((prev) => ({
      ...prev,
      material_cost: itemsTotal,
      total_cost: total,
    }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price =
        Number(newItems[index].quantity) * Number(newItems[index].unit_price)
    }
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          description: '',
          unit: 'UN',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    }))
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await updateOrder(id, {
        ...formData,
        serviceValue: formData.total_cost,
        observations: formData.notes,
        scheduledAt: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      })
      toast({ title: 'Sucesso', description: 'Ordem de Serviço atualizada com sucesso.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/service-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir OS')

      useAppStore.setState((state: any) => ({
        orders: state.orders.filter((o: any) => o.id !== id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.id !== id),
      }))

      toast({ title: 'Sucesso', description: 'Ordem de Serviço excluída.' })
      navigate('/ordens')
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  if (!order)
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando Ordem de Serviço...</div>
    )

  return (
    <div className="space-y-6 h-full flex flex-col pb-10 max-w-5xl mx-auto animate-fade-in pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/ordens')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              OS {formData.order_number}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Detalhes da Ordem de Serviço
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
              className="flex-1 md:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none">
            <Save className="w-4 h-4 mr-2" /> Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full border rounded-lg bg-card shadow-sm">
        <div className="border-b px-4 py-2 bg-muted/20 overflow-x-auto">
          <TabsList className="flex md:grid md:grid-cols-6 h-auto p-1 min-w-[600px]">
            <TabsTrigger value="geral" className="py-2">
              Geral
            </TabsTrigger>
            <TabsTrigger value="local" className="py-2">
              Local
            </TabsTrigger>
            <TabsTrigger value="servico" className="py-2">
              Serviço
            </TabsTrigger>
            <TabsTrigger value="execucao" className="py-2">
              Execução
            </TabsTrigger>
            <TabsTrigger value="orcamento" className="py-2">
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="py-2">
              Observações
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 md:p-6">
          <TabsContent value="geral" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-none border-dashed border-muted-foreground/30 bg-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Identificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número OS</Label>
                      <Input
                        value={formData.order_number}
                        onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código do Chamado</Label>
                      <Input
                        value={formData.call_code}
                        onChange={(e) => setFormData({ ...formData, call_code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID do Contrato</Label>
                      <Input
                        value={formData.contract_id}
                        onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nº do Ativo</Label>
                      <Input
                        value={formData.asset_number}
                        onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-dashed border-muted-foreground/30 bg-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Solicitante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Solicitante</Label>
                    <Input
                      value={formData.requested_by}
                      onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Matrícula</Label>
                      <Input
                        value={formData.requester_registration}
                        onChange={(e) =>
                          setFormData({ ...formData, requester_registration: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.requester_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, requester_phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidade do Cliente (Agência/Loja)</Label>
                <Input
                  value={formData.client_unit}
                  onChange={(e) => setFormData({ ...formData, client_unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ambiente (Setor/Sala)</Label>
                <Input
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço Completo</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Andar/Pavimento</Label>
                <Input
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Distância Base (km)</Label>
                <Input
                  type="number"
                  value={formData.distance_km}
                  onChange={(e) =>
                    setFormData({ ...formData, distance_km: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="servico" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(v) => setFormData({ ...formData, service_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                    <SelectItem value="Instalação">Instalação</SelectItem>
                    <SelectItem value="Inspeção">Inspeção</SelectItem>
                    <SelectItem value="Preditiva">Preditiva</SelectItem>

                    {/* Retrocompatibility */}
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="eletrica">Elétrica</SelectItem>
                    <SelectItem value="hidraulica">Hidráulica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Criticidade</Label>
                <Select
                  value={formData.criticality}
                  onValueChange={(v) => setFormData({ ...formData, criticality: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>

                    {/* Retrocompatibility */}
                    <SelectItem value="low">Baixa (Old)</SelectItem>
                    <SelectItem value="medium">Média (Old)</SelectItem>
                    <SelectItem value="high">Alta (Old)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col justify-center pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_incident"
                    checked={formData.is_incident}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_incident: checked })
                    }
                  />
                  <Label htmlFor="is_incident" className="font-medium cursor-pointer">
                    Reportado como Incidente?
                  </Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Descrição do Escopo / Problema</Label>
                <Textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva detalhadamente o serviço a ser realizado..."
                  className="resize-y"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="execucao" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-none border-dashed border-muted-foreground/30 bg-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Atribuição & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status Atual</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="scheduled">Agendada</SelectItem>
                        <SelectItem value="deslocamento">Em Deslocamento</SelectItem>
                        <SelectItem value="in_progress">Em Execução</SelectItem>
                        <SelectItem value="paused">Pausada</SelectItem>
                        <SelectItem value="in_audit">Em Auditoria</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Técnico Responsável</Label>
                    <Select
                      value={formData.technician_id || 'none'}
                      onValueChange={(v) =>
                        setFormData({ ...formData, technician_id: v === 'none' ? '' : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem técnico atribuído" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhum Técnico --</SelectItem>
                        {technicians.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Equipe Responsável</Label>
                    <Select
                      value={formData.team_id || 'none'}
                      onValueChange={(v) =>
                        setFormData({ ...formData, team_id: v === 'none' ? '' : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem equipe atribuída" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Nenhuma Equipe --</SelectItem>
                        {teams.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-dashed border-muted-foreground/30 bg-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Cronograma (Timestamps)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data/Hora Agendada</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo Limite (SLA)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.deadline_at}
                      onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Início Real</Label>
                      <Input
                        type="datetime-local"
                        value={formData.started_at}
                        onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim Real</Label>
                      <Input
                        type="datetime-local"
                        value={formData.finished_at}
                        onChange={(e) => setFormData({ ...formData, finished_at: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="space-y-6 m-0">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h3 className="text-lg font-medium">Itens e Materiais</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={calculateTotals}>
                  <Calculator className="w-4 h-4 mr-2" /> Recalcular Totais
                </Button>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Item
                </Button>
              </div>
            </div>

            <div className="border rounded-md overflow-x-auto bg-background">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[40%]">Descrição do Item</TableHead>
                    <TableHead>Unid.</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço Unit. (R$)</TableHead>
                    <TableHead>Total (R$)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        Nenhum item adicionado ao orçamento desta OS.
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Ex: Fio de cobre 2.5mm"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-16 h-9 text-center"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-20 h-9"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            className="w-28 h-9"
                          />
                        </TableCell>
                        <TableCell className="p-2 font-medium whitespace-nowrap">
                          R$ {Number(item.total_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="p-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveItem(idx)
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
              <div className="space-y-2">
                <Label>Deslocamento (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.displacement_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, displacement_cost: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mão de Obra (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Materiais (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.material_cost}
                  readOnly
                  className="bg-muted font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary">Custo Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  readOnly
                  className="font-bold text-lg bg-primary/5 border-primary/30 text-primary"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="observacoes" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Observações Gerais</Label>
                <Textarea
                  rows={8}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações internas, histórico de contato com o cliente, pendências, etc..."
                  className="resize-y"
                />
              </div>
              <Card className="shadow-none border-dashed border-muted-foreground/30 bg-transparent h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Código de Situação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecione a Situação Técnica</Label>
                    <Select
                      value={String(formData.situation_code)}
                      onValueChange={(v) => setFormData({ ...formData, situation_code: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Recebida / Triagem</SelectItem>
                        <SelectItem value="2">2 - Aguardando Peças</SelectItem>
                        <SelectItem value="3">3 - Aguardando Cliente</SelectItem>
                        <SelectItem value="4">4 - Em Intervenção Técnica</SelectItem>
                        <SelectItem value="5">5 - Em Testes / Qualidade</SelectItem>
                        <SelectItem value="6">6 - Finalizada Com Sucesso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O código de situação reflete a escala técnica padrão de atendimento em campo e
                    oficina, ajudando na categorização e relatórios de progresso.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta Ordem de Serviço? Esta ação não pode ser desfeita
              e fará uma exclusão lógica no sistema (Soft delete).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
