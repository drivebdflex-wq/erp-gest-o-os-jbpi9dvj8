import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAppStore from '@/stores/useAppStore'
import ContractDialog from './ContractDialog'

export default function ContractsView({ type }: { type: 'Manutenção' | 'Obra' }) {
  const { contracts } = useAppStore()
  const filtered = contracts.filter((c) => c.type === type)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const openDialog = (contract?: any) => {
    setSelected(contract || null)
    setDialogOpen(true)
  }

  const getDaysRemaining = (endDateStr: string) => {
    const diffTime = new Date(endDateStr).getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contratos de {type}</h2>
          <p className="text-muted-foreground text-sm">
            Gerenciamento do ciclo de vida e faturamento.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Criar Contrato
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente / Unidade</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Status / Dias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const days = getDaysRemaining(c.endDate)
              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openDialog(c)}
                >
                  <TableCell className="font-medium">{c.contractNumber}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <div className="font-medium text-xs">{c.clientName}</div>
                    <div className="text-muted-foreground text-[10px]">{c.location}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(c.startDate).toLocaleDateString()} a{' '}
                    {new Date(c.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={days < 0 ? 'destructive' : days <= 30 ? 'secondary' : 'outline'}
                      className={
                        days <= 30 && days >= 0
                          ? 'bg-warning/20 text-warning border-warning/50'
                          : ''
                      }
                    >
                      {days < 0 ? 'Vencido' : `${days} dias`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum contrato de {type} encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contract={selected}
        type={type}
      />
    </div>
  )
}
