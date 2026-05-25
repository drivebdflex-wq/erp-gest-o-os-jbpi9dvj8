import { useState } from 'react'
import useAuthStore, { AVAILABLE_PERMISSIONS, Permission } from '@/stores/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { ShieldCheck, Info } from 'lucide-react'

export default function RolesSettings() {
  const { roles, updateRole } = useAuthStore()
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '')

  const selectedRole = roles.find((r) => r.id === selectedRoleId)

  const togglePermission = (perm: Permission, checked: boolean) => {
    if (!selectedRole) return
    if (selectedRole.isSystem) {
      toast({
        title: 'Ação Restrita',
        description: 'Permissões do Administrador não podem ser alteradas.',
        variant: 'destructive',
      })
      return
    }

    const newPerms = checked
      ? [...selectedRole.permissions, perm]
      : selectedRole.permissions.filter((p) => p !== perm)

    updateRole(selectedRole.id, { permissions: newPerms })
    toast({
      title: 'Permissões Atualizadas',
      description: 'As alterações foram aplicadas imediatamente para este perfil.',
    })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Papéis e Permissões (RBAC)
        </CardTitle>
        <CardDescription>
          Gerencie o acesso granular aos módulos do sistema. Alterações afetam todos os usuários
          vinculados ao perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex flex-col md:flex-row h-[500px]">
        {/* Sidebar of roles */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/20 p-4 space-y-2 overflow-y-auto">
          <Label className="text-xs uppercase text-muted-foreground mb-2 block">
            Perfis Disponíveis
          </Label>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`p-3 rounded-md cursor-pointer transition-colors border ${
                selectedRoleId === role.id
                  ? 'bg-primary/10 border-primary text-primary font-medium shadow-sm'
                  : 'bg-card hover:bg-muted border-transparent text-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{role.name}</span>
                {role.isSystem && (
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    Sistema
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                {role.description}
              </p>
            </div>
          ))}
        </div>

        {/* Permissions list */}
        <div className="flex-1 p-6 overflow-y-auto bg-card">
          {selectedRole ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold">{selectedRole.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                {selectedRole.isSystem && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-600">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs">
                      Este é um perfil de sistema. Ele possui acesso irrestrito e não pode ser
                      modificado ou excluído.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold border-b pb-2 block w-full">
                  Permissões do Perfil
                </Label>
                <div className="grid gap-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const hasPerm = selectedRole.permissions.includes(perm.id)
                    return (
                      <div
                        key={perm.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          hasPerm ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
                        } ${selectedRole.isSystem ? 'opacity-70' : 'hover:border-primary/50 transition-colors'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={hasPerm}
                            disabled={selectedRole.isSystem}
                            onCheckedChange={(c) => togglePermission(perm.id, !!c)}
                          />
                          <Label
                            htmlFor={`perm-${perm.id}`}
                            className={`font-medium cursor-pointer ${hasPerm ? 'text-primary' : 'text-foreground'}`}
                          >
                            {perm.label}
                          </Label>
                        </div>
                        {hasPerm && (
                          <Badge variant="outline" className="bg-primary text-primary-foreground">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Selecione um perfil para visualizar e editar suas permissões.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
