import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import useAuthStore from '@/stores/useAuthStore'
import { SystemPurgeService } from '@/services/business/system-purge.service'

export default function AdvancedSettings() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const { setCompanyLogo, setCompanyName } = useAppStore()
  const authState = useAuthStore() as any
  const userId = authState?.user?.id || 'admin-id'

  const handlePurge = async () => {
    if (confirmText !== 'DELETE') return

    setLoading(true)
    try {
      await SystemPurgeService.purgeAllData(userId)

      setCompanyLogo(null)
      setCompanyName('ERP Gestão OS')

      toast({
        title: 'Sistema resetado com sucesso',
        description: 'Todos os dados de demonstração foram apagados.',
      })

      setOpen(false)
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (error: any) {
      toast({
        title: 'Erro ao limpar dados',
        description: error.message || 'Houve um problema ao resetar o sistema.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <Card className="animate-fade-in border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações destrutivas e irreversíveis que afetam todo o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div>
            <h4 className="font-semibold text-destructive">Limpar Dados do Sistema</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Apaga permanentemente todas as Ordens de Serviço, Contratos, Unidades, Usuários
              (exceto o seu) e arquivos de mídia. Esta ação não pode ser desfeita.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmText('')
              setOpen(true)
            }}
          >
            Apagar Tudo
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Confirmação de Exclusão
              </DialogTitle>
              <DialogDescription>
                Você está prestes a apagar <b>todos os dados</b> do sistema. Esta ação é
                irreversível e removerá ordens de serviço, contratos, unidades e usuários.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Para confirmar, digite <b className="select-all">DELETE</b> no campo abaixo:
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handlePurge}
                disabled={confirmText !== 'DELETE' || loading}
              >
                {loading ? 'Apagando...' : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
