const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isMock = !SUPABASE_URL || !SUPABASE_KEY

export const supabase = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (isMock) {
      throw new Error('Supabase not configured, use mock data fallback')
    }
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    }

    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`)

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

    return response.json()
  },
}
