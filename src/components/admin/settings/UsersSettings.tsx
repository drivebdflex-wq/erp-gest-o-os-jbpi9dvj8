import { useState } from 'react'
import useAuthStore, { User } from '@/stores/useAuthStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Search, Plus, UserCog } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { StorageService } from '@/services/storage.service'

export default function UsersSettings() {
  const { users, roles, addUser, updateUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<any>({ active: true, avatar_url: '' })

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleOpen = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        active: user.active,
        avatar_url: user.avatar_url || '',
      })
    } else {
      setEditingUser(null)
      setForm({ active: true, role_id: roles[0]?.id, avatar_url: '' })
    }
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.role_id) return

    if (editingUser) {
      updateUser(editingUser.id, {
        name: form.name,
        email: form.email,
        role_id: form.role_id,
        active: form.active,
        avatar_url: form.avatar_url,
      })
      toast({ title: 'Usuário atualizado', description: 'As alterações foram salvas.' })
    } else {
      addUser({
        name: form.name,
        email: form.email,
        role_id: form.role_id,
        active: form.active,
        avatar_url: form.avatar_url,
        password_hash: 'senha123',
      })
      toast({ title: 'Usuário criado', description: 'Novo membro adicionado com sucesso.' })
    }
    setIsOpen(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const url = await StorageService.uploadImage('user-avatars', file)
        setForm({ ...form, avatar_url: url })
      } catch (err: any) {
        toast({ title: 'Erro no Upload', description: err.message, variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil (Role)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const role = roles.find((r) => r.id === user.role_id)
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border shadow-sm">
                        <AvatarImage src={user.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role?.name || 'Desconhecido'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.active ? 'default' : 'secondary'}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(user)}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
              <DialogDescription>
                Configure as credenciais, avatar e o nível de acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Foto de Perfil (Avatar)</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 shadow-sm">
                    <AvatarImage src={form.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                      {form.name ? form.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-full space-y-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="cursor-pointer"
                      onChange={handleAvatarUpload}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Tamanho máximo: 2MB (JPG/PNG)
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Ex: João Silva"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Perfil de Acesso (Role)</Label>
                <Select
                  value={form.role_id}
                  onValueChange={(v) => setForm({ ...form, role_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 mt-2 shadow-sm">
                <div className="space-y-0.5">
                  <Label>Status da Conta</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Contas inativas não podem fazer login no sistema.
                  </p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(c) => setForm({ ...form, active: c })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
