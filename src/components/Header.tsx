import { useState } from 'react'
import {
  Bell,
  Search,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAuthStore from '@/stores/useAuthStore'
import useNotificationStore from '@/stores/useNotificationStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Header() {
  const { currentUser, roles, logout, updateUser } = useAuthStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const navigate = useNavigate()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', avatar_url: '' })

  const roleName = roles.find((r) => r.id === currentUser?.role_id)?.name || 'Usuário'
  const isTech = currentUser?.role_id === 'role-tecnico'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser) {
      updateUser(currentUser.id, profileForm)
      setIsProfileOpen(false)
    }
  }

  const openProfile = () => {
    setProfileForm({
      name: currentUser?.name || '',
      avatar_url: currentUser?.avatar_url || '',
    })
    setIsProfileOpen(true)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {!isTech && <SidebarTrigger />}
        {!isTech && (
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar OS, cliente..."
              className="w-full bg-secondary/50 pl-9"
            />
          </div>
        )}
        {isTech && <h1 className="text-lg font-bold text-primary">FieldOps Mobile</h1>}
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-fade-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[340px] p-0 shadow-lg" sideOffset={8}>
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
              <span className="text-sm font-semibold">Notificações</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                  Marcar todas lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[360px]">
              {notifications.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 opacity-20" />
                  <p>Nenhuma notificação no momento</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id)
                        if (n.type === 'service_order') navigate('/ordens')
                        else navigate(`/financeiro/contrato/${n.reference_id}`)
                      }}
                      className={cn(
                        'flex cursor-pointer flex-col gap-1 border-b p-4 text-sm transition-colors hover:bg-muted/50',
                        !n.is_read ? 'bg-primary/5' : '',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {n.level === 'info' && (
                          <Info className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
                        )}
                        {n.level === 'warning' && (
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                        {n.level === 'critical' && (
                          <AlertCircle className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <div className="flex flex-col gap-1 w-full">
                          <span className={cn('leading-tight', !n.is_read && 'font-semibold')}>
                            {n.message}
                          </span>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(n.created_at).toLocaleDateString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!n.is_read && (
                          <span className="ml-auto mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border bg-secondary">
                <AvatarImage src={currentUser?.avatar_url} alt="@user" />
                <AvatarFallback>
                  {currentUser?.name ? (
                    currentUser.name.substring(0, 2).toUpperCase()
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{currentUser?.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{roleName}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={openProfile} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle>Meu Perfil</DialogTitle>
              <DialogDescription>
                Atualize suas informações pessoais e foto de perfil.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={profileForm.avatar_url} />
                    <AvatarFallback>
                      {profileForm.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    className="flex-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setProfileForm({ ...profileForm, avatar_url: reader.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Nome Completo</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsProfileOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
