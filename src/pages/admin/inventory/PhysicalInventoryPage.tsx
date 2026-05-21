import InventoryNav from '@/components/admin/inventory/InventoryNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'

export default function PhysicalInventoryPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <InventoryNav />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventário</h2>
        <p className="text-sm text-muted-foreground">Contagem e auditoria física de estoque.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria de Estoque</CardTitle>
          <CardDescription>Ajuste de saldo físico x lógico do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Nenhum inventário em andamento</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
            Inicie um novo processo de inventário para realizar a contagem física dos itens e
            efetuar os ajustes necessários no sistema.
          </p>
          <Button>Iniciar Novo Inventário</Button>
        </CardContent>
      </Card>
    </div>
  )
}
