import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ServiceOrdersService } from '@/services/service-orders/service-orders.service'
import { ServiceOrder } from '@/services/service-orders/service-orders.types'
import {
  ServiceOrderChecklistsRepository,
  ChecklistItemsRepository,
} from '@/services/repositories/checklists.repository'
import { PhotosRepository } from '@/services/repositories/auxiliary.repository'
import { ChecklistsService } from '@/services/business/checklists.service'
import { CheckCircle2, Play, Camera, PenTool, ClipboardList, Box, Check } from 'lucide-react'

export default function TechExecution() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [checklists, setChecklists] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])

  useEffect(() => {
    loadOrderData()
  }, [id])

  const loadOrderData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await ServiceOrdersService.getServiceOrderById(id)
      setOrder(data)

      const allSoChecklists = await ServiceOrderChecklistsRepository.findAll()
      setChecklists(allSoChecklists.filter((c) => c.service_order_id === id))

      const allPhotos = await PhotosRepository.findAll()
      setPhotos(allPhotos.filter((p) => p.related_entity_id === id))
    } catch (error) {
      toast({ title: 'Erro', description: 'OS não encontrada', variant: 'destructive' })
      navigate('/tech')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await ServiceOrdersService.updateServiceOrderStatus(id!, newStatus as any)
      toast({ title: 'Sucesso', description: `Status alterado para ${newStatus}` })
      loadOrderData()
    } catch (error: any) {
      toast({
        title: 'Atenção - Regra de Negócio',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const mockCompleteChecklist = async (soChecklistId: string) => {
    try {
      const items = await ChecklistItemsRepository.findAll()
      const reqItems = items.filter((i) => i.is_required)

      for (const item of reqItems) {
        await ChecklistsService.addResponse({
          service_order_checklist_id: soChecklistId,
          checklist_item_id: item.id,
          response_boolean: true,
          response_number: 100,
        })
      }
      toast({ title: 'Sucesso', description: 'Checklist preenchido e completado' })
      loadOrderData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const mockAddPhoto = async (type: string) => {
    await PhotosRepository.create({
      related_entity_type: type,
      related_entity_id: id!,
      storage_url: `https://img.usecurling.com/p/400/300?q=maintenance&color=gray&dpr=1&seed=${Math.random()}`,
      uploaded_by: 'tech-user-id',
    })
    toast({ title: 'Foto Adicionada', description: `Foto ${type} salva com sucesso.` })
    loadOrderData()
  }

  const mockSignDocument = async () => {
    await ServiceOrdersService.updateServiceOrder(id!, {
      customer_signature_url: 'https://img.usecurling.com/p/200/100?q=signature&color=black',
    })
    toast({ title: 'Assinatura Coletada', description: 'Assinatura salva com sucesso.' })
    loadOrderData()
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (!order) return null

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OS #{order.id.split('-')[0]}</h1>
          <p className="text-muted-foreground">{order.description}</p>
        </div>
        <Badge
          variant={order.status === 'in_progress' ? 'default' : 'secondary'}
          className="text-lg px-4 py-1"
        >
          {order.status.toUpperCase()}
        </Badge>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex gap-4 justify-center flex-wrap">
            {order.status === 'pending' && (
              <Button
                size="lg"
                onClick={() => handleStatusChange('scheduled')}
                className="w-40 bg-blue-600 hover:bg-blue-700"
              >
                Agendar
              </Button>
            )}

            {order.status === 'scheduled' && (
              <Button
                size="lg"
                onClick={() => handleStatusChange('deslocamento')}
                className="w-48 bg-purple-600 hover:bg-purple-700"
              >
                Iniciar Deslocamento
              </Button>
            )}

            {order.status === 'deslocamento' && (
              <Button size="lg" onClick={() => handleStatusChange('in_progress')} className="w-48">
                <Play className="mr-2 h-5 w-5" /> Iniciar Execução
              </Button>
            )}

            {order.status === 'in_progress' && (
              <>
                <Button
                  size="lg"
                  onClick={() => handleStatusChange('paused')}
                  className="w-40 bg-yellow-600 hover:bg-yellow-700"
                >
                  Pausar
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleStatusChange('in_audit')}
                  className="w-48 bg-indigo-600 hover:bg-indigo-700"
                >
                  Enviar p/ Auditoria
                </Button>
              </>
            )}

            {order.status === 'paused' && (
              <Button
                size="lg"
                onClick={() => handleStatusChange('in_progress')}
                className="w-48 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="mr-2 h-5 w-5" /> Retomar
              </Button>
            )}

            {order.status === 'in_audit' && (
              <>
                <Button
                  size="lg"
                  onClick={() => handleStatusChange('completed')}
                  className="w-48 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Aprovar (Finalizar)
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleStatusChange('rejected')}
                  className="w-40 bg-red-600 hover:bg-red-700"
                >
                  Rejeitar
                </Button>
              </>
            )}

            {order.status === 'rejected' && (
              <Button
                size="lg"
                onClick={() => handleStatusChange('in_progress')}
                className="w-48 bg-yellow-600 hover:bg-yellow-700"
              >
                <Play className="mr-2 h-5 w-5" /> Retomar Execução
              </Button>
            )}
          </div>

          <div className="mt-4 text-sm text-center text-muted-foreground">
            A transição de status segue rigorosamente a regra: Pendente &rarr; Agendado &rarr;
            Deslocamento &rarr; Em Execução &rarr; (Pausado / Auditoria) &rarr; Finalizada.
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="checklist">
            Checklist
            {checklists.every((c) => c.status === 'completed') && checklists.length > 0 && (
              <Check className="w-3 h-3 ml-1 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="photos">
            Fotos & Ass.
            {order.customer_signature_url && photos.length >= 2 && (
              <Check className="w-3 h-3 ml-1 text-green-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Status</p>
                <Badge
                  variant={order.sla_status === 'breached' ? 'destructive' : 'outline'}
                  className="mt-1"
                >
                  {order.sla_status || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Total</p>
                <p className="text-xl font-semibold">{order.total_duration_minutes || 0} min</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4 space-y-4">
          {checklists.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Checklist de Manutenção</CardTitle>
                  <Badge variant={c.status === 'completed' ? 'default' : 'secondary'}>
                    {c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {c.status !== 'completed' ? (
                  <Button
                    onClick={() => mockCompleteChecklist(c.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" /> Preencher Automaticamente (Mock)
                  </Button>
                ) : (
                  <p className="text-sm text-green-600 font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Todas as respostas registradas
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {checklists.length === 0 && (
            <p className="text-muted-foreground">Nenhum checklist vinculado.</p>
          )}
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
              <Box className="h-12 w-12 mb-4 opacity-50" />
              <p>Módulo de controle de materiais.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidências Fotográficas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={
                    photos.some((p) => p.related_entity_type === 'service_order_initial')
                      ? 'secondary'
                      : 'default'
                  }
                  onClick={() => mockAddPhoto('service_order_initial')}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" /> Foto Inicial
                </Button>
                <Button
                  variant={
                    photos.some((p) => p.related_entity_type === 'service_order_final')
                      ? 'secondary'
                      : 'default'
                  }
                  onClick={() => mockAddPhoto('service_order_final')}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" /> Foto Final
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative aspect-video rounded-md overflow-hidden border"
                  >
                    <img
                      src={p.storage_url}
                      alt="Evidência"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-white text-center">
                      {p.related_entity_type.replace('service_order_', '')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assinatura do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.customer_signature_url ? (
                <Button onClick={mockSignDocument} variant="outline" className="w-full">
                  <PenTool className="w-4 h-4 mr-2" /> Coletar Assinatura (Mock)
                </Button>
              ) : (
                <div className="border rounded-md p-4 bg-white flex justify-center">
                  <img
                    src={order.customer_signature_url}
                    alt="Assinatura"
                    className="h-20 mix-blend-multiply"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
