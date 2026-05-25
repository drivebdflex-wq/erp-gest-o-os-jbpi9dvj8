import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Key, MapPin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function IntegrationSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Integrações Salvas',
      description: 'Chaves de API atualizadas com sucesso.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Integrações e APIs
        </CardTitle>
        <CardDescription>
          Gerencie as chaves de acesso para serviços de terceiros utilizados na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-4 border rounded-lg bg-secondary/20 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-emerald-500" />
              Serviços de Mapa (Google Maps)
            </div>
            <p className="text-xs text-muted-foreground">
              Necessário para o módulo de Roteirização Inteligente e cálculo de distâncias.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="gmapsKey">Google Maps API Key</Label>
              <Input
                id="gmapsKey"
                type="password"
                placeholder="AIzaSy..."
                defaultValue="AIzaSyB-mOck3dK3yF0rT3st1ngPvrp0s3s"
                required
              />
            </div>
          </div>

          {/* Adicionar mais integrações no futuro aqui */}

          <div className="flex justify-end">
            <Button type="submit">Salvar Chaves</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
