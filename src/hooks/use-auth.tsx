import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  signUp: (email: string, password: string) => Promise<{ error: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signOut: () => Promise<{ error: unknown }>
  loading: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockUser = {
      id: 'dev-user',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'dev@bdflex.com.br'
    } as User;
    
    const mockProfile = {
      id: 'dev-user',
      email: 'dev@bdflex.com.br',
      full_name: 'Developer',
      role: 'developer'
    };

    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser
    } as Session;

    setUser(mockUser);
    setSession(mockSession);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const signUp = async (_email: string, _password: string) => {
    return { error: null }
  }

  const signIn = async (_email: string, _password: string) => {
    return { error: null }
  }

  const signOut = async () => {
    return { error: null }
  }

  const hasPermission = (_permission: string) => {
    if (profile?.role === 'developer') return true
    return true // Fallback for backwards compatibility, actual RBAC in useAuthStore
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, signUp, signIn, signOut, loading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}
