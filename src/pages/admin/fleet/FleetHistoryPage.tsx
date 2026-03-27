import FleetNav from '@/components/admin/fleet/FleetNav'
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
import { Wrench, Fuel, User } from 'lucide-react'

export default function FleetHistoryPage() {
  const { vehicles, maintenances, refuelings, assignments, drivers } = useFleetStore()

  const timeline = [
    ...maintenances.map((m) => ({
      id: m.id,
      date: m.date,
      type: 'maintenance',
      vehicle_id: m.vehicle_id,
      title: `Manutenção ${m.type === 'Preventive' ? 'Preventiva' : 'Corretiva'}`,
      description: `${m.description} (KM: ${m.km})`,
      cost: m.cost,
      icon: Wrench,
      color: 'text-orange-500',
    })),
    ...refuelings.map((r) => ({
      id: r.id,
      date: r.date,
      type: 'refueling',
      vehicle_id: r.vehicle_id,
      title: 'Abastecimento',
      description: `${r.liters} Litros abastecidos por ${drivers.find((d) => d.id === r.driver_id)?.name} (KM: ${r.km})`,
      cost: r.value,
      icon: Fuel,
      color: 'text-blue-500',
    })),
    ...assignments.map((a) => ({
      id: a.id,
      date: a.start_date,
      type: 'assignment',
      vehicle_id: a.vehicle_id,
      title: 'Atribuição de Motorista',
      description: `Vinculado ao motorista: ${drivers.find((d) => d.id === a.driver_id)?.name}`,
      cost: 0,
      icon: User,
      color: 'text-green-500',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <FleetNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Histórico Global da Frota</h2>
        <p className="text-sm text-muted-foreground">
          Registro de todos os eventos operacionais de todos os veículos.
        </p>
      </div>

      <div className="border rounded-md bg-card mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Custo Associado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeline.map((item, idx) => {
              const v = vehicles.find((x) => x.id === item.vehicle_id)
              return (
                <TableRow key={`${item.type}-${item.id}-${idx}`}>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold">{v?.plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      {item.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.cost > 0 ? (
                      <Badge variant="destructive">R$ {item.cost.toFixed(2)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {timeline.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum evento registrado na frota.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
