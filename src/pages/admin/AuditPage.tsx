import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Camera } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from '@/hooks/use-toast'

export default function AuditPage() {
  const { orders, updateOrderStatus } = useAppStore()
  const { hasPermission } = useAuthStore()
  const canAudit = hasPermission('edit_service_order')

  const auditOrders = orders.filter((o) => o.status === 'Em Auditoria')

  const handleAudit = async (id: string, approve: boolean) => {
    if (!canAudit) {
      toast({
        title: 'Ação Restrita',
        description: 'Você não tem permissão para auditar O.S.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateOrderStatus(id, approve ? 'Finalizada' : 'Reprovada')
      toast({
        title: approve ? 'OS Aprovada' : 'OS Reprovada',
        description: `A ordem ${id.substring(0, 8).toUpperCase()} foi ${approve ? 'finalizada' : 'devolvida para a fila'}.`,
        variant: approve ? 'default' : 'destructive',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a ordem.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Fila de Auditoria</h2>
        <p className="text-sm text-muted-foreground">
          Revise fotos e checklists antes de finalizar serviços.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {auditOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <div className="h-32 bg-muted relative group">
              <img
                src={`https://img.usecurling.com/p/400/200?q=maintenance`}
                alt="Evidência"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" /> Ver Galeria
                </Button>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{order.shortId}</CardTitle>
                <Badge variant="secondary">Aguardando Revisão</Badge>
              </div>
              <p className="text-sm font-medium line-clamp-1">{order.title}</p>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-semibold text-foreground">Técnico:</span> {order.tech}
              </p>
              <p>
                <span className="font-semibold text-foreground">Duração:</span> 1h 45m
              </p>
              <p>
                <span className="font-semibold text-foreground">Checklist:</span> 100% Preenchido
              </p>
            </CardContent>
            {canAudit && (
              <CardFooter className="flex justify-between gap-2 pt-0">
                <Button
                  variant="outline"
                  className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleAudit(order.id, false)}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reprovar
                </Button>
                <Button
                  className="w-full bg-success hover:bg-success/90"
                  onClick={() => handleAudit(order.id, true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
        {auditOrders.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            Nenhuma OS pendente de auditoria no momento.
          </div>
        )}
      </div>
    </div>
  )
}
