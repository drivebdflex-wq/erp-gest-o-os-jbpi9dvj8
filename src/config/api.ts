/**
 * Global API Configuration
 *
 * Centralizes the API base URL using Vite environment variables.
 * Ensures the application can seamlessly transition between environments.
 */

export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'

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
