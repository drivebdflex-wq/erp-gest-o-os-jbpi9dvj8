import { useState, useEffect, useRef } from 'react'
import { Plus, Settings, X, Trash2, Loader2, UserPlus } from 'lucide-react'
import CreateClientDialog from '@/components/admin/CreateClientDialog'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'

export default function ContractDialog({ open, onOpenChange, contract, type }: any) {
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const { clients, saveContract, priceItems, contractUnits, saveContractUnit, deleteContractUnit } =
    useAppStore()
  const [formData, setFormData] = useState<any>({})
  const [showPriceTable, setShowPriceTable] = useState(false)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [unitFormData, setUnitFormData] = useState<any>({})
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (contract) {
      const items = priceItems
        .filter((p) => p.contractId === contract.id)
        .map((p) => ({
          serviceCode: p.serviceCode,
          serviceName: p.serviceName,
          unitPrice: p.unitPrice,
        }))
      setFormData({ ...contract, priceItems: items })
    } else {
      setFormData({
        type,
        allowsCorrective: true,
        hasPreventive: false,
        name: '',
        contractNumber: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // +1 year
        priceItems: [],
      })
    }
    setShowUnitForm(false)
  }, [contract, open, type, priceItems])

  const handleDelete = async () => {
    if (!formData.id) return
    setIsDeleting(true)
    try {
      useAppStore.setState((state: any) => ({
        contracts: state.contracts.filter((c: any) => c.id !== formData.id),
        contractUnits: state.contractUnits?.filter((u: any) => u.contractId !== formData.id) || [],
        orders: state.orders.filter((o: any) => o.contractId !== formData.id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.contractId !== formData.id),
      }))
      toast({ title: 'Sucesso', description: 'Contrato e dados associados excluídos com sucesso.' })
      setShowDeleteAlert(false)
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao excluir contrato.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    try {
      await saveContract(formData)
      toast({ title: 'Sucesso', description: 'Contrato salvo com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleEditUnit = (u: any) => {
    setUnitFormData(u)
    setShowUnitForm(true)
  }

  const handleSaveUnit = async () => {
    if (
      !unitFormData.prefix ||
      !unitFormData.name ||
      !unitFormData.address ||
      !unitFormData.city ||
      !unitFormData.state ||
      !unitFormData.responsibleName
    ) {
      toast({
        title: 'Aviso',
        description: 'Preencha todos os campos obrigatórios da agência.',
        variant: 'destructive',
      })
      return
    }
    const isDuplicate = contractUnits.some(
      (u) =>
        u.contractId === formData.id &&
        u.prefix === unitFormData.prefix &&
        u.id !== unitFormData.id,
    )
    if (isDuplicate) {
      toast({
        title: 'Aviso',
        description: 'Já existe uma agência com este prefixo neste contrato.',
        variant: 'destructive',
      })
      return
    }

    try {
      await saveContractUnit({ ...unitFormData, contractId: formData.id })
      toast({ title: 'Sucesso', description: 'Agência salva com sucesso.' })
      setShowUnitForm(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        const lines = text.split('\n').filter((l) => l.trim().length > 0)
        if (lines.length === 0) return
        const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase())

        if (
          !headers.includes('service_code') ||
          !headers.includes('service_name') ||
          !headers.includes('unit_price')
        ) {
          toast({
            title: 'Erro',
            description:
              'Colunas obrigatórias ausentes no CSV (service_code, service_name, unit_price).',
            variant: 'destructive',
          })
          return
        }

        const items = []
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;]/).map((c) => c.trim())
          if (cols.length >= 3) {
            items.push({
              serviceCode: cols[headers.indexOf('service_code')],
              serviceName: cols[headers.indexOf('service_name')],
              unitPrice: parseFloat(cols[headers.indexOf('unit_price')]) || 0,
            })
          }
        }
        setFormData({ ...formData, priceItems: items })
        toast({ title: 'Sucesso', description: `${items.length} itens carregados da planilha.` })
      }
      reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx')) {
      toast({ title: 'Simulação', description: 'Leitura de XLSX simulada para o protótipo.' })
      const items = [
        { serviceCode: '001', serviceName: 'Troca de lâmpada', unitPrice: 50 },
        { serviceCode: '002', serviceName: 'Manutenção elétrica', unitPrice: 120 },
        { serviceCode: '003', serviceName: 'Visita Técnica', unitPrice: 150 },
        { serviceCode: '004', serviceName: 'Instalação de AC', unitPrice: 400 },
      ]
      setFormData({ ...formData, priceItems: items })
    } else {
      toast({
        title: 'Formato inválido',
        description: 'Apenas .csv ou .xlsx permitidos',
        variant: 'destructive',
      })
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{contract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="geral">
            <TabsList className="flex flex-wrap h-auto w-full justify-start text-xs bg-muted/50 p-1 rounded-md mb-4 gap-1">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="agencias">Agências</TabsTrigger>
              <TabsTrigger value="finance">Financeiro</TabsTrigger>
              <TabsTrigger value="precos">Preços</TabsTrigger>
              <TabsTrigger value="ops">Operacional</TabsTrigger>
              <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
              <TabsTrigger value="equipe">Equipe</TabsTrigger>
              <TabsTrigger value="docs">Anexos</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Nome do Contrato</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Número do Contrato</Label>
                  <Input
                    value={formData.contractNumber || ''}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Cliente</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.clientId || ''}
                      onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientDialog(true)}
                      title="Novo Cliente"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Unidade / Local (Sede)</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agencias" className="space-y-4 py-4">
              {!formData.id ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/10">
                  Salve o contrato primeiro para adicionar e gerenciar agências.
                </div>
              ) : showUnitForm ? (
                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                  <h3 className="font-semibold text-lg">
                    {unitFormData.id ? 'Editar Agência' : 'Nova Agência'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefixo / Código *</Label>
                      <Input
                        value={unitFormData.prefix || ''}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, prefix: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome da Agência *</Label>
                      <Input
                        value={unitFormData.name || ''}
                        onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Endereço Completo *</Label>
                      <Input
                        value={unitFormData.address || ''}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Input
                        value={unitFormData.city || ''}
                        onChange={(e) => setUnitFormData({ ...unitFormData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado (UF) *</Label>
                      <Input
                        value={unitFormData.state || ''}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, state: e.target.value.toUpperCase() })
                        }
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Responsável *</Label>
                      <Input
                        value={unitFormData.responsibleName || ''}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, responsibleName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone do Responsável</Label>
                      <Input
                        value={unitFormData.responsiblePhone || ''}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, responsiblePhone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowUnitForm(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveUnit}>Salvar Agência</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Unidades Cadastradas</Label>
                    <Button
                      size="sm"
                      onClick={() => {
                        setUnitFormData({})
                        setShowUnitForm(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Nova Agência
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prefixo</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Cidade/UF</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractUnits
                          .filter((u: any) => u.contractId === formData.id)
                          .map((u: any) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-mono text-xs">{u.prefix}</TableCell>
                              <TableCell className="font-medium text-sm">{u.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {u.city}/{u.state}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUnit(u)}
                                >
                                  <Settings className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteContractUnit(u.id)}
                                >
                                  <X className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        {contractUnits.filter((u: any) => u.contractId === formData.id).length ===
                          0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-muted-foreground py-8"
                            >
                              Nenhuma agência cadastrada neste contrato.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="finance" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Último Reajuste</Label>
                  <Input
                    type="date"
                    value={formData.lastAdjustmentDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, lastAdjustmentDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Próximo Reajuste</Label>
                  <Input
                    type="date"
                    value={formData.nextAdjustmentDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nextAdjustmentDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Índice de Reajuste</Label>
                  <Select
                    value={formData.adjustmentType || ''}
                    onValueChange={(v) => setFormData({ ...formData, adjustmentType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IGPM">IGPM</SelectItem>
                      <SelectItem value="IPCA">IPCA</SelectItem>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Percentual (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.adjustmentPercentage || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, adjustmentPercentage: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="precos" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label>Gerenciar Tabela de Preços</Label>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <label className="cursor-pointer">
                        Upload tabela de preços
                        <input
                          type="file"
                          className="hidden"
                          accept=".csv,.xlsx"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowPriceTable(true)
                      }}
                      disabled={!formData.priceItems?.length}
                    >
                      Visualizar tabela
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O arquivo (.csv ou .xlsx) deve conter as colunas: <strong>service_code</strong>,{' '}
                    <strong>service_name</strong>, <strong>unit_price</strong>.
                  </p>
                </div>

                {formData.priceItems && formData.priceItems.length > 0 && (
                  <div className="space-y-2 mt-4 border rounded-md p-4 bg-muted/20">
                    <div className="flex justify-between items-center">
                      <Label>Preview de Serviços</Label>
                      <Badge variant="secondary">{formData.priceItems.length} itens</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Preço (R$)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.priceItems.slice(0, 3).map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{item.serviceCode}</TableCell>
                            <TableCell className="text-xs">{item.serviceName}</TableCell>
                            <TableCell className="text-xs">{item.unitPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        {formData.priceItems.length > 3 && (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground text-xs py-4"
                            >
                              ... e mais {formData.priceItems.length - 3} itens. Clique em
                              "Visualizar tabela" para ver todos.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ops" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.allowsCorrective}
                    onCheckedChange={(c) => setFormData({ ...formData, allowsCorrective: c })}
                  />
                  <Label>Permitir Corretiva</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasPreventive}
                    onCheckedChange={(c) => setFormData({ ...formData, hasPreventive: c })}
                  />
                  <Label>Possui Preventiva</Label>
                </div>
                {formData.hasPreventive && (
                  <div className="space-y-2 col-span-2">
                    <Label>Frequência Preventiva</Label>
                    <Select
                      value={formData.preventiveFrequency || ''}
                      onValueChange={(v) => setFormData({ ...formData, preventiveFrequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  <Label>SLA Padrão (horas)</Label>
                  <Input
                    type="number"
                    value={formData.slaDefault || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, slaDefault: parseInt(e.target.value, 10) })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orcamento" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teto Mão de Obra (R$)</Label>
                  <Input
                    type="number"
                    value={formData.budgetLabor || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetLabor: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teto Materiais (R$)</Label>
                  <Input
                    type="number"
                    value={formData.budgetMaterial || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetMaterial: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teto Combustível (R$)</Label>
                  <Input
                    type="number"
                    value={formData.budgetFuel || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetFuel: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outros Custos (R$)</Label>
                  <Input
                    type="number"
                    value={formData.budgetOthers || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetOthers: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="equipe" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade de Técnicos Planejada</Label>
                  <Input
                    type="number"
                    value={formData.plannedTechs || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedTechs: parseInt(e.target.value, 10) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horas Previstas / Mês</Label>
                  <Input
                    type="number"
                    value={formData.plannedHours || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedHours: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Custo Estimado de Equipe (R$)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedTeamCost || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedTeamCost: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Anexar Documento (PDF/Excel)</Label>
                <Input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setFormData({
                        ...formData,
                        attachmentUrl: URL.createObjectURL(e.target.files[0]),
                      })
                      toast({
                        title: 'Arquivo carregado',
                        description: 'O documento foi anexado temporariamente.',
                      })
                    }
                  }}
                />
                {formData.attachmentUrl && (
                  <p className="text-sm text-green-600 mt-2">
                    Documento anexado pronto para envio.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex sm:justify-between w-full sm:items-center border-t border-border/50 pt-4">
            <div>
              {isAdmin && contract?.id && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar Contrato</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o contrato{' '}
              <strong>{formData?.contractNumber}</strong>? Isso também removerá todos os dados
              associados (Unidades e OS). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPriceTable} onOpenChange={setShowPriceTable}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tabela de Preços Completa</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Preço (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.priceItems?.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{item.serviceCode}</TableCell>
                    <TableCell className="text-sm">{item.serviceName}</TableCell>
                    <TableCell className="text-right text-sm">
                      {item.unitPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPriceTable(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateClientDialog open={showClientDialog} onOpenChange={setShowClientDialog} />
    </>
  )
}
