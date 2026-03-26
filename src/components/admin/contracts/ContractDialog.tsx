import { useState, useEffect } from 'react'
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

export default function ContractDialog({ open, onOpenChange, contract, type }: any) {
  const { clients, saveContract } = useAppStore()
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (contract) {
      setFormData(contract)
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
      })
    }
  }, [contract, open, type])

  const handleSave = async () => {
    try {
      await saveContract(formData)
      toast({ title: 'Sucesso', description: 'Contrato salvo com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="geral">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="finance">Financeiro</TabsTrigger>
            <TabsTrigger value="ops">Operacional</TabsTrigger>
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
                <Select
                  value={formData.clientId || ''}
                  onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                >
                  <SelectTrigger>
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
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Unidade / Local</Label>
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

          <TabsContent value="finance" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Último Reajuste</Label>
                <Input
                  type="date"
                  value={formData.lastAdjustmentDate || ''}
                  onChange={(e) => setFormData({ ...formData, lastAdjustmentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Próximo Reajuste</Label>
                <Input
                  type="date"
                  value={formData.nextAdjustmentDate || ''}
                  onChange={(e) => setFormData({ ...formData, nextAdjustmentDate: e.target.value })}
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
                <p className="text-sm text-green-600 mt-2">Documento anexado pronto para envio.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
