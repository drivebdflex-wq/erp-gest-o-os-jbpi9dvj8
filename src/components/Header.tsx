import { Bell, Search, LayoutDashboard, Smartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

export default function Header() {
  const { role, setRole } = useAppStore()
  const navigate = useNavigate()

  const handleRoleSwitch = (newRole: 'admin' | 'tech') => {
    setRole(newRole)
    navigate(newRole === 'admin' ? '/' : '/tech')
    toast({
      title: 'Perfil Alterado',
      description: `Visão alterada para ${newRole === 'admin' ? 'Gestão' : 'Técnico'}.`,
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {role === 'admin' && <SidebarTrigger />}
        {role === 'admin' && (
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar OS, cliente..."
              className="w-full bg-secondary/50 pl-9"
            />
          </div>
        )}
        {role === 'tech' && <h1 className="text-lg font-bold text-primary">FieldOps Mobile</h1>}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive animate-pulse-red" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4"
                  alt="@user"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {role === 'admin' ? 'Gestor Master' : 'Carlos Silva'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {role === 'admin' ? 'admin@fieldops.com' : 'Técnico Sênior'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
              Alternar Visão (Teste)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleRoleSwitch('admin')}
              className={role === 'admin' ? 'bg-secondary' : ''}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Painel de Gestão</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleSwitch('tech')}
              className={role === 'tech' ? 'bg-secondary' : ''}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              <span>App do Técnico</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
