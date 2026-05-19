import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('contracts').select(`
          *,
          clients(name),
          service_orders(id)
        `)
      if (!error && data) {
        setContracts(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Painel de Contratos</h2>
        <p className="text-sm text-muted-foreground">
          Gerenciamento centralizado de contratos e ordens de serviço associadas.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Contrato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Nº Contrato</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total de OS</TableHead>
              <TableHead>Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    to={`/contratos/${c.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Contrato {c.contract_number || 'S/N'} - {c.clients?.name}
                  </Link>
                </TableCell>
                <TableCell>{c.clients?.name}</TableCell>
                <TableCell>{c.contract_number || 'S/N'}</TableCell>
                <TableCell>
                  {c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : '-'} a{' '}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>{c.sla_description || 'Padrão'}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                    {c.status || 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{c.service_orders?.length || 0} OS</Badge>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  R$ {c.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum contrato encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
