import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, List, Kanban } from 'lucide-react'
import OrderTable from '@/components/admin/OrderTable'
import OrderKanban from '@/components/admin/OrderKanban'
import CreateOrderDialog from '@/components/admin/CreateOrderDialog'
import OrderDetailsDialog from '@/components/admin/OrderDetailsDialog'
import { Order } from '@/stores/useAppStore'

export default function WorkOrders() {
  const [view, setView] = useState('list')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o fluxo de trabalho e planejamento.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova OS
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 w-full max-w-sm">
          <Input placeholder="Filtrar OS..." className="bg-background" />
          <Button variant="secondary">Filtros</Button>
        </div>

        <Tabs value={view} onValueChange={setView} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <Kanban className="h-4 w-4 mr-2" />
              Quadro
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 mt-2">
        {view === 'list' ? (
          <OrderTable onRowClick={handleOpenDetails} />
        ) : (
          <OrderKanban onCardClick={handleOpenDetails} />
        )}
      </div>

      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
      <OrderDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} order={selectedOrder} />
    </div>
  )
}
