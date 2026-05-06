import React, { useRef } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Minus, Plus, Calculator, Upload, X, Download, FileText } from 'lucide-react'

export function GeneralTab({ data, set }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="shadow-none border-dashed bg-transparent col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase text-primary tracking-wider font-bold">
            Identificação & Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Número OS</Label>
            <Input
              value={data.order_number}
              onChange={(e) => set({ ...data, order_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Nº do Ticket / Chamado</Label>
            <Input
              value={data.ticket_number}
              onChange={(e) => set({ ...data, ticket_number: e.target.value })}
              placeholder="Ex: INC-12345"
            />
          </div>
          <div className="space-y-2">
            <Label>Dependência</Label>
            <Input
              value={data.dependency}
              onChange={(e) => set({ ...data, dependency: e.target.value })}
              placeholder="Ex: Matriz"
            />
          </div>
          <div className="space-y-2">
            <Label>Agência / Código</Label>
            <Input
              value={data.agency_code}
              onChange={(e) => set({ ...data, agency_code: e.target.value })}
              placeholder="Ex: AG-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Unidade / Local</Label>
            <Input
              value={data.client_unit}
              onChange={(e) => set({ ...data, client_unit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input
              value={data.client_id}
              onChange={(e) => set({ ...data, client_id: e.target.value })}
              placeholder="Nome do Cliente"
            />
          </div>
          <div className="space-y-2">
            <Label>Contrato</Label>
            <Input
              value={data.contract_id}
              onChange={(e) => set({ ...data, contract_id: e.target.value })}
              placeholder="ID do Contrato"
            />
          </div>
          <div className="space-y-2">
            <Label>Nº do Ativo</Label>
            <Input
              value={data.asset_number}
              onChange={(e) => set({ ...data, asset_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Setor</Label>
            <Input
              value={data.sector || ''}
              onChange={(e) => set({ ...data, sector: e.target.value })}
              placeholder="Ex: Térreo, Sala 2"
            />
          </div>
          <div className="space-y-2">
            <Label>Ponto de Referência</Label>
            <Input
              value={data.reference_point || ''}
              onChange={(e) => set({ ...data, reference_point: e.target.value })}
              placeholder="Ex: Próximo à recepção"
            />
          </div>
          <div className="space-y-2">
            <Label>Andar</Label>
            <Input
              value={data.floor || ''}
              onChange={(e) => set({ ...data, floor: e.target.value })}
              placeholder="Ex: 2º Andar"
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <Input
              value={data.address || ''}
              onChange={(e) => set({ ...data, address: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-transparent col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase text-primary tracking-wider font-bold">
            Classificação & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Tipo da OS</Label>
            <Input
              value={data.os_type}
              onChange={(e) => set({ ...data, os_type: e.target.value })}
              placeholder="Ex: Manutenção Predial"
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={data.service_type}
              onValueChange={(v) => set({ ...data, service_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eletrica">Elétrica</SelectItem>
                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                <SelectItem value="civil">Civil</SelectItem>
                <SelectItem value="climatizacao">Climatização</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="corretiva">Corretiva</SelectItem>
                <SelectItem value="pintura">Pintura</SelectItem>
                <SelectItem value="estrutural">Estrutural</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="limpeza_tecnica">Limpeza Técnica</SelectItem>
                <SelectItem value="vistoria">Vistoria</SelectItem>
                <SelectItem value="emergencial">Emergencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Criticidade</Label>
            <Select
              value={data.criticality || 'baixa'}
              onValueChange={(v) => set({ ...data, criticality: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={data.priority} onValueChange={(v) => set({ ...data, priority: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status Operacional</Label>
            <Select value={data.status} onValueChange={(v) => set({ ...data, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="in_audit">Em Auditoria</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status SLA</Label>
            <Select
              value={data.sla_status || 'within_sla'}
              onValueChange={(v) => set({ ...data, sla_status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="within_sla">No Prazo (SLA OK)</SelectItem>
                <SelectItem value="warning">Próximo ao Vencimento</SelectItem>
                <SelectItem value="breached">Atrasado (SLA Violado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Garantia?</Label>
            <Select
              value={data.warranty ? 'sim' : 'nao'}
              onValueChange={(v) => set({ ...data, warranty: v === 'sim' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Solicitante</Label>
            <Input
              value={data.requested_by}
              onChange={(e) => set({ ...data, requested_by: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-transparent col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase text-primary tracking-wider font-bold">
            Prazos e Datas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Data de Abertura</Label>
            <Input
              type="datetime-local"
              value={data.opening_date}
              onChange={(e) => set({ ...data, opening_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data de Aceite</Label>
            <Input
              type="datetime-local"
              value={data.acceptance_date}
              onChange={(e) => set({ ...data, acceptance_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>SLA / Prazo Limite</Label>
            <Input
              type="datetime-local"
              value={data.deadline_at}
              onChange={(e) => set({ ...data, deadline_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data de Conclusão (Real)</Label>
            <Input
              type="datetime-local"
              value={data.finished_at}
              onChange={(e) => set({ ...data, finished_at: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ServiceTab({ data, set }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-semibold text-primary">Descrição Detalhada do Problema</Label>
          <Textarea
            rows={4}
            value={data.description}
            onChange={(e) => set({ ...data, description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Solicitação do Cliente / Relato Inicial</Label>
          <Textarea
            rows={3}
            value={data.client_request}
            onChange={(e) => set({ ...data, client_request: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Diagnóstico Técnico</Label>
          <Textarea
            rows={3}
            value={data.diagnostics}
            onChange={(e) => set({ ...data, diagnostics: e.target.value })}
            placeholder="Parecer do técnico após análise no local..."
          />
        </div>
        <div className="space-y-2">
          <Label>Causa Raiz</Label>
          <Textarea
            rows={2}
            value={data.root_cause || ''}
            onChange={(e) => set({ ...data, root_cause: e.target.value })}
            placeholder="Qual foi a causa identificada?"
          />
        </div>
        <div className="space-y-2">
          <Label>Solução Aplicada (Procedimentos Executados)</Label>
          <Textarea
            rows={4}
            value={data.procedures_executed}
            onChange={(e) => set({ ...data, procedures_executed: e.target.value })}
            placeholder="Passo a passo do que foi feito..."
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Pendências (se houver)</Label>
          <Textarea
            rows={3}
            value={data.pending_issues}
            onChange={(e) => set({ ...data, pending_issues: e.target.value })}
            placeholder="Falta material, aguardando aprovação..."
          />
        </div>
        <div className="space-y-2">
          <Label>Riscos Encontrados (SSMA)</Label>
          <Textarea
            rows={2}
            value={data.risks_found}
            onChange={(e) => set({ ...data, risks_found: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Observações Gerais</Label>
          <Textarea
            rows={3}
            value={data.general_observations}
            onChange={(e) => set({ ...data, general_observations: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Recomendações Técnicas</Label>
          <Textarea
            rows={2}
            value={data.technical_recommendations}
            onChange={(e) => set({ ...data, technical_recommendations: e.target.value })}
            placeholder="Ex: Sugerido troca do equipamento em 6 meses."
          />
        </div>
        <div className="space-y-2">
          <Label>Checklist Operacional Realizado</Label>
          <Textarea
            rows={2}
            value={data.operational_checklist}
            onChange={(e) => set({ ...data, operational_checklist: e.target.value })}
            placeholder="1. Isolar área... 2. Desligar disjuntor..."
          />
        </div>
      </div>
    </div>
  )
}

export function ExecutionTab({ data, set, technicians, teams }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary font-bold">Equipe Alocada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Técnico Responsável Principal</Label>
            <Select
              value={data.technician_id || 'none'}
              onValueChange={(v) => set({ ...data, technician_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Nenhum Técnico --</SelectItem>
                {technicians?.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Equipe Envolvida</Label>
            <Select
              value={data.team_id || 'none'}
              onValueChange={(v) => set({ ...data, team_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Nenhuma Equipe --</SelectItem>
                {teams?.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Supervisor / Coordenador</Label>
            <Select
              value={data.supervisor_id || 'none'}
              onValueChange={(v) => set({ ...data, supervisor_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Nenhum --</SelectItem>
                <SelectItem value="sup1">Carlos Silva (Supervisor)</SelectItem>
                <SelectItem value="sup2">Maria Fernanda (Coordenadora)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Veículo Utilizado</Label>
              <Input
                value={data.vehicle_used}
                onChange={(e) => set({ ...data, vehicle_used: e.target.value })}
                placeholder="Placa ou Frota"
              />
            </div>
            <div className="space-y-2">
              <Label>Ferramentas / EPIs</Label>
              <Input
                value={data.tools_used}
                onChange={(e) => set({ ...data, tools_used: e.target.value })}
                placeholder="Ex: Escada 2m, Furadeira"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary font-bold">
            Timeline Operacional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Previsão de Início (Agendado)</Label>
              <Input
                type="datetime-local"
                value={data.scheduled_at}
                onChange={(e) => set({ ...data, scheduled_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Início Real (Check-in)</Label>
              <Input
                type="datetime-local"
                value={data.started_at}
                onChange={(e) => set({ ...data, started_at: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pausado em</Label>
              <Input type="datetime-local" placeholder="Ex: Pausa para almoço" />
            </div>
            <div className="space-y-2">
              <Label>Fim Real (Check-out)</Label>
              <Input
                type="datetime-local"
                value={data.finished_at}
                onChange={(e) => set({ ...data, finished_at: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Tempo Desloc. (min)</Label>
              <Input
                type="number"
                value={data.displacement_time}
                onChange={(e) => set({ ...data, displacement_time: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Execução (min)</Label>
              <Input
                type="number"
                value={data.execution_duration}
                onChange={(e) => set({ ...data, execution_duration: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>KM Rodado</Label>
              <Input
                type="number"
                step="0.1"
                value={data.km_driven || 0}
                onChange={(e) => set({ ...data, km_driven: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BudgetTab({
  data,
  set,
  calculateTotals,
  handleAddItem,
  handleRemoveItem,
  handleItemChange,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-primary tracking-tight">
          Lista de Materiais e Serviços
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={calculateTotals}>
            <Calculator className="w-4 h-4 mr-2" /> Recalcular Totais
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar Item
          </Button>
        </div>
      </div>
      <div className="border rounded-md overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="w-[45%] font-semibold">Descrição do Material/Serviço</TableHead>
              <TableHead className="font-semibold">Unid.</TableHead>
              <TableHead className="font-semibold">Quantidade</TableHead>
              <TableHead className="font-semibold">Valor Unit. (R$)</TableHead>
              <TableHead className="font-semibold">Total (R$)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items?.map((item: any, idx: number) => (
              <TableRow key={item.id || idx}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Nome do item..."
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    className="w-16 text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                    className="w-28"
                  />
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">
                  R$ {Number(item.total_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(idx)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!data.items?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Nenhum item lançado no orçamento. Adicione materiais ou mão de obra extra acima.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-6 border-t mt-6">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase font-bold">Deslocamento</Label>
          <Input
            type="number"
            value={data.displacement_cost}
            onChange={(e) => set({ ...data, displacement_cost: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase font-bold">Mão de Obra</Label>
          <Input
            type="number"
            value={data.labor_cost}
            onChange={(e) => set({ ...data, labor_cost: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase font-bold">
            Materiais (Subtotal)
          </Label>
          <Input
            type="number"
            value={data.material_cost}
            readOnly
            className="bg-muted font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-warning uppercase font-bold">Desconto Aplicado</Label>
          <Input
            type="number"
            value={data.discount}
            onChange={(e) => set({ ...data, discount: Number(e.target.value) })}
            className="border-warning/50 focus-visible:ring-warning"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs text-primary uppercase font-bold text-right block">
            Valor Final da OS
          </Label>
          <Input
            type="number"
            value={data.total_cost}
            readOnly
            className="bg-primary text-primary-foreground font-bold text-lg h-12 text-right"
          />
        </div>
      </div>
    </div>
  )
}

export function EvidenceTab({ data, set, attachments, setAttachments, onUpload, onRemove }: any) {
  const techCanvas = useRef<HTMLCanvasElement>(null)
  const clientCanvas = useRef<HTMLCanvasElement>(null)
  const supervisorCanvas = useRef<HTMLCanvasElement>(null)

  const setupCanvas = (ref: any, field: string) => {
    let isDrawing = false
    const ctx = ref.current?.getContext('2d')
    const start = (e: any) => {
      isDrawing = true
      ctx?.beginPath()
      ctx?.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
    const draw = (e: any) => {
      if (isDrawing && ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        ctx.stroke()
      }
    }
    const stop = () => {
      if (isDrawing) {
        isDrawing = false
        set({ ...data, [field]: ref.current?.toDataURL() })
      }
    }
    const touchStart = (e: any) => {
      const b = ref.current?.getBoundingClientRect()
      if (b && e.touches[0]) {
        ctx?.beginPath()
        ctx?.moveTo(e.touches[0].clientX - b.left, e.touches[0].clientY - b.top)
        isDrawing = true
      }
    }
    const touchMove = (e: any) => {
      if (!isDrawing) return
      const b = ref.current?.getBoundingClientRect()
      if (b && e.touches[0]) {
        ctx?.lineTo(e.touches[0].clientX - b.left, e.touches[0].clientY - b.top)
        ctx?.stroke()
      }
    }
    return { start, draw, stop, touchStart, touchMove }
  }

  const tDraw = setupCanvas(techCanvas, 'technician_signature_url')
  const cDraw = setupCanvas(clientCanvas, 'client_signature_url')
  const sDraw = setupCanvas(supervisorCanvas, 'supervisor_signature_url')

  const renderGallery = (type: string, title: string) => {
    const filtered = attachments?.filter((a: any) => a.type === type) || []
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <div className="relative">
            <Input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => onUpload(e, type)}
            />
            <Button variant="secondary" size="sm" className="h-8 text-xs">
              <Upload className="w-3 h-3 mr-2" /> Upload
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((a: any) => (
            <div
              key={a.id}
              className="border rounded bg-secondary/5 aspect-square relative group overflow-hidden flex items-center justify-center"
            >
              {a.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={a.url} alt={a.fileName} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-8 h-8 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => window.open(a.url)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => onRemove(a.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[10px] truncate px-1 py-0.5 text-center">
                {a.fileName}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-6 text-center text-muted-foreground text-xs bg-muted/20 rounded border border-dashed">
              Nenhuma foto adicionada.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderGallery('before', 'Fotos ANTES (Condição Inicial)')}
        {renderGallery('during', 'Fotos DURANTE (Execução)')}
        {renderGallery('after', 'Fotos DEPOIS (Finalizado)')}
      </div>

      {renderGallery('general', 'Documentos Gerais / Anexos Adicionais')}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm border-b pb-2">Assinatura do Técnico Responsável</h4>
          <div className="border bg-white rounded-md h-[180px] overflow-hidden relative touch-none shadow-inner">
            {data.technician_signature_url ? (
              <img
                src={data.technician_signature_url}
                className="w-full h-full object-contain"
                alt="Signature Tech"
              />
            ) : (
              <canvas
                ref={techCanvas}
                width={500}
                height={180}
                onMouseDown={tDraw.start}
                onMouseMove={tDraw.draw}
                onMouseUp={tDraw.stop}
                onMouseLeave={tDraw.stop}
                onTouchStart={tDraw.touchStart}
                onTouchMove={tDraw.touchMove}
                onTouchEnd={tDraw.stop}
                className="w-full h-full cursor-crosshair"
              />
            )}
          </div>
          {data.technician_signature_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => set({ ...data, technician_signature_url: '' })}
              className="w-full"
            >
              Limpar Assinatura Técnico
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm border-b pb-2">Assinatura do Cliente / Recebedor</h4>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <Input
              placeholder="Nome completo do cliente"
              value={data.client_signature_name}
              onChange={(e) => set({ ...data, client_signature_name: e.target.value })}
            />
            <Input
              placeholder="Cargo / Setor"
              value={data.client_signature_position}
              onChange={(e) => set({ ...data, client_signature_position: e.target.value })}
            />
          </div>
          <div className="border bg-white rounded-md h-[180px] overflow-hidden relative touch-none shadow-inner">
            {data.client_signature_url ? (
              <img
                src={data.client_signature_url}
                className="w-full h-full object-contain"
                alt="Signature Client"
              />
            ) : (
              <canvas
                ref={clientCanvas}
                width={500}
                height={180}
                onMouseDown={cDraw.start}
                onMouseMove={cDraw.draw}
                onMouseUp={cDraw.stop}
                onMouseLeave={cDraw.stop}
                onTouchStart={cDraw.touchStart}
                onTouchMove={cDraw.touchMove}
                onTouchEnd={cDraw.stop}
                className="w-full h-full cursor-crosshair"
              />
            )}
          </div>
          {data.client_signature_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => set({ ...data, client_signature_url: '' })}
              className="w-full"
            >
              Limpar Assinatura Cliente
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm border-b pb-2">Assinatura do Supervisor</h4>
          <div className="border bg-white rounded-md h-[180px] overflow-hidden relative touch-none shadow-inner">
            {data.supervisor_signature_url ? (
              <img
                src={data.supervisor_signature_url}
                className="w-full h-full object-contain"
                alt="Signature Supervisor"
              />
            ) : (
              <canvas
                ref={supervisorCanvas}
                width={500}
                height={180}
                onMouseDown={sDraw.start}
                onMouseMove={sDraw.draw}
                onMouseUp={sDraw.stop}
                onMouseLeave={sDraw.stop}
                onTouchStart={sDraw.touchStart}
                onTouchMove={sDraw.touchMove}
                onTouchEnd={sDraw.stop}
                className="w-full h-full cursor-crosshair"
              />
            )}
          </div>
          {data.supervisor_signature_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => set({ ...data, supervisor_signature_url: '' })}
              className="w-full"
            >
              Limpar Assinatura Supervisor
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminTab({ data, set }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary font-bold">
            Faturamento & Controle Interno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Centro de Custo</Label>
            <Input
              value={data.cost_center}
              onChange={(e) => set({ ...data, cost_center: e.target.value })}
              placeholder="Ex: CC-Manutenção-Matriz"
            />
          </div>
          <div className="space-y-2">
            <Label>Código Interno ERP</Label>
            <Input
              value={data.internal_code}
              onChange={(e) => set({ ...data, internal_code: e.target.value })}
              placeholder="Ex: ERP-8992"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Faturamento</Label>
            <Select
              value={data.billing_type || 'mensal'}
              onValueChange={(v) => set({ ...data, billing_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Contrato Mensal (Incluso)</SelectItem>
                <SelectItem value="avulso">Faturamento Avulso / Extra</SelectItem>
                <SelectItem value="reembolso">Reembolso de Despesas</SelectItem>
                <SelectItem value="garantia">Garantia (Sem Custo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status de Faturamento da OS</Label>
            <Select
              value={data.billing_status || 'pending'}
              onValueChange={(v) => set({ ...data, billing_status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente de Faturamento</SelectItem>
                <SelectItem value="invoiced">Faturado / NF Emitida</SelectItem>
                <SelectItem value="paid">Pago pelo Cliente</SelectItem>
                <SelectItem value="cancelled">Faturamento Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary font-bold">
            Aprovações & Observações Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer text-sm font-medium">
                Aprovação do Supervisor Operacional
              </Label>
              <Select
                value={data.supervisor_approval ? 'sim' : 'nao'}
                onValueChange={(v) => set({ ...data, supervisor_approval: v === 'sim' })}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer text-sm font-medium">
                Aprovação do Cliente (Aceite Formal)
              </Label>
              <Select
                value={data.client_approval ? 'sim' : 'nao'}
                onValueChange={(v) => set({ ...data, client_approval: v === 'sim' })}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Label className="cursor-pointer text-sm font-bold text-primary">
                OS Marcada como "Faturada"
              </Label>
              <Select
                value={data.is_billed ? 'sim' : 'nao'}
                onValueChange={(v) => set({ ...data, is_billed: v === 'sim' })}
              >
                <SelectTrigger className="w-[100px] h-8 border-primary text-primary font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Administrativas Internas</Label>
            <Textarea
              rows={5}
              value={data.notes}
              onChange={(e) => set({ ...data, notes: e.target.value })}
              placeholder="Anotações apenas para o time do backoffice..."
              className="bg-warning/5 border-warning/20 focus-visible:ring-warning"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
