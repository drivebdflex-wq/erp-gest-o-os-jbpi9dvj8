import InventoryNav from '@/components/admin/inventory/InventoryNav'
import useInventoryStore from '@/stores/useInventoryStore'
import useFleetStore from '@/stores/useFleetStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Truck } from 'lucide-react'

export default function RequisitionsPage() {
  const { requisitions, products, updateRequisitionStatus } = useInventoryStore()
  const { vehicles } = useFleetStore()

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Requisições de Materiais</h2>
        <p className="text-sm text-muted-foreground">
          Pedidos de reabastecimento de viaturas pelas equipes de campo.
        </p>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Itens Solicitados</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map((r) => {
              const v = vehicles.find((x) => x.id === r.vehicle_id)
              return (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{r.requester}</TableCell>
                  <TableCell>{v ? `${v.plate} (${v.model})` : '-'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {r.items.map((item, idx) => {
                        const p = products.find((x) => x.id === item.product_id)
                        return (
                          <div key={idx} className="text-xs">
                            {item.quantity}x {p?.name}
                          </div>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        r.status === 'pendente'
                          ? 'outline'
                          : r.status === 'aprovado'
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.status === 'pendente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary hover:text-primary"
                        onClick={() => updateRequisitionStatus(r.id, 'aprovado')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Aprovar
                      </Button>
                    )}
                    {r.status === 'aprovado' && (
                      <Button size="sm" onClick={() => updateRequisitionStatus(r.id, 'entregue')}>
                        <Truck className="w-4 h-4 mr-1" /> Entregar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {requisitions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma requisição encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
