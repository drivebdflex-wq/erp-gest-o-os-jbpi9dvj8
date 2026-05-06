import { supabase } from '@/lib/supabase'

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'))
    await supabase.auth.signOut()

    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return response
}
