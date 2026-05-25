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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (!currentSession?.user) {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession)
      setUser(initSession?.user ?? null)
      if (!initSession?.user) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data as Profile)
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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
