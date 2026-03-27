import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContractSimulatorDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [rev, setRev] = useState<number>(0)
  const [costLabor, setCostLabor] = useState<number>(0)
  const [costMat, setCostMat] = useState<number>(0)
  const [costFuel, setCostFuel] = useState<number>(0)
  const [costOther, setCostOther] = useState<number>(0)

  const totalCost = costLabor + costMat + costFuel + costOther
  const profit = rev - totalCost
  const margin = rev > 0 ? (profit / rev) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Simulador de Rentabilidade</DialogTitle>
          <DialogDescription>
            Analise previsões de receitas e custos antes de fechar um contrato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 border-b pb-4">
            <Label className="text-primary font-semibold">Receita Prevista (R$)</Label>
            <Input
              type="number"
              value={rev || ''}
              onChange={(e) => setRev(parseFloat(e.target.value) || 0)}
              className="font-mono text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div className="space-y-2">
              <Label>Custo de Mão de Obra</Label>
              <Input
                type="number"
                value={costLabor || ''}
                onChange={(e) => setCostLabor(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Custo de Materiais</Label>
              <Input
                type="number"
                value={costMat || ''}
                onChange={(e) => setCostMat(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Combustível / Desloc.</Label>
              <Input
                type="number"
                value={costFuel || ''}
                onChange={(e) => setCostFuel(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Outros Custos</Label>
              <Input
                type="number"
                value={costOther || ''}
                onChange={(e) => setCostOther(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2 bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custos Totais:</span>
              <span className="font-mono">R$ {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Lucro Projetado:</span>
              <span className={profit >= 0 ? 'text-success' : 'text-destructive font-mono'}>
                R$ {profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Margem (%):</span>
              <span className={margin >= 10 ? 'text-success' : 'text-warning'}>
                {margin.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
