import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Navigation } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

export default function MapPage() {
  const { orders } = useAppStore()

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Roteirização Inteligente</h2>
        <p className="text-sm text-muted-foreground">
          Despacho geográfico e visualização em tempo real.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        <Card className="lg:col-span-3 relative overflow-hidden bg-muted">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Simulating Map Markers */}
            <div className="relative w-[600px] h-[400px]">
              <div className="absolute top-1/4 left-1/4 animate-bounce">
                <MapPin className="h-8 w-8 text-primary drop-shadow-md" />
                <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-background px-2 py-1 rounded text-[10px] font-bold shadow whitespace-nowrap">
                  OS-1042
                </span>
              </div>
              <div className="absolute top-1/2 right-1/3">
                <MapPin className="h-8 w-8 text-destructive drop-shadow-md" />
                <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-background px-2 py-1 rounded text-[10px] font-bold shadow whitespace-nowrap">
                  OS-1043
                </span>
              </div>
              <div className="absolute bottom-1/4 left-1/3">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <Navigation className="h-5 w-5 text-primary rotate-45" />
                </div>
                <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-background px-2 py-1 rounded text-[10px] font-bold shadow whitespace-nowrap">
                  Carlos S.
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-background/90 p-2 rounded-lg shadow-sm backdrop-blur-sm text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" /> OS em Execução
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full" /> SLA Crítico
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-3 h-3 text-primary rotate-45" /> Técnico
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-4 border-b font-semibold">Fila de Despacho</div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {orders
                .filter((o) => o.status === 'Aberta')
                .map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-md p-3 text-sm hover:border-primary cursor-pointer transition-colors bg-background"
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>{order.id}</span>
                      <Badge variant="outline">{order.priority}</Badge>
                    </div>
                    <div className="text-muted-foreground text-xs mb-2 line-clamp-1">
                      {order.address}
                    </div>
                    <div className="text-xs font-medium text-primary">Arraste p/ atribuir</div>
                  </div>
                ))}
              {orders.filter((o) => o.status === 'Aberta').length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">Fila vazia.</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
