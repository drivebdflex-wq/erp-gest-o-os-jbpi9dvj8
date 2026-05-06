import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Wrench,
  User,
  FileText,
  Camera,
  PenTool,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  HardHat,
  FileSignature,
  Activity,
  Printer,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Finalizada':
    case 'completed':
      return 'bg-success hover:bg-success/80 text-success-foreground'
    case 'Em Execução':
    case 'in_progress':
      return 'bg-primary hover:bg-primary/80 text-primary-foreground'
    case 'Pendente':
    case 'pending':
    case 'draft':
      return 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
    default:
      return 'bg-warning hover:bg-warning/80 text-warning-foreground'
  }
}

export default function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { orders } = useAppStore() as any

  const [order, setOrder] = useState<any>(null)
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Cabo flexível 2.5mm', quantity: 10, unitValue: 2.5 },
    { id: 2, name: 'Disjuntor bipolar 20A', quantity: 2, unitValue: 15.0 },
  ])

  useEffect(() => {
    if (id) {
      const foundOrder = orders?.find((o: any) => o.id === id)
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        const orderNumber = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`
        setOrder({
          id: id,
          order_number: orderNumber,
          shortId: id.slice(0, 8),
          title: 'Manutenção Preventiva Padrão',
          status: 'Pendente',
          priority: 'Média',
          client: 'Cliente Indefinido',
          contractName: 'Contrato Não Atribuído',
          serviceType: 'preventiva',
          date: new Date().toISOString(),
          tech: 'Não atribuído',
          unit: 'Sede Principal',
        })
      }
    }
  }, [id, orders])

  const handleSave = () => {
    toast({ title: 'Sucesso', description: 'Alterações da OS foram salvas com sucesso.' })
  }

  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now(), name: '', quantity: 1, unitValue: 0 }])
  }

  const updateMaterial = (mId: number, field: string, value: any) => {
    setMaterials(materials.map((m) => (m.id === mId ? { ...m, [field]: value } : m)))
  }

  const removeMaterial = (mId: number) => {
    setMaterials(materials.filter((m) => m.id !== mId))
  }

  if (!order) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        Carregando Ordem de Serviço...
      </div>
    )
  }

  const materialsTotal = materials.reduce((acc, m) => acc + m.quantity * m.unitValue, 0)
  const displayId = order.order_number || order.shortId || order.id.slice(0, 8).toUpperCase()

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Fila
        </Button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-auto"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button className="gap-2 flex-1 sm:flex-auto" onClick={handleSave}>
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </div>
      </div>

      <Card className="border-t-4 border-t-primary shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r bg-muted/10">
              <div className="flex flex-col gap-1 mb-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                  {displayId}
                </h1>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
                <Badge
                  variant={
                    order.priority === 'Alta' ||
                    order.priority === 'urgent' ||
                    order.priority === 'Emergencial (48h)'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {order.priority}
                </Badge>
              </div>
              <h2 className="text-xl text-muted-foreground font-medium line-clamp-2">
                {order.title}
              </h2>
            </div>

            <div className="p-6 md:w-1/2 grid grid-cols-2 gap-x-6 gap-y-4 text-sm bg-card">
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                  Cliente
                </span>
                <span className="font-semibold truncate" title={order.client}>
                  {order.client || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                  Contrato
                </span>
                <span className="font-semibold truncate" title={order.contractName}>
                  {order.contractName || 'Avulso'}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                  Data de Abertura
                </span>
                <span className="font-semibold">{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                  SLA Status
                </span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> No Prazo
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="geral" className="w-full">
        <div className="bg-card border rounded-lg shadow-sm mb-6 overflow-x-auto">
          <TabsList className="w-full justify-start h-14 bg-transparent p-0 flex whitespace-nowrap">
            <TabsTrigger
              value="geral"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 font-medium flex-1 md:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="materiais"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 font-medium flex-1 md:flex-none"
            >
              <Wrench className="w-4 h-4 mr-2" /> Materiais
            </TabsTrigger>
            <TabsTrigger
              value="evidencias"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 font-medium flex-1 md:flex-none"
            >
              <Camera className="w-4 h-4 mr-2" /> Evidências
            </TabsTrigger>
            <TabsTrigger
              value="assinaturas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 font-medium flex-1 md:flex-none"
            >
              <FileSignature className="w-4 h-4 mr-2" /> Assinaturas
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 font-medium flex-1 md:flex-none"
            >
              <Activity className="w-4 h-4 mr-2" /> Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="geral" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Localidade da Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Agência / Unidade
                    </Label>
                    <Input defaultValue={order.unit || 'Sede Administrativa'} />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground uppercase">Setor / Andar</Label>
                    <Input defaultValue="Térreo - Atendimento" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Endereço Completo
                    </Label>
                    <Input defaultValue="Avenida Principal, 1000 - Centro" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Cidade / Estado
                    </Label>
                    <Input defaultValue="São Paulo - SP" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Ponto de Referência
                    </Label>
                    <Input defaultValue="Ao lado da praça central" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" /> Detalhes do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Solicitação Original
                  </Label>
                  <Textarea
                    defaultValue={order.title}
                    className="min-h-[80px] resize-none"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Diagnóstico Técnico
                  </Label>
                  <Textarea
                    placeholder="Descreva o problema encontrado e sua causa..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Solução Aplicada / Pendências
                  </Label>
                  <Textarea
                    placeholder="O que foi executado e se restou algo pendente..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <HardHat className="w-4 h-4 text-primary" /> Dados de Execução Operacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Técnico Responsável
                  </Label>
                  <Input defaultValue={order.tech || 'Pendente'} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Equipe / Base</Label>
                  <Input defaultValue="Equipe Manutenção 1" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Supervisor Aprovador
                  </Label>
                  <Input defaultValue="Carlos Mendes" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Data de Execução
                  </Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Hora Check-in</Label>
                  <Input type="time" defaultValue="08:30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Hora Check-out</Label>
                  <Input type="time" defaultValue="11:45" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Deslocamento</Label>
                  <Input defaultValue="35 min" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">KM Rodado</Label>
                  <Input type="number" defaultValue="28" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b bg-muted/20 gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  Controle de Materiais Aplicados
                </CardTitle>
                <CardDescription>
                  Registre todos os insumos utilizados nesta Ordem de Serviço.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addMaterial} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Adicionar Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Descrição do Material / Peça</TableHead>
                      <TableHead className="w-[120px]">Quantidade</TableHead>
                      <TableHead className="w-[150px]">Valor Unit. (R$)</TableHead>
                      <TableHead className="w-[150px]">Valor Total (R$)</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum material adicionado a esta OS.
                        </TableCell>
                      </TableRow>
                    ) : (
                      materials.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <Input
                              placeholder="Nome da peça"
                              value={m.name}
                              onChange={(e) => updateMaterial(m.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={m.quantity}
                              onChange={(e) =>
                                updateMaterial(m.id, 'quantity', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={m.unitValue}
                              onChange={(e) =>
                                updateMaterial(m.id, 'unitValue', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium align-middle">
                            R$ {(m.quantity * m.unitValue).toFixed(2)}
                          </TableCell>
                          <TableCell className="align-middle">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeMaterial(m.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {materials.length > 0 && (
                    <TableFooter className="bg-muted/10">
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-semibold text-sm uppercase"
                        >
                          Total Geral Utilizado:
                        </TableCell>
                        <TableCell colSpan={2} className="font-bold text-primary text-base">
                          R$ {materialsTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidencias" className="mt-0 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                Registro Fotográfico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group min-h-[300px]">
                  <div className="w-16 h-16 rounded-full bg-background border shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Evidência "Antes"</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload da foto inicial do equipamento ou local
                  </p>
                </div>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group min-h-[300px]">
                  <div className="w-16 h-16 rounded-full bg-background border shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Evidência "Depois"</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload da foto final após a manutenção
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                Documentação Complementar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group">
                <FileText className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <h3 className="font-bold">Anexar Laudos ou Arquivos</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Arraste e solte arquivos aqui, ou clique para selecionar. Formatos aceitos: PDF,
                  DOCX.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinaturas" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                Termo de Aceite e Validação
              </CardTitle>
              <CardDescription>
                Este documento requer as assinaturas para formalização do serviço prestado.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-card hover:shadow-md transition-shadow">
                  <div className="w-full h-[120px] bg-muted/20 border-b-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4 rounded-t-lg">
                    <span
                      className="text-muted-foreground/40 italic text-2xl"
                      style={{ fontFamily: 'cursive' }}
                    >
                      Assinatura Técnico
                    </span>
                  </div>
                  <h4 className="font-bold text-sm uppercase mb-1 text-center">
                    Técnico Responsável
                  </h4>
                  <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                    {order.tech || 'Não Atribuído'}
                  </p>
                  <Button variant="outline" className="w-full">
                    <PenTool className="w-4 h-4 mr-2" /> Assinar
                  </Button>
                </div>

                <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-card hover:shadow-md transition-shadow">
                  <div className="w-full h-[120px] bg-muted/20 border-b-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4 rounded-t-lg">
                    <span
                      className="text-muted-foreground/40 italic text-2xl"
                      style={{ fontFamily: 'cursive' }}
                    >
                      Assinatura Cliente
                    </span>
                  </div>
                  <h4 className="font-bold text-sm uppercase mb-1 text-center">
                    Cliente / Recebedor
                  </h4>
                  <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                    Representante no Local
                  </p>
                  <Button variant="outline" className="w-full">
                    <PenTool className="w-4 h-4 mr-2" /> Assinar
                  </Button>
                </div>

                <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-card hover:shadow-md transition-shadow">
                  <div className="w-full h-[120px] bg-muted/20 border-b-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4 rounded-t-lg">
                    <span
                      className="text-muted-foreground/40 italic text-2xl"
                      style={{ fontFamily: 'cursive' }}
                    >
                      Assinatura Gestor
                    </span>
                  </div>
                  <h4 className="font-bold text-sm uppercase mb-1 text-center">
                    Supervisor / Validador
                  </h4>
                  <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                    Aprovação Final da OS
                  </p>
                  <Button variant="outline" className="w-full">
                    <PenTool className="w-4 h-4 mr-2" /> Assinar
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground text-center">
                Declaro que os serviços descritos nesta ordem de serviço foram executados a contento
                e os materiais listados foram aplicados conforme necessidade técnica e aprovação.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                Timeline Operacional
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pl-4 pr-4">
              <div className="relative pl-8 md:pl-0">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>

                <div className="relative mb-8 md:flex items-center justify-between group">
                  <div className="absolute left-[-2rem] md:left-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-primary text-primary-foreground md:-translate-x-1/2 z-10">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div className="md:w-1/2 pr-8 md:pr-12 md:text-right">
                    <h4 className="font-bold text-base">Ordem de Serviço Aberta</h4>
                    <span className="text-xs text-muted-foreground font-mono inline-block mt-1 bg-muted px-2 py-0.5 rounded">
                      {new Date(order.date).toLocaleString()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      OS foi gerada no sistema via fluxo centralizado. Categoria:{' '}
                      {order.serviceType}.
                    </p>
                  </div>
                  <div className="hidden md:block md:w-1/2 pl-12"></div>
                </div>

                <div className="relative mb-8 md:flex items-center justify-between group">
                  <div className="absolute left-[-2rem] md:left-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-secondary text-secondary-foreground md:-translate-x-1/2 z-10">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="hidden md:block md:w-1/2 pr-12"></div>
                  <div className="md:w-1/2 pl-0 md:pl-12">
                    <h4 className="font-bold text-base">Técnico Atribuído</h4>
                    <span className="text-xs text-muted-foreground font-mono inline-block mt-1 bg-muted px-2 py-0.5 rounded">
                      Logo após abertura
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      OS roteirizada e repassada para {order.tech || 'o técnico responsavel'}.
                    </p>
                  </div>
                </div>

                <div className="relative mb-0 md:flex items-center justify-between group">
                  <div className="absolute left-[-2rem] md:left-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-muted text-muted-foreground md:-translate-x-1/2 z-10">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="md:w-1/2 pr-8 md:pr-12 md:text-right">
                    <h4 className="font-bold text-base text-muted-foreground">
                      Em Progresso (Previsto)
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono inline-block mt-1 bg-muted/50 px-2 py-0.5 rounded">
                      Aguardando check-in no local
                    </span>
                    <p className="text-sm text-muted-foreground mt-2 opacity-70">
                      O técnico iniciará os trabalhos na unidade e registrará as evidências e
                      materiais.
                    </p>
                  </div>
                  <div className="hidden md:block md:w-1/2 pl-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
