import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAppStore from '@/stores/useAppStore'

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (clientId: string) => void
}

export default function CreateClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClientDialogProps) {
  const { createClient, isLoadingOrders } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleSave = async () => {
    if (!formData.name) return
    await createClient({
      id: crypto.randomUUID(),
      ...formData,
    })
    onSuccess?.(formData.name)
    onOpenChange(false)
    setFormData({ name: '', document: '', email: '', phone: '', address: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Cliente *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Razão Social ou Nome Fantasia"
            />
          </div>
          <div className="space-y-2">
            <Label>Documento (CNPJ/CPF)</Label>
            <Input
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoadingOrders}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoadingOrders || !formData.name}>
            Salvar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
