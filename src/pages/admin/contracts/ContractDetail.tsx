import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import CreateOrderDialog from '@/components/admin/CreateOrderDialog'

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const { data: cData } = await supabase
      .from('contracts')
      .select('*, clients(name)')
      .eq('id', id)
      .single()

    if (cData) setContract(cData)

    const { data: oData } = await supabase
      .from('service_orders')
      .select('*, technicians(users(name))')
      .eq('contract_id', id)
      .order('created_at', { ascending: false })

    if (oData) setOrders(oData)
    setLoading(false)
  }

  useEffect(() => {
    if (id) loadData()
  }, [id])

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  if (!contract) return <div className="p-8">Contrato não encontrado.</div>

  return (
    <div className="space-y-6 animate-fade-in p-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/contratos/painel')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detalhes do Contrato</h2>
            <p className="text-sm text-muted-foreground">
              {contract.contract_number || 'S/N'} • {contract.clients?.name}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Ordem de Serviço
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Cliente:</span>{' '}
              <span className="font-medium">{contract.clients?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Número:</span>{' '}
              <span className="font-medium">{contract.contract_number || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Vigência:</span>{' '}
              <span className="font-medium">
                {contract.start_date} a {contract.end_date}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">SLA:</span>{' '}
              <span className="font-medium">{contract.sla_description || 'Padrão'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status:</span>{' '}
              <Badge>{contract.status || 'Ativo'}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Valor:</span>{' '}
              <span className="font-medium">
                R$ {contract.value?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-muted-foreground block mb-2">Observações:</span>{' '}
              <p className="bg-muted/50 p-3 rounded border text-xs">
                {contract.terms || 'Nenhuma observação cadastrada.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Identificação da OS</TableHead>
                <TableHead>Data de Abertura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Conclusão</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/ordens/${o.id}`)}
                >
                  <TableCell>
                    <div className="font-bold text-sm">
                      OS {o.order_number || o.id.split('-')[0]}
                    </div>
                    <div className="text-sm font-semibold text-primary mt-1">
                      {o.unit_prefix && o.unit_name
                        ? `${o.unit_prefix} / ${o.unit_name} - ${o.unit_address || 'S/ Endereço'}`
                        : o.unit_prefix || o.unit_name || 'Sem Unidade'}
                    </div>
                    <div
                      className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]"
                      title={o.description}
                    >
                      {o.description || 'Sem descrição'}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.priority}</Badge>
                  </TableCell>
                  <TableCell>{o.technicians?.users?.name || 'Não atribuído'}</TableCell>
                  <TableCell>
                    {o.finished_at ? new Date(o.finished_at).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/ordens/${o.id}`)
                      }}
                    >
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhuma OS vinculada a este contrato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {createOpen && (
        <CreateOrderDialog
          open={createOpen}
          onOpenChange={(v: boolean) => {
            setCreateOpen(v)
            if (!v) loadData()
          }}
          defaultContractId={contract.id}
          fixedClientId={contract.client_id}
          defaultPriority={
            contract.sla_description?.toLowerCase().includes('alta') ? 'high' : 'medium'
          }
        />
      )}
    </div>
  )
}
