import { useParams } from 'react-router-dom'
import useFleetStore from '@/stores/useFleetStore'
import useAppStore from '@/stores/useAppStore'
import FleetNav from '@/components/admin/fleet/FleetNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, Fuel, User, ClipboardList, Calendar } from 'lucide-react'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { vehicles, maintenances, refuelings, assignments, drivers } = useFleetStore()
  const { orders } = useAppStore()

  const vehicle = vehicles.find((v) => v.id === id)

  if (!vehicle) return <div className="p-8 text-center">Veículo não encontrado</div>

  const timeline = [
    ...maintenances
      .filter((m) => m.vehicle_id === id)
      .map((m) => ({
        id: m.id,
        date: m.date,
        type: 'maintenance',
        title: `Manutenção ${m.type === 'Preventive' ? 'Preventiva' : 'Corretiva'}`,
        description: `${m.description} - Custo: R$ ${m.cost.toFixed(2)} (KM: ${m.km})`,
        icon: Wrench,
        color: 'border-orange-500 text-orange-500',
      })),
    ...refuelings
      .filter((r) => r.vehicle_id === id)
      .map((r) => ({
        id: r.id,
        date: r.date,
        type: 'refueling',
        title: 'Abastecimento',
        description: `${r.liters} Litros - R$ ${r.value.toFixed(2)} (KM: ${r.km}) ${r.consumption ? ` - Consumo: ${r.consumption.toFixed(1)} km/l` : ''}`,
        icon: Fuel,
        color: 'border-blue-500 text-blue-500',
      })),
    ...assignments
      .filter((a) => a.vehicle_id === id)
      .map((a) => ({
        id: a.id,
        date: a.start_date,
        type: 'assignment',
        title: 'Atribuição de Motorista',
        description: `Motorista: ${drivers.find((d) => d.id === a.driver_id)?.name || 'Desconhecido'}`,
        icon: User,
        color: 'border-green-500 text-green-500',
      })),
    ...orders
      .filter((o) => o.vehicleId === id)
      .map((o) => ({
        id: o.id,
        date: o.date,
        type: 'order',
        title: `Ordem de Serviço ${o.shortId}`,
        description: o.title,
        icon: ClipboardList,
        color: 'border-primary text-primary',
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <FleetNav />

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {vehicle.plate} - {vehicle.brand} {vehicle.model}
          </h2>
          <p className="text-sm text-muted-foreground">
            Ciclo de vida e histórico de eventos do ativo.
          </p>
        </div>
        <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'} className="text-lg">
          {vehicle.status === 'active'
            ? 'Ativo'
            : vehicle.status === 'maintenance'
              ? 'Em Manutenção'
              : 'Inativo'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Ficha Técnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground block">KM Atual</span>
              <span className="font-bold">{vehicle.current_km} km</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Ano</span>
              <span className="font-bold">{vehicle.year}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Combustível</span>
              <span className="font-bold capitalize">{vehicle.fuel_type}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Data de Aquisição</span>
              <span className="font-bold">
                {new Date(vehicle.purchase_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Valor de Aquisição</span>
              <span className="font-bold">R$ {vehicle.purchase_value.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Linha do Tempo (Life Cycle)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum evento registrado para este veículo.
              </p>
            ) : (
              <div className="relative border-l-2 border-border ml-3 space-y-8 py-2">
                {timeline.map((item, i) => (
                  <div key={`${item.type}-${item.id}-${i}`} className="relative pl-6">
                    <div
                      className={`absolute -left-[17px] top-1 p-1.5 rounded-full bg-background border-2 ${item.color}`}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        {item.title}
                        <span className="text-xs font-normal text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-foreground/80">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
