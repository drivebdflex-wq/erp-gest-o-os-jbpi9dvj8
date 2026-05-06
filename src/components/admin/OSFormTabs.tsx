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
import { Minus, Plus, Calculator, Upload, X, Download } from 'lucide-react'

export function GeneralTab({ data, set }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número OS</Label>
              <Input
                value={data.order_number}
                onChange={(e) => set({ ...data, order_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Código Chamado</Label>
              <Input
                value={data.call_code}
                onChange={(e) => set({ ...data, call_code: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unidade/Agência</Label>
              <Input
                value={data.client_unit}
                onChange={(e) => set({ ...data, client_unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nº do Ativo</Label>
              <Input
                value={data.asset_number}
                onChange={(e) => set({ ...data, asset_number: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary">Status & Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
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
    </div>
  )
}

export function ServiceTab({ data, set }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria do Serviço</Label>
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
      </div>
      <div className="space-y-2">
        <Label>Descrição do Problema / Escopo</Label>
        <Textarea
          rows={4}
          value={data.description}
          onChange={(e) => set({ ...data, description: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Diagnóstico Técnico</Label>
        <Textarea
          rows={4}
          value={data.diagnostics}
          onChange={(e) => set({ ...data, diagnostics: e.target.value })}
          placeholder="Parecer do técnico após análise..."
        />
      </div>
    </div>
  )
}

export function ExecutionTab({ data, set, technicians, teams }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary">Atribuição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Técnico Responsável</Label>
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
            <Label>Equipe Responsável</Label>
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
        </CardContent>
      </Card>
      <Card className="shadow-none border-dashed bg-transparent">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-primary">Timeline Operacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agendado para</Label>
              <Input
                type="datetime-local"
                value={data.scheduled_at}
                onChange={(e) => set({ ...data, scheduled_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>SLA Limite</Label>
              <Input
                type="datetime-local"
                value={data.deadline_at}
                onChange={(e) => set({ ...data, deadline_at: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início (Check-in)</Label>
              <Input
                type="datetime-local"
                value={data.started_at}
                onChange={(e) => set({ ...data, started_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim (Check-out)</Label>
              <Input
                type="datetime-local"
                value={data.finished_at}
                onChange={(e) => set({ ...data, finished_at: e.target.value })}
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
        <h3 className="font-medium">Materiais e Mão de Obra</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={calculateTotals}>
            <Calculator className="w-4 h-4 mr-2" /> Recalcular
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Descrição</TableHead>
              <TableHead>Unid.</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Preço (R$)</TableHead>
              <TableHead>Total (R$)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items?.map((item: any, idx: number) => (
              <TableRow key={item.id || idx}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
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
                    className="w-24"
                  />
                </TableCell>
                <TableCell>R$ {Number(item.total_price).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)}>
                    <Minus className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!data.items?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum item adicionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-4 gap-4 pt-4">
        <div className="space-y-2">
          <Label>Deslocamento</Label>
          <Input
            type="number"
            value={data.displacement_cost}
            onChange={(e) => set({ ...data, displacement_cost: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Mão de Obra</Label>
          <Input
            type="number"
            value={data.labor_cost}
            onChange={(e) => set({ ...data, labor_cost: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Materiais (Auto)</Label>
          <Input type="number" value={data.material_cost} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label className="text-primary font-bold">Total Final</Label>
          <Input
            type="number"
            value={data.total_cost}
            readOnly
            className="bg-primary/10 text-primary font-bold"
          />
        </div>
      </div>
    </div>
  )
}

export function EvidenceTab({ data, set, attachments, setAttachments, onUpload, onRemove }: any) {
  const techCanvas = useRef<HTMLCanvasElement>(null)
  const clientCanvas = useRef<HTMLCanvasElement>(null)

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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label className="text-base font-semibold">Anexos (Fotos/Documentos)</Label>
          <div className="relative">
            <Input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={onUpload}
            />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" /> Enviar Arquivo
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {attachments?.map((a: any) => (
            <div
              key={a.id}
              className="border p-2 rounded flex flex-col justify-between group bg-secondary/10"
            >
              <span className="text-xs truncate" title={a.fileName}>
                {a.fileName}
              </span>
              <div className="flex justify-end gap-1 mt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => window.open(a.url)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onRemove(a.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {!attachments?.length && (
            <p className="text-sm text-muted-foreground col-span-full">Nenhum anexo encontrado.</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-2">
          <Label>Assinatura Técnico</Label>
          <div className="border bg-white rounded h-[150px] overflow-hidden relative touch-none">
            {data.technician_signature_url ? (
              <img
                src={data.technician_signature_url}
                className="w-full h-full object-contain"
                alt="Signature"
              />
            ) : (
              <canvas
                ref={techCanvas}
                width={400}
                height={150}
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
              variant="ghost"
              size="sm"
              onClick={() => set({ ...data, technician_signature_url: '' })}
            >
              Limpar
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <Label>Assinatura Cliente</Label>
          <div className="border bg-white rounded h-[150px] overflow-hidden relative touch-none">
            {data.client_signature_url ? (
              <img
                src={data.client_signature_url}
                className="w-full h-full object-contain"
                alt="Signature"
              />
            ) : (
              <canvas
                ref={clientCanvas}
                width={400}
                height={150}
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
              variant="ghost"
              size="sm"
              onClick={() => set({ ...data, client_signature_url: '' })}
            >
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminTab({ data, set }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Centro de Custo</Label>
        <Input
          value={data.cost_center}
          onChange={(e) => set({ ...data, cost_center: e.target.value })}
          placeholder="Ex: CC-Manutenção-Matriz"
        />
      </div>
      <div className="space-y-2">
        <Label>Status de Faturamento</Label>
        <Select
          value={data.billing_status || 'pending'}
          onValueChange={(v) => set({ ...data, billing_status: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="invoiced">Faturado</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Status de Aprovação Interna</Label>
        <Select
          value={data.approval_status || 'pending'}
          onValueChange={(v) => set({ ...data, approval_status: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Aguardando Aprovação</SelectItem>
            <SelectItem value="approved">Aprovado (Supervisor)</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Observações Administrativas</Label>
        <Textarea
          rows={4}
          value={data.notes}
          onChange={(e) => set({ ...data, notes: e.target.value })}
        />
      </div>
    </div>
  )
}
