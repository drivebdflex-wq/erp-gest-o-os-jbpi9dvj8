import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export default function ProjectProgressPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [stages, setStages] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<any>({ completion_percentage: 0 })

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedProjectId) fetchStages(selectedProjectId)
    else setStages([])
  }, [selectedProjectId])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name')
    if (data) setProjects(data)
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('id, name')
    if (data) setUsers(data)
  }

  const fetchStages = async (pid: string) => {
    const { data } = await supabase
      .from('project_stages')
      .select('*, users(name)')
      .eq('project_id', pid)
      .order('created_at', { ascending: true })
    if (data) setStages(data)
  }

  const overallProgress = useMemo(() => {
    if (stages.length === 0) return 0
    const sum = stages.reduce((acc, stage) => acc + (Number(stage.completion_percentage) || 0), 0)
    return Math.round(sum / stages.length)
  }, [stages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) return toast.error('Selecione uma obra')

    const payload = { ...formData, project_id: selectedProjectId }
    const { error } = await supabase.from('project_stages').insert([payload])

    if (error) toast.error('Erro ao salvar etapa')
    else {
      toast.success('Etapa salva')
      setIsOpen(false)
      setFormData({ completion_percentage: 0 })
      fetchStages(selectedProjectId)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Progresso da Obra</h2>
        <div className="w-64">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma obra..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedProjectId && (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={overallProgress} className="flex-1 h-3" />
                <span className="font-bold text-lg">Obra executada: {overallProgress}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Etapas do Projeto</CardTitle>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Nova Etapa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Etapa</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome da Etapa</label>
                      <Input
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Responsável</label>
                      <Select
                        required
                        value={formData.responsible_id}
                        onValueChange={(v) => setFormData({ ...formData, responsible_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Início</label>
                        <Input
                          type="date"
                          required
                          value={formData.start_date || ''}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fim</label>
                        <Input
                          type="date"
                          required
                          value={formData.end_date || ''}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">% Execução (0-100)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={formData.completion_percentage}
                          onChange={(e) =>
                            setFormData({ ...formData, completion_percentage: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Input
                          required
                          value={formData.status || ''}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observações</label>
                      <Textarea
                        value={formData.observations || ''}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit">Adicionar Etapa</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma etapa cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {stages.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.users?.name}</TableCell>
                      <TableCell>
                        {new Date(s.start_date).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(s.end_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Number(s.completion_percentage)} className="w-16 h-2" />
                          <span className="text-xs">{s.completion_percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
