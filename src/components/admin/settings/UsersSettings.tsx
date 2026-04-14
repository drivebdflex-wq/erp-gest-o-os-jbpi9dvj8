import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, UserCog } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const MOCK_USERS = [
  { id: 1, name: 'Admin Silva', email: 'admin@fieldops.com', role: 'Admin', status: 'Ativo' },
  {
    id: 2,
    name: 'Carlos Silva',
    email: 'carlos@fieldops.com',
    role: 'Technician',
    status: 'Ativo',
  },
  { id: 3, name: 'Ana Souza', email: 'ana@fieldops.com', role: 'Supervisor', status: 'Ativo' },
  {
    id: 4,
    name: 'Marcos Paulo',
    email: 'marcos@fieldops.com',
    role: 'Operator',
    status: 'Inativo',
  },
  { id: 5, name: 'Julia Costa', email: 'julia@fieldops.com', role: 'Auditor', status: 'Ativo' },
]

export default function UsersSettings() {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    toast({ title: 'Usuário convidado', description: 'Um e-mail de convite foi enviado.' })
  }

  return (
    <div className="space-y-4">
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Adicionar Usuário</DialogTitle>
                <DialogDescription>
                  Convide um novo membro para a plataforma e defina seu nível de acesso.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Ex: João Silva" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="joao@empresa.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Papel / Função</Label>
                  <Select required defaultValue="Technician">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Operator">Operador</SelectItem>
                      <SelectItem value="Technician">Técnico</SelectItem>
                      <SelectItem value="Auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enviar Convite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Editar">
                    <UserCog className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
