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
  const [user, setUser] = useState<User | null>({ id: 'dev-user', email: 'dev@bdflex.com.br' } as User)
  const [session, setSession] = useState<Session | null>({ access_token: 'mock', refresh_token: 'mock', user: { id: 'dev-user', email: 'dev@bdflex.com.br' } } as unknown as Session)
  const [profile, setProfile] = useState<Profile | null>({
    id: 'dev-user',
    email: 'dev@bdflex.com.br',
    full_name: 'Developer',
    role: 'developer'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Mock developer session bypass
  }, [])

  const signUp = async (email: string, password: string) => {
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    return { error: null }
  }

  const signOut = async () => {
    return { error: null }
  }

  const hasPermission = (_permission: string) => {
    if (profile?.role === 'developer' || profile?.role === 'admin') return true
    return true // Fallback for backwards compatibility
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, signUp, signIn, signOut, loading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}
