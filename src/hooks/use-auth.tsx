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
    // Hardcoded Developer Session bypass
    const mockUser = { id: 'dev-user', email: 'dev@bdflex.com.br' } as User
    const mockSession = {
      access_token: 'mock',
      refresh_token: 'mock',
      user: mockUser,
    } as unknown as Session
    const mockProfile = {
      id: 'dev-user',
      email: 'dev@bdflex.com.br',
      full_name: 'Developer',
      role: 'developer',
    } as Profile

    setUser(mockUser)
    setSession(mockSession)
    setProfile(mockProfile)
    setLoading(false)
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

  const hasPermission = (permission: string) => {
    if (!permission) return false
    if (profile?.role === 'developer' || profile?.role === 'admin') return true
    return true
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, signUp, signIn, signOut, loading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}
