import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

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
  password_hash: string
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
  login: (email: string, pass: string) => boolean
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

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Administrador Master',
    email: 'admin@fieldops.com',
    password_hash: 'admin123',
    role_id: 'role-admin',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Carlos Silva',
    email: 'carlos@fieldops.com',
    password_hash: 'tech123',
    role_id: 'role-tecnico',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u3',
    name: 'Ana Souza',
    email: 'ana@fieldops.com',
    password_hash: 'sup123',
    role_id: 'role-supervisor',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u4',
    name: 'João Financeiro',
    email: 'fin@fieldops.com',
    password_hash: 'fin123',
    role_id: 'role-financeiro',
    active: true,
    created_at: new Date().toISOString(),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fieldops_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email: string, pass: string) => {
    const user = users.find((u) => u.email === email && u.password_hash === pass)
    if (user) {
      if (!user.active) {
        toast({
          title: 'Acesso Negado',
          description: 'Sua conta está inativa. Contate o administrador.',
          variant: 'destructive',
        })
        return false
      }
      setCurrentUser(user)
      localStorage.setItem('fieldops_user', JSON.stringify(user))
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('fieldops_user')
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
      { ...u, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ])
  }

  const updateUser = (id: string, u: Partial<User>) => {
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...u } : x)))
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...u }
      setCurrentUser(updated)
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
