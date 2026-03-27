import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'

export default function CompanySettings() {
  const [loading, setLoading] = useState(false)
  const { companyLogo, setCompanyLogo } = useAppStore()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: 'Perfil atualizado', description: 'As informações da empresa foram salvas.' })
    }, 600)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Perfil da Empresa
        </CardTitle>
        <CardDescription>
          Gerencie as informações públicas da sua organização e logomarca.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col gap-3 items-center sm:items-start">
              <Label>Logomarca</Label>
              <div className="h-32 w-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground hover:bg-secondary/50 transition-colors relative overflow-hidden group">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Logo"
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                ) : (
                  <img
                    src="https://img.usecurling.com/i?q=company&color=blue"
                    alt="Logo Placeholder"
                    className="absolute inset-0 w-full h-full object-contain p-4 opacity-50 group-hover:opacity-20 transition-opacity"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileChange}
                />
                {!companyLogo && (
                  <>
                    <Upload className="h-6 w-6 mb-2 z-10" />
                    <span className="text-xs z-10 font-medium">Trocar Imagem</span>
                  </>
                )}
                {companyLogo && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white pointer-events-none">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium text-center px-2">Clique para<br/>Alterar</span>
                  </div>
                )}
              </div>
              {companyLogo && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive h-auto py-1"
                  onClick={() => setCompanyLogo(null)}
                >
                  Remover Logo
                </Button>
              )}
            </div>

            <div className="flex-1 grid gap-4 w-full">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nome da Empresa / Razão Social</Label>
                <Input id="companyName" defaultValue="FieldOps Solutions Ltda" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone de Contato</Label>
                  <Input id="phone" defaultValue="(11) 4002-8922" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" defaultValue="Av. Paulista, 1000 - São Paulo, SP" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
