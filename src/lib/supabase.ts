const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Security check: Secret keys are forbidden in client-side bundles.
// If a secret key is detected, fallback to mock data to prevent runtime blocks.
const isSecretKey =
  SUPABASE_KEY.toLowerCase().includes('secret') ||
  SUPABASE_KEY.toLowerCase().includes('service_role')

export const isMock = !SUPABASE_URL || !SUPABASE_KEY || isSecretKey

type Session = {
  access_token: string
  refresh_token?: string
  user: {
    id: string
    email: string
    user_metadata?: any
    [key: string]: any
  }
}

let currentSession: Session | null = null
let authListeners: Array<(event: string, session: Session | null) => void> = []

function notifyListeners(event: string, session: Session | null) {
  authListeners.forEach((listener) => listener(event, session))
}

function persistSession(session: Session | null) {
  if (session) {
    localStorage.setItem('sb-session', JSON.stringify(session))
  } else {
    localStorage.removeItem('sb-session')
  }
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: any) {
      if (isMock) {
        const mockUser = {
          id: crypto.randomUUID(),
          email,
          user_metadata: { name: 'Usuário Mock' },
        }
        const session = { access_token: 'mock-token', user: mockUser }
        currentSession = session
        persistSession(session)
        notifyListeners('SIGNED_IN', session)
        return { data: { user: mockUser, session }, error: null }
      }

      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro na autenticação')

        currentSession = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user,
        }
        persistSession(currentSession)
        notifyListeners('SIGNED_IN', currentSession)

        return { data: { user: data.user, session: currentSession }, error: null }
      } catch (error: any) {
        return { data: { user: null, session: null }, error }
      }
    },
    async signUp({ email, password, options }: any) {
      if (isMock) {
        return { data: { user: { id: crypto.randomUUID(), email } }, error: null }
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, data: options?.data }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro no cadastro')
        return { data: { user: data.user }, error: null }
      } catch (error: any) {
        return { data: { user: null }, error }
      }
    },
    async signOut() {
      if (!isMock && currentSession) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        }).catch(() => {})
      }
      currentSession = null
      persistSession(null)
      notifyListeners('SIGNED_OUT', null)
      return { error: null }
    },
    async getSession() {
      const stored = localStorage.getItem('sb-session')
      if (stored) {
        try {
          currentSession = JSON.parse(stored)
        } catch {
          currentSession = null
        }
      }
      return { data: { session: currentSession }, error: null }
    },
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      authListeners.push(callback)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners = authListeners.filter((l) => l !== callback)
            },
          },
        },
      }
    },
  },
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (isMock) {
      throw new Error('Supabase not configured securely, using mock data fallback')
    }
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    }

    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`)

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(error.message || 'Supabase request failed')
      }

      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error: any) {
      console.error(`[Supabase Fetch Error] ${options.method || 'GET'} ${path}:`, error.message)
      throw new Error(error.message || 'Network error occurred while contacting the database')
    }
  },
}
