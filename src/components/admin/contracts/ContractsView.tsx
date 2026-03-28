import { useState } from 'react'
import { Plus, FileText, Calculator, Settings, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'
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
import useFinanceStore from '@/stores/useFinanceStore'
import ContractDialog from './ContractDialog'
import ContractSimulatorDialog from './ContractSimulatorDialog'
import { toast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ContractsView({ type }: { type: 'Manutenção' | 'Obra' }) {
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const { contracts, generatePreventives } = useAppStore()
  const { costs } = useFinanceStore()

  const filtered = contracts.filter((c) => c.type === type)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [simOpen, setSimOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const [contractToDelete, setContractToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDialog = (contract?: any) => {
    setSelected(contract || null)
    setDialogOpen(true)
  }

  const getDaysRemaining = (endDateStr: string) => {
    const diffTime = new Date(endDateStr).getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleDelete = async (contract: any) => {
    setIsDeleting(true)
    try {
      useAppStore.setState((state: any) => ({
        contracts: state.contracts.filter((c: any) => c.id !== contract.id),
        contractUnits: state.contractUnits?.filter((u: any) => u.contractId !== contract.id) || [],
        orders: state.orders.filter((o: any) => o.contractId !== contract.id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.contractId !== contract.id),
      }))
      toast({ title: 'Sucesso', description: 'Contrato e dados associados excluídos com sucesso.' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao excluir contrato.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setContractToDelete(null)
    }
  }

  const checkBudgetStatus = (contract: any) => {
    const contractCosts = costs.filter((c) => c.contractId === contract.id)
    const laborCost = contractCosts
      .filter((c) => c.category === 'mão de obra')
      .reduce((s, c) => s + c.value, 0)
    const matCost = contractCosts
      .filter((c) => c.category === 'material_os')
      .reduce((s, c) => s + c.value, 0)

    let flags = []
    if (contract.budgetLabor && laborCost > contract.budgetLabor) flags.push('Mão de Obra')
    if (contract.budgetMaterial && matCost > contract.budgetMaterial) flags.push('Materiais')

    return flags
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contratos de {type}</h2>
          <p className="text-muted-foreground text-sm">
            Gerenciamento do ciclo de vida, faturamento e orçamento.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSimOpen(true)}>
            <Calculator className="w-4 h-4 mr-2" /> Simulador
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" /> Criar Contrato
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Saúde/Orçamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const days = getDaysRemaining(c.endDate)
              const overBudgetFlags = checkBudgetStatus(c)

              return (
                <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium cursor-pointer" onClick={() => openDialog(c)}>
                    {c.contractNumber}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openDialog(c)}>
                    {c.name}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => openDialog(c)}>
                    <div className="font-medium text-xs">{c.clientName}</div>
                    <div className="text-muted-foreground text-[10px]">{c.location}</div>
                  </TableCell>
                  <TableCell className="text-xs cursor-pointer" onClick={() => openDialog(c)}>
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
                  <TableCell className="cursor-pointer" onClick={() => openDialog(c)}>
                    {overBudgetFlags.length > 0 ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Estouro: {overBudgetFlags.join(', ')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-success border-success/50 text-[10px]"
                      >
                        No Orçamento
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(c)}>
                          Editar Contrato
                        </DropdownMenuItem>
                        {c.hasPreventive && (
                          <DropdownMenuItem
                            onClick={() => {
                              generatePreventives(c.id)
                              toast({
                                title: 'Preventivas Geradas',
                                description: `OS de manutenção criadas com sucesso.`,
                              })
                            }}
                          >
                            Gerar Preventivas
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => setContractToDelete(c)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Contrato
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      <ContractSimulatorDialog open={simOpen} onOpenChange={setSimOpen} />

      <AlertDialog
        open={!!contractToDelete}
        onOpenChange={(open) => !open && setContractToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o contrato{' '}
              <strong>{contractToDelete?.contractNumber}</strong>? Isso também removerá todos os
              dados associados (Unidades e OS). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (contractToDelete) handleDelete(contractToDelete)
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
    </div>
  )
}
