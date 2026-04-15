/**
 * Global API Configuration
 *
 * Centralizes the API base URL using Vite environment variables.
 * Ensures the application can seamlessly transition between environments.
 */

// Dynamically determine the API URL based on the environment
export const API_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

  if (envUrl) {
    return envUrl
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('goskip.app')) {
      return `${window.location.origin}/api`
    }
  }

  return '/api'
})()

/**
 * Builds a complete API URL ensuring correct slash placement to avoid malformed URLs.
 *
 * @param path - The endpoint path (e.g., '/orders' or 'orders')
 * @returns The fully constructed URL
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${cleanPath}`
}
