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

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fieldops_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
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
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      const result = await AuthService.login(email, pass)
      setCurrentUser(result.user as any)
      localStorage.setItem('fieldops_user', JSON.stringify(result.user))
      localStorage.setItem('fieldops_token', result.token)
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
