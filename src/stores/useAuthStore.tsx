import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import { toast } from '@/hooks/use-toast'
import { supabase, isMock } from '@/lib/supabase'
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
  session: any | null
  isAuthenticated: boolean
  isLoading: boolean
  users: User[]
  roles: Role[]
  login: (email: string, pass: string) => Promise<boolean>
  registerUser: (data: any) => Promise<boolean>
  logout: () => Promise<void>
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
  const [session, setSession] = useState<any | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [users, setUsers] = useState<User[]>([])

  const fetchProfile = async (userId: string, email: string, userMetadata?: any) => {
    try {
      if (isMock) {
        return {
          id: userId,
          name: userMetadata?.name || email.split('@')[0],
          email,
          role_id: userMetadata?.role_id || 'role-admin',
          active: true,
          created_at: new Date().toISOString(),
        } as User
      }

      // Fetch extended user metadata from profiles table
      try {
        const profiles = await supabase.request<any[]>(`profiles?id=eq.${userId}&select=*`)
        if (profiles && profiles.length > 0) {
          const profile = profiles[0]
          return {
            id: userId,
            name: profile.full_name || profile.name || userMetadata?.name || email.split('@')[0],
            email,
            role_id: profile.role_id || 'role-tecnico',
            active: profile.active !== false,
            created_at: profile.created_at || new Date().toISOString(),
            avatar_url: profile.avatar_url,
          } as User
        }
      } catch (err) {
        console.warn('Failed to fetch from profiles table, using auth metadata fallback')
      }

      // Fallback to metadata
      return {
        id: userId,
        name: userMetadata?.name || email.split('@')[0],
        email,
        role_id: userMetadata?.role_id || 'role-tecnico',
        active: true,
        created_at: new Date().toISOString(),
      } as User
    } catch (e) {
      console.error('Profile evaluation failed', e)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      setIsLoading(true)
      const { data } = await supabase.auth.getSession()

      if (data.session && mounted) {
        setSession(data.session)
        const profile = await fetchProfile(
          data.session.user.id,
          data.session.user.email,
          data.session.user.user_metadata,
        )
        setCurrentUser(profile)
      }

      if (mounted) {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        if (currentSession) {
          const profile = await fetchProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata,
          )
          setCurrentUser(profile)
        } else {
          setCurrentUser(null)
        }
        setIsLoading(false)
      },
    )

    return () => {
      mounted = false
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })

    if (error) {
      setIsLoading(false)
      toast({
        title: 'Falha no Login',
        description: error.message || 'E-mail ou senha incorretos.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
  }

  const registerUser = async (data: any) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role_id: data.role,
        },
      },
    })
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message || 'Não foi possível criar a conta.',
        variant: 'destructive',
      })
      return false
    }
    return true
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
      setCurrentUser({ ...currentUser, ...u } as User)
    }
  }

  const addRole = (r: Omit<Role, 'id'>) => {
    setRoles((prev) => [...prev, { ...r, id: crypto.randomUUID() }])
  }

  const updateRole = (id: string, r: Partial<Role>) => {
    setRoles((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)))
  }

  if (isLoading) {
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
        session,
        isAuthenticated: !!session && !!currentUser,
        isLoading,
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
