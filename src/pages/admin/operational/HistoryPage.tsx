import { useState } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Activity } from 'lucide-react'

export default function HistoryPage() {
  const { historyLogs, technicians } = useOperationalStore()
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
            <div className="relative border-l-2 border-border ml-3 space-y-6 py-2">
              {filteredLogs.map((log) => {
                const tech = technicians.find((t) => t.id === log.technician_id)
                return (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary" />
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
