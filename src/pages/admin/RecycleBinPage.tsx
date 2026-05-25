import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Search, RotateCcw, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useSystemStore, DeletedRecord } from '@/stores/useSystemStore'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from '@/hooks/use-toast'

export default function RecycleBinPage() {
  const { user } = useAuthStore()
  const { deletedRecords, restoreRecord, hardDeleteRecord } = useSystemStore()
  const [searchTerm, setSearchTerm] = useState('')

  const [confirmRestore, setConfirmRestore] = useState<DeletedRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DeletedRecord | null>(null)

  const filteredRecords = deletedRecords.filter(
    (record) =>
      record.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deleted_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRestore = () => {
    if (!confirmRestore || !user) return
    const success = restoreRecord(confirmRestore.id, user.id, user.name)
    if (success) {
      toast({
        title: 'Registro Restaurado',
        description: 'O registro foi retornado à sua tabela original.',
      })
    }
    setConfirmRestore(null)
  }

  const handleHardDelete = () => {
    if (!confirmDelete || !user) return
    const success = hardDeleteRecord(confirmDelete.id, user.id, user.name)
    if (success) {
      toast({
        title: 'Exclusão Permanente',
        description: 'O registro foi excluído definitivamente do sistema.',
        variant: 'destructive',
      })
    }
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
          <Trash2 className="w-6 h-6" /> Lixeira
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie registros excluídos. Itens aqui são mantidos por 30 dias antes da exclusão
          permanente.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tabela, usuário ou ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tabela / Entidade</TableHead>
              <TableHead>ID do Registro</TableHead>
              <TableHead>Excluído Por</TableHead>
              <TableHead>Data de Exclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  A lixeira está vazia.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium capitalize">
                    {record.table_name.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {record.record_id}
                  </TableCell>
                  <TableCell>{record.deleted_by_name || 'Sistema'}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(record.deleted_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirmRestore(record)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Restaurar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDelete(record)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!confirmRestore} onOpenChange={(o) => !o && setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar o registro de{' '}
              <strong className="capitalize">{confirmRestore?.table_name.replace('_', ' ')}</strong>
              ? Ele voltará a ficar disponível em todo o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Sim, Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Exclusão Permanente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente do banco de
              dados e da lixeira. Uma entrada de log "HARD_DELETE" será criada na auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
