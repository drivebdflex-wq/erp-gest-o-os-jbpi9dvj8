import { useState } from 'react'
import { format } from 'date-fns'
import { Eye, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSystemStore, AuditLog } from '@/stores/useSystemStore'

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
    case 'UPDATE':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    case 'DELETE':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    case 'RESTORE':
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
    case 'HARD_DELETE':
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
}

export default function AuditLogsPage() {
  const { auditLogs } = useSystemStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter

    return matchesSearch && matchesAction
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h2>
        <p className="text-sm text-muted-foreground">
          Monitoramento de ações e alterações de dados no sistema.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tabela, usuário ou ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as Ações</SelectItem>
              <SelectItem value="CREATE">Criação (CREATE)</SelectItem>
              <SelectItem value="UPDATE">Atualização (UPDATE)</SelectItem>
              <SelectItem value="DELETE">Exclusão (DELETE)</SelectItem>
              <SelectItem value="RESTORE">Restauração (RESTORE)</SelectItem>
              <SelectItem value="HARD_DELETE">Exclusão Definitiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead>ID do Registro</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-medium">{log.user_name || 'Sistema'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.table_name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono truncate max-w-[150px]">
                    {log.record_id}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      <Eye className="w-4 h-4 mr-2" /> Ver Dados
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Auditoria</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-md">
                <div>
                  <span className="font-semibold block text-muted-foreground">ID da Ação:</span>
                  <span className="font-mono">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="font-semibold block text-muted-foreground">
                    IP / User Agent:
                  </span>
                  <span>{selectedLog.ip_address}</span>
                  <p
                    className="text-xs text-muted-foreground mt-1 truncate"
                    title={selectedLog.user_agent}
                  >
                    {selectedLog.user_agent}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md">
                  <div className="bg-muted px-4 py-2 font-semibold border-b text-sm">
                    Valor Anterior (Before)
                  </div>
                  <ScrollArea className="h-[300px] w-full p-4 bg-zinc-950 text-green-400 font-mono text-xs">
                    <pre>
                      {selectedLog.old_value
                        ? JSON.stringify(selectedLog.old_value, null, 2)
                        : 'null'}
                    </pre>
                  </ScrollArea>
                </div>
                <div className="border rounded-md">
                  <div className="bg-muted px-4 py-2 font-semibold border-b text-sm">
                    Novo Valor (After)
                  </div>
                  <ScrollArea className="h-[300px] w-full p-4 bg-zinc-950 text-blue-400 font-mono text-xs">
                    <pre>
                      {selectedLog.new_value
                        ? JSON.stringify(selectedLog.new_value, null, 2)
                        : 'null'}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
