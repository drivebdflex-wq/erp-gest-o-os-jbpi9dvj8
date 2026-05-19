import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Save, Plus, Trash2, Loader2, PenTool, CheckCircle, Printer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const signatureContractedRef = useRef<HTMLCanvasElement>(null)
  const signatureDependencyRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`*, contracts(contract_number, clients(name))`)
        .eq('id', id)
        .single()

      if (error) throw error

      // Initialize items if null
      if (!data.items) data.items = []

      setOrder(data)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a OS.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setOrder((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleBudgetChange = (index: number, field: string, value: any) => {
    const newItems = [...(order.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto calculate total for row
    if (field === 'quantity' || field === 'unit_price') {
      const qty = Number(newItems[index].quantity) || 0
      const price = Number(newItems[index].unit_price) || 0
      newItems[index].total_price = qty * price
    }

    setOrder((prev: any) => {
      const updated = { ...prev, items: newItems }
      recalculateTotals(updated)
      return updated
    })
  }

  const addBudgetItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      unit: 'un',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    }
    setOrder((prev: any) => ({ ...prev, items: [...(prev.items || []), newItem] }))
  }

  const removeBudgetItem = (index: number) => {
    const newItems = order.items.filter((_: any, i: number) => i !== index)
    setOrder((prev: any) => {
      const updated = { ...prev, items: newItems }
      recalculateTotals(updated)
      return updated
    })
  }

  const recalculateTotals = (currentOrder: any) => {
    const materialsCost = (currentOrder.items || []).reduce(
      (acc: number, it: any) => acc + (Number(it.total_price) || 0),
      0,
    )
    const travel = Number(currentOrder.travel_cost) || 0
    const labor = Number(currentOrder.labor_cost) || 0

    currentOrder.material_cost = materialsCost
    currentOrder.total_cost = materialsCost + travel + labor
  }

  const handleCostChange = (field: string, value: string) => {
    const numValue = Number(value) || 0
    setOrder((prev: any) => {
      const updated = { ...prev, [field]: numValue }
      recalculateTotals(updated)
      return updated
    })
  }

  const saveOrder = async () => {
    setSaving(true)
    try {
      // Capture signatures if they exist and are drawn
      const scCanvas = signatureContractedRef.current
      if (scCanvas && !isCanvasBlank(scCanvas)) {
        order.signature_contracted = scCanvas.toDataURL()
      }
      const sdCanvas = signatureDependencyRef.current
      if (sdCanvas && !isCanvasBlank(sdCanvas)) {
        order.signature_dependency = sdCanvas.toDataURL()
      }

      const { contracts, ...updateData } = order

      const { error } = await supabase.from('service_orders').update(updateData).eq('id', id)

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Ordem de Serviço salva com sucesso!' })
      window.dispatchEvent(new Event('service-order-updated'))
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Canvas Helpers
  const setupCanvas = (ref: React.RefObject<HTMLCanvasElement>) => {
    let isDrawing = false
    const start = (e: any) => {
      isDrawing = true
      draw(e)
    }
    const stop = () => {
      isDrawing = false
      ref.current?.getContext('2d')?.beginPath()
    }
    const draw = (e: any) => {
      if (!isDrawing || !ref.current) return
      const ctx = ref.current.getContext('2d')
      if (!ctx) return
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
    return { start, stop, draw }
  }

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')
    if (!context) return true
    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer,
    )
    return !pixelBuffer.some((color) => color !== 0)
  }

  const clearCanvas = (field: string, ref: React.RefObject<HTMLCanvasElement>) => {
    handleChange(field, null)
    if (ref.current) {
      const ctx = ref.current.getContext('2d')
      ctx?.clearRect(0, 0, ref.current.width, ref.current.height)
    }
  }

  const contractDraw = setupCanvas(signatureContractedRef)
  const dependencyDraw = setupCanvas(signatureDependencyRef)

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-muted-foreground">Ordem de Serviço não encontrada.</div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              OS {order.order_number || order.id.split('-')[0].toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {order.contracts?.contract_number
                ? `Contrato: ${order.contracts.contract_number} - ${order.contracts.clients?.name}`
                : 'Sem Contrato Vinculado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={saveOrder} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. IDENTIFICAÇÃO */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">1</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Identificação
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2">
              <Label>Número OS</Label>
              <Input
                value={order.order_number || ''}
                onChange={(e) => handleChange('order_number', e.target.value)}
                className="font-bold bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Chamado (Ticket)</Label>
              <Input
                value={order.ticket_number || ''}
                onChange={(e) => handleChange('ticket_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Número do Bem (Ativo)</Label>
              <Input
                value={order.asset_number || ''}
                onChange={(e) => handleChange('asset_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Contrato ID</Label>
              <Input
                value={order.contracts?.contract_number || order.contract_id || 'N/A'}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </section>

        {/* 2. UNIDADE */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">2</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Unidade
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2 md:col-span-2">
              <Label>Dependência</Label>
              <Input
                value={order.dependency || ''}
                onChange={(e) => handleChange('dependency', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Prefixo</Label>
              <Input
                value={order.unit_prefix || ''}
                onChange={(e) => handleChange('unit_prefix', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Nome da Unidade</Label>
              <Input
                value={order.unit_name || ''}
                onChange={(e) => handleChange('unit_name', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-4">
              <Label>Endereço Completo</Label>
              <Input
                value={order.unit_address || ''}
                onChange={(e) => handleChange('unit_address', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Ambiente / Setor</Label>
              <Input
                value={order.environment || ''}
                onChange={(e) => handleChange('environment', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Andar</Label>
              <Input
                value={order.floor || ''}
                onChange={(e) => handleChange('floor', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Distância (KM)</Label>
              <Input
                type="number"
                value={order.distance || 0}
                onChange={(e) => handleChange('distance', Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* 3. SERVIÇO */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">3</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Serviço
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2 md:col-span-4">
              <Label>Descrição / Escopo</Label>
              <Textarea
                value={order.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Serviço</Label>
              <Select
                value={order.service_type || 'civil'}
                onValueChange={(v) => handleChange('service_type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="eletrica">Elétrica</SelectItem>
                  <SelectItem value="hidraulica">Hidráulica</SelectItem>
                  <SelectItem value="climatizacao">Climatização</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Criticidade</Label>
              <Select
                value={order.criticality || 'normal'}
                onValueChange={(v) => handleChange('criticality', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica / Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prazo (SLA)</Label>
              <Input
                type="datetime-local"
                value={order.deadline_at ? order.deadline_at.slice(0, 16) : ''}
                onChange={(e) => handleChange('deadline_at', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Garantia / Retrabalho?</Label>
              <Select
                value={order.warranty ? 'sim' : 'nao'}
                onValueChange={(v) => handleChange('warranty', v === 'sim')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sinistro?</Label>
              <Select
                value={order.incident ? 'sim' : 'nao'}
                onValueChange={(v) => handleChange('incident', v === 'sim')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* 4. SOLICITANTE */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">4</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Solicitante
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2">
              <Label>Nome do Solicitante</Label>
              <Input
                value={order.requester_name || ''}
                onChange={(e) => handleChange('requester_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Matrícula</Label>
              <Input
                value={order.requester_registration || ''}
                onChange={(e) => handleChange('requester_registration', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={order.requester_phone || ''}
                onChange={(e) => handleChange('requester_phone', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 5. EXECUÇÃO */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">5</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Execução
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2">
              <Label>Início da Execução</Label>
              <Input
                type="datetime-local"
                value={order.started_at ? order.started_at.slice(0, 16) : ''}
                onChange={(e) => handleChange('started_at', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim da Execução</Label>
              <Input
                type="datetime-local"
                value={order.finished_at ? order.finished_at.slice(0, 16) : ''}
                onChange={(e) => handleChange('finished_at', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Atual</Label>
              <Select
                value={order.status || 'pending'}
                onValueChange={(v) => handleChange('status', v)}
              >
                <SelectTrigger className="font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="in_audit">Em Auditoria</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* 6. ORÇAMENTO */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">6</Badge>
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
                Orçamento / Materiais
              </h2>
            </div>
            <Button size="sm" variant="outline" onClick={addBudgetItem}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
          </div>
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Item / Descrição</TableHead>
                  <TableHead className="w-[100px]">Unidade</TableHead>
                  <TableHead className="w-[120px]">Qtd</TableHead>
                  <TableHead className="w-[150px]">Valor Unit. (R$)</TableHead>
                  <TableHead className="w-[150px]">Total (R$)</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!order.items || order.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum item adicionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  order.items.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => handleBudgetChange(idx, 'description', e.target.value)}
                          placeholder="Descrição do material ou serviço..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unit || 'un'}
                          onChange={(e) => handleBudgetChange(idx, 'unit', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => handleBudgetChange(idx, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price || 0}
                          onChange={(e) => handleBudgetChange(idx, 'unit_price', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-medium bg-muted/30">
                        R$ {Number(item.total_price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBudgetItem(idx)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 7. FINANCEIRO */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">7</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Resumo Financeiro
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-5 rounded-lg border shadow-sm">
            <div className="space-y-2">
              <Label>Deslocamento (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={order.travel_cost || 0}
                onChange={(e) => handleCostChange('travel_cost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mão de Obra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={order.labor_cost || 0}
                onChange={(e) => handleCostChange('labor_cost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Materiais / Itens (R$)</Label>
              <Input
                type="number"
                readOnly
                value={order.material_cost || 0}
                className="bg-muted font-medium text-primary"
              />
              <p className="text-[10px] text-muted-foreground">Soma da tabela de orçamento.</p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">Valor Total (R$)</Label>
              <Input
                type="number"
                readOnly
                value={order.total_cost || 0}
                className="bg-primary text-primary-foreground font-bold text-lg h-10"
              />
            </div>
          </div>
        </section>

        {/* 8. OBSERVAÇÕES */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">8</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Observações Técnicas
            </h2>
          </div>
          <div className="bg-card p-5 rounded-lg border shadow-sm">
            <Textarea
              rows={5}
              value={order.observations || ''}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Anotações técnicas, pendências e observações gerais sobre o serviço executado..."
              className="resize-none"
            />
          </div>
        </section>

        {/* 9. ASSINATURAS */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">9</Badge>
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground/80">
              Assinaturas e Validação
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardHeader className="bg-muted/10 border-b pb-3">
                <CardTitle className="text-sm font-bold">
                  Assinatura da Contratada (Técnico)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="border bg-white rounded-md h-[120px] overflow-hidden relative touch-none">
                  {order.signature_contracted ? (
                    <img
                      src={order.signature_contracted}
                      className="w-full h-full object-contain"
                      alt="Assinatura Contratada"
                    />
                  ) : (
                    <canvas
                      ref={signatureContractedRef}
                      width={500}
                      height={120}
                      onMouseDown={contractDraw.start}
                      onMouseMove={contractDraw.draw}
                      onMouseUp={contractDraw.stop}
                      onMouseLeave={contractDraw.stop}
                      className="w-full h-full cursor-crosshair"
                    />
                  )}
                </div>
                {order.signature_contracted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCanvas('signature_contracted', signatureContractedRef)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar Assinatura
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader className="bg-muted/10 border-b pb-3">
                <CardTitle className="text-sm font-bold">
                  Assinatura da Dependência (Cliente)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="border bg-white rounded-md h-[120px] overflow-hidden relative touch-none">
                  {order.signature_dependency ? (
                    <img
                      src={order.signature_dependency}
                      className="w-full h-full object-contain"
                      alt="Assinatura Dependência"
                    />
                  ) : (
                    <canvas
                      ref={signatureDependencyRef}
                      width={500}
                      height={120}
                      onMouseDown={dependencyDraw.start}
                      onMouseMove={dependencyDraw.draw}
                      onMouseUp={dependencyDraw.stop}
                      onMouseLeave={dependencyDraw.stop}
                      className="w-full h-full cursor-crosshair"
                    />
                  )}
                </div>
                {order.signature_dependency && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCanvas('signature_dependency', signatureDependencyRef)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar Assinatura
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
