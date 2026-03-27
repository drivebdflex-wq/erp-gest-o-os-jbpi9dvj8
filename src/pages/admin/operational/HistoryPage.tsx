import { useState } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Activity, User as UserIcon } from 'lucide-react'

export default function HistoryPage() {
  const { historyLogs, technicians } = useOperationalStore()
  const { users } = useAuthStore()
  const [selectedTech, setSelectedTech] = useState<string>('all')

  const filteredLogs = historyLogs
    .filter((log) => selectedTech === 'all' || log.technician_id === selectedTech)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico Consolidado</h2>
          <p className="text-sm text-muted-foreground">
            Linha do tempo de todas as ações e eventos operacionais.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedTech} onValueChange={setSelectedTech}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Técnico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Técnicos</SelectItem>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" /> Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-5 space-y-8 py-2">
              {filteredLogs.map((log) => {
                const tech = technicians.find((t) => t.id === log.technician_id)
                const user = users.find((u) => u.name === tech?.name)

                return (
                  <div key={log.id} className="relative pl-8">
                    <div className="absolute -left-[21px] top-0 h-10 w-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center z-10 overflow-hidden">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {tech?.name?.substring(0, 2).toUpperCase() || (
                            <UserIcon className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span className="text-primary">{log.action}</span>
                        {selectedTech === 'all' && (
                          <span className="bg-secondary px-2 py-0.5 rounded text-xs font-normal">
                            {tech?.name}
                          </span>
                        )}
                        <span className="text-xs font-normal text-muted-foreground ml-auto">
                          {new Date(log.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-foreground/80">{log.details}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
