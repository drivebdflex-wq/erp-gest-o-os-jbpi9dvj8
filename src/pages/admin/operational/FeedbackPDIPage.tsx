import { useState } from 'react'
import useOperationalStore from '@/stores/useOperationalStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FeedbackPDIPage() {
  const { feedbacks, pdis, technicians, addFeedback, addPDI, updatePDI } = useOperationalStore()
  const [openFb, setOpenFb] = useState(false)
  const [openPdi, setOpenPdi] = useState(false)
  const [formFb, setFormFb] = useState<any>({ rating: 5 })
  const [formPdi, setFormPdi] = useState<any>({ status: 'pendente' })

  const handleSaveFb = () => {
    if (!formFb.technician_id || !formFb.comment || !formFb.date) return
    addFeedback({
      technician_id: formFb.technician_id,
      rating: Number(formFb.rating),
      comment: formFb.comment,
      date: formFb.date,
    })
    setOpenFb(false)
    setFormFb({ rating: 5 })
  }

  const handleSavePdi = () => {
    if (!formPdi.technician_id || !formPdi.goal || !formPdi.deadline) return
    addPDI({
      technician_id: formPdi.technician_id,
      goal: formPdi.goal,
      action: formPdi.action || '',
      deadline: formPdi.deadline,
      status: formPdi.status,
    })
    setOpenPdi(false)
    setFormPdi({ status: 'pendente' })
  }

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Feedback & PDI</h2>
        <p className="text-sm text-muted-foreground">
          Avaliações e Planos de Desenvolvimento Individual.
        </p>
      </div>

      <Tabs defaultValue="feedback" className="mt-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
            <TabsTrigger value="pdi">PDI</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="feedback" className="m-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setOpenFb(true)}>
              <Plus className="w-4 h-4 mr-2" /> Novo Feedback
            </Button>
          </div>
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Comentário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f) => {
                  const tech = technicians.find((t) => t.id === f.technician_id)
                  return (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">{tech?.name}</TableCell>
                      <TableCell>{Array(f.rating).fill('⭐').join('')}</TableCell>
                      <TableCell className="text-muted-foreground">{f.comment}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pdi" className="m-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setOpenPdi(true)}>
              <Plus className="w-4 h-4 mr-2" /> Novo PDI
            </Button>
          </div>
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Plano de Ação</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdis.map((p) => {
                  const tech = technicians.find((t) => t.id === p.technician_id)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">{tech?.name}</TableCell>
                      <TableCell>{p.goal}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{p.action}</TableCell>
                      <TableCell>{new Date(p.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === 'concluido'
                              ? 'default'
                              : p.status === 'cancelado'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {p.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status !== 'concluido' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updatePDI(p.id, { status: 'concluido' })}
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={openFb} onOpenChange={setOpenFb}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Feedback</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select onValueChange={(v) => setFormFb({ ...formFb, technician_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Avaliação (1 a 5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formFb.rating}
                  onChange={(e) => setFormFb({ ...formFb, rating: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  onChange={(e) => setFormFb({ ...formFb, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comentário</Label>
              <Input onChange={(e) => setFormFb({ ...formFb, comment: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenFb(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFb}>Salvar Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPdi} onOpenChange={setOpenPdi}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar PDI</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select onValueChange={(v) => setFormPdi({ ...formPdi, technician_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objetivo Principal</Label>
              <Input onChange={(e) => setFormPdi({ ...formPdi, goal: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Plano de Ação</Label>
              <Input onChange={(e) => setFormPdi({ ...formPdi, action: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input
                  type="date"
                  onChange={(e) => setFormPdi({ ...formPdi, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formPdi.status}
                  onValueChange={(v) => setFormPdi({ ...formPdi, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPdi(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePdi}>Criar PDI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
