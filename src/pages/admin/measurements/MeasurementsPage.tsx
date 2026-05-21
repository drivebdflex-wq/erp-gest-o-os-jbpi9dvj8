import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_conferencia: 'bg-yellow-100 text-yellow-800',
  enviada: 'bg-purple-100 text-purple-800',
  aprovada: 'bg-green-100 text-green-800',
  faturada: 'bg-emerald-100 text-emerald-800',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_conferencia: 'Em Conferência',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  faturada: 'Faturada',
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMeasurements()
    fetchContracts()
  }, [])

  async function fetchMeasurements() {
    const { data, error } = await supabase
      .from('measurements')
      .select(`
        *,
        contracts (
          contract_number,
          clients (name)
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMeasurements(data)
    }
    setLoading(false)
  }

  async function fetchContracts() {
    const { data, error } = await supabase
      .from('contracts')
      .select(`id, contract_number, clients(name)`)
      .eq('status', 'active')

    if (!error && data) {
      setContracts(data)
    }
  }

  async function handleCreateMeasurement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      number: formData.get('number') as string,
      contract_id: formData.get('contract_id') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      status: 'aberta',
    }

    const { data, error } = await supabase.from('measurements').insert([payload]).select().single()

    if (error) {
      toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
    } else if (data) {
      toast({ title: 'Sucesso', description: 'Medição criada com sucesso' })
      navigate(`/medicoes/${data.id}`)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medições</h1>
          <p className="text-muted-foreground">Gerencie as medições de contratos.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nova Medição</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Medição</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMeasurement} className="space-y-4">
              <div className="space-y-2">
                <Label>Número da Medição</Label>
                <Input name="number" required placeholder="Ex: MED-001/2026" />
              </div>
              <div className="space-y-2">
                <Label>Contrato</Label>
                <Select name="contract_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.contract_number} - {c.clients?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input type="date" name="start_date" required />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input type="date" name="end_date" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Link
                    to={`/medicoes/${m.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {m.number}
                  </Link>
                </TableCell>
                <TableCell>
                  {m.contracts?.contract_number} - {m.contracts?.clients?.name}
                </TableCell>
                <TableCell>
                  {format(new Date(m.start_date + 'T12:00:00Z'), 'dd/MM/yyyy')} a{' '}
                  {format(new Date(m.end_date + 'T12:00:00Z'), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[m.status] || ''}>
                    {statusLabels[m.status] || m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    m.total_value || 0,
                  )}
                </TableCell>
              </TableRow>
            ))}
            {measurements.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma medição encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
