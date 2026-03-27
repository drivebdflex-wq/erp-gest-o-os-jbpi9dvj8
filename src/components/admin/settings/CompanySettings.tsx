import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { StorageService } from '@/services/storage.service'

export default function CompanySettings() {
  const [loading, setLoading] = useState(false)
  const { companyLogo, setCompanyLogo, companyName, setCompanyName } = useAppStore()
  const [localName, setLocalName] = useState(companyName)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCompanyName(localName)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Perfil atualizado',
        description: 'As informações da empresa e logo foram salvas.',
      })
    }, 600)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const url = await StorageService.uploadImage('company-assets', file)
        setCompanyLogo(url)
        toast({
          title: 'Logo Atualizada',
          description: 'A nova logomarca foi carregada com sucesso.',
        })
      } catch (err: any) {
        toast({ title: 'Erro no Upload', description: err.message, variant: 'destructive' })
      }
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Perfil e Branding da Empresa
        </CardTitle>
        <CardDescription>
          Gerencie as informações públicas e a logomarca oficial do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col gap-3 items-center sm:items-start">
              <Label>Logomarca Global</Label>
              <div className="h-32 w-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground hover:bg-secondary/50 transition-colors relative overflow-hidden group">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Logo"
                    className="absolute inset-0 w-full h-full object-contain p-2 bg-white"
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
                  accept="image/jpeg,image/png"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  onChange={handleFileChange}
                />
                {!companyLogo && (
                  <>
                    <Upload className="h-6 w-6 mb-2 z-10" />
                    <span className="text-xs z-10 font-medium">Fazer Upload</span>
                  </>
                )}
                {companyLogo && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white pointer-events-none z-10">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium text-center px-2">
                      Clique para
                      <br />
                      Substituir
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground w-48 text-center sm:text-left">
                Tamanho recomendado: 400x150px. Formatos permitidos: JPG e PNG.
              </p>
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
                <Input
                  id="companyName"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  required
                />
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
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
