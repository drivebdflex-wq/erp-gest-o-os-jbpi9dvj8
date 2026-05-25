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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (data) {
          setProfile(data as Profile)
        } else {
          setProfile(null)
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (user) {
      void fetchProfile(user.id).then(() => setLoading(false))
    } else {
      setProfile(null)
      setLoading(false)
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
