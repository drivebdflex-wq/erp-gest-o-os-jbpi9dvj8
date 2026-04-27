import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import { toast } from '@/hooks/use-toast'
import { AuthService } from '@/services/business/auth.service'
import { UsersService } from '@/services/business/users.service'
import { Loader2 } from 'lucide-react'

export type Permission =
  | 'view_dashboard'
  | 'manage_contracts'
  | 'create_service_order'
  | 'edit_service_order'
  | 'view_financial'
  | 'manage_users'
  | 'manage_stock'
  | 'manage_fleet'
  | 'view_operational'

export const AVAILABLE_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'view_dashboard', label: 'Ver Dashboard Geral e Fila de OS' },
  { id: 'view_operational', label: 'Acesso Operacional (Equipes, Agenda)' },
  { id: 'manage_contracts', label: 'Gerenciar Contratos' },
  { id: 'create_service_order', label: 'Criar Ordens de Serviço' },
  { id: 'edit_service_order', label: 'Editar/Auditar Ordens de Serviço' },
  { id: 'view_financial', label: 'Acesso Financeiro' },
  { id: 'manage_users', label: 'Gerenciar Usuários e Permissões' },
  { id: 'manage_stock', label: 'Gerenciar Estoque' },
  { id: 'manage_fleet', label: 'Gerenciar Frotas' },
]

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role_id: string
  active: boolean
  created_at: string
  avatar_url?: string
}

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  users: User[]
  roles: Role[]
  login: (email: string, pass: string) => Promise<boolean>
  registerUser: (data: any) => Promise<boolean>
  logout: () => void
  hasPermission: (perm: Permission) => boolean
  addUser: (u: Omit<User, 'id' | 'created_at'>) => void
  updateUser: (id: string, u: Partial<User>) => void
  addRole: (r: Omit<Role, 'id'>) => void
  updateRole: (id: string, r: Partial<Role>) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const MOCK_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Acesso total ao sistema',
    permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
    isSystem: true,
  },
  {
    id: 'role-supervisor',
    name: 'Supervisor',
    description: 'Gestão operacional e de equipes',
    permissions: [
      'view_dashboard',
      'view_operational',
      'create_service_order',
      'edit_service_order',
    ],
  },
  {
    id: 'role-tecnico',
    name: 'Técnico',
    description: 'Acesso restrito via mobile ou campo',
    permissions: ['view_dashboard'],
  },
  {
    id: 'role-financeiro',
    name: 'Financeiro',
    description: 'Gestão de custos e fluxo de caixa',
    permissions: ['view_dashboard', 'view_financial', 'manage_contracts'],
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [isInitializing, setIsInitializing] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('fieldops_user')
        const savedToken = localStorage.getItem('fieldops_token')

        if (savedUser && savedToken) {
          const user = JSON.parse(savedUser)
          setCurrentUser(user)
        }
      } catch (err) {
        localStorage.removeItem('fieldops_user')
        localStorage.removeItem('fieldops_token')
      } finally {
        setIsInitializing(false)
      }
    }

    initAuth()

    const handleUnauthorized = () => {
      setCurrentUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    UsersService.findAll()
      .then((data) => {
        const mapped = data.map((u) => ({
          ...u,
          active: u.status === 'active',
          role_id: u.id === 'admin-id' ? 'role-admin' : 'role-tecnico',
        }))
        setUsers(mapped as any)
      })
      .catch(console.error)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      let result

      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
        })

        if (!response.ok) {
          throw new Error('E-mail ou senha incorretos.')
        }

        result = await response.json()
      } catch (e: any) {
        console.warn('API /auth/login failed, falling back to mock auth', e)
        const mockResult = await AuthService.login(email, pass)
        result = {
          access_token: mockResult.token,
          user: mockResult.user,
        }
      }

      const user = result.user
      const token = result.access_token

      setCurrentUser(user as any)
      localStorage.setItem('fieldops_user', JSON.stringify(user))
      localStorage.setItem('fieldops_token', token)
      return true
    } catch (error: any) {
      toast({
        title: 'Falha no Login',
        description: error.message || 'E-mail ou senha incorretos.',
        variant: 'destructive',
      })
      return false
    }
  }

  const registerUser = async (data: any) => {
    try {
      const newUser = await UsersService.createUser(data)
      setUsers((prev) => [...prev, { ...newUser, active: true, role_id: data.role } as any])
      return true
    } catch (error: any) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message || 'Não foi possível criar a conta.',
        variant: 'destructive',
      })
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('fieldops_user')
    localStorage.removeItem('fieldops_token')
  }

  const hasPermission = useCallback(
    (perm: Permission) => {
      if (!currentUser) return false
      const role = roles.find((r) => r.id === currentUser.role_id)
      if (!role) return false
      if (role.isSystem && role.name === 'Admin') return true
      return role.permissions.includes(perm)
    },
    [currentUser, roles],
  )

  const addUser = (u: Omit<User, 'id' | 'created_at'>) => {
    setUsers((prev) => [
      ...prev,
      { ...u, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any,
    ])
  }

  const updateUser = (id: string, u: Partial<User>) => {
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...u } : x)))
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...u }
      setCurrentUser(updated as any)
      localStorage.setItem('fieldops_user', JSON.stringify(updated))
    }
  }

  const addRole = (r: Omit<Role, 'id'>) => {
    setRoles((prev) => [...prev, { ...r, id: crypto.randomUUID() }])
  }

  const updateRole = (id: string, r: Partial<Role>) => {
    setRoles((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)))
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        roles,
        login,
        registerUser,
        logout,
        hasPermission,
        addUser,
        updateUser,
        addRole,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within AuthProvider')
  return context
}
