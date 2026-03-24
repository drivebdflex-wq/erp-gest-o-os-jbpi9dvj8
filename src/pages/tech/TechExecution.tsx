import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MapPin, Camera, PenTool, CheckCircle2, ChevronLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

export default function TechExecution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrderStatus } = useAppStore()
  const order = orders.find((o) => o.id === id)

  const [step, setStep] = useState(order?.status === 'Em Execução' ? 2 : 1)
  const [checks, setChecks] = useState([false, false, false])

  if (!order) return <div className="p-4 text-center mt-20">OS não encontrada.</div>

  const handleCheckIn = () => {
    updateOrderStatus(order.id, 'Em Execução')
    setStep(2)
    toast({
      title: 'Check-in Realizado',
      description: 'Localização GPS capturada. Cronômetro iniciado.',
    })
  }

  const handleCheckout = () => {
    updateOrderStatus(order.id, 'Em Auditoria')
    navigate('/tech')
    toast({ title: 'OS Finalizada', description: 'Enviada para auditoria do supervisor.' })
  }

  return (
    <div className="bg-background min-h-full flex flex-col animate-slide-up">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -ml-2"
          onClick={() => navigate('/tech')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="text-xs font-bold text-primary">{order.id}</div>
          <div className="text-sm font-semibold truncate leading-tight">{order.title}</div>
        </div>
      </div>

      <div className="px-4 py-2 bg-secondary/50">
        <Progress value={(step / 4) * 100} className="h-2" />
        <div className="flex justify-between text-[10px] mt-1 text-muted-foreground font-medium uppercase">
          <span>Check-in</span>
          <span>Execução</span>
          <span>Evidência</span>
          <span>Checkout</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-24">
        {step === 1 && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full pt-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Chegou no local?</h2>
              <p className="text-sm text-muted-foreground px-4">
                Confirme seu check-in para registrar o tempo de atendimento e liberar o checklist.
              </p>
            </div>
            <Card className="w-full bg-secondary/30 border-dashed">
              <CardContent className="p-4 text-center text-sm font-mono text-muted-foreground">
                GPS: -23.5505, -46.6333
                <br />
                Precisão: 4m
              </CardContent>
            </Card>
            <Button
              size="lg"
              className="w-full h-14 text-lg mt-8 rounded-xl shadow-lg"
              onClick={handleCheckIn}
            >
              Fazer Check-in Oficial
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Checklist Obrigatório
            </h3>
            <Card>
              <CardContent className="p-0 divide-y">
                {[
                  'Verificar integridade dos cabos',
                  'Medir tensão do equipamento',
                  'Limpeza da área de trabalho',
                ].map((task, i) => (
                  <div key={i} className="flex items-start space-x-3 p-4">
                    <Checkbox
                      id={`task-${i}`}
                      checked={checks[i]}
                      onCheckedChange={(c) => {
                        const newChecks = [...checks]
                        newChecks[i] = c as boolean
                        setChecks(newChecks)
                      }}
                      className="mt-1 w-5 h-5"
                    />
                    <label htmlFor={`task-${i}`} className="text-sm leading-snug cursor-pointer">
                      {task}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button
              size="lg"
              className="w-full h-12"
              disabled={!checks.every(Boolean)}
              onClick={() => setStep(3)}
            >
              Avançar para Fotos
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Evidências Fotográficas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 hover:bg-secondary/40 active:scale-95 transition-all">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Foto ANTES</span>
              </div>
              <div className="aspect-square border-2 border-primary rounded-xl overflow-hidden relative">
                <img
                  src="https://img.usecurling.com/p/300/300?q=cable%20repair"
                  className="w-full h-full object-cover"
                  alt="Depois"
                />
                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1">
                  Foto DEPOIS ✓
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full h-12 mt-8" onClick={() => setStep(4)}>
              Ir para Assinatura
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary" /> Assinatura do Cliente
            </h3>
            <Card className="border-2 border-dashed h-48 flex items-center justify-center bg-white relative">
              <span className="text-muted-foreground/40 font-mono rotate-12 text-2xl absolute pointer-events-none">
                Assinar Aqui
              </span>
            </Card>
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-success hover:bg-success/90 rounded-xl shadow-lg mt-8"
              onClick={handleCheckout}
            >
              Finalizar Atendimento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
