export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = localStorage.getItem('fieldops_token')

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('fieldops_token')
    localStorage.removeItem('fieldops_user')
    window.dispatchEvent(new Event('auth:unauthorized'))

    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return response
}
