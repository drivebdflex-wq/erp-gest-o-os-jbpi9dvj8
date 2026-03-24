import { BusinessError } from '@/services/business/errors'
import { UserRolesRepository, RolesRepository } from '@/services/repositories/users.repository'

export interface AuthContext {
  userId: string
  roles: string[]
}

export class AuthGuard {
  static async verify(token?: string): Promise<AuthContext> {
    if (!token) {
      throw new BusinessError('Unauthorized: Missing authentication token')
    }

    try {
      const payloadStr = atob(token.replace('Bearer ', ''))
      const payload = JSON.parse(payloadStr)

      if (!payload.sub || !payload.exp) {
        throw new Error()
      }

      if (payload.exp < Date.now()) {
        throw new BusinessError('Unauthorized: Token expired')
      }

      const userRoles = await UserRolesRepository.findByUserId(payload.sub)
      const allRoles = await RolesRepository.findAll()

      const roles = userRoles
        .map((ur) => allRoles.find((r) => r.id === ur.role_id)?.name)
        .filter(Boolean) as string[]

      return {
        userId: payload.sub,
        roles,
      }
    } catch (e) {
      if (e instanceof BusinessError) throw e
      throw new BusinessError('Unauthorized: Invalid token format')
    }
  }

  static requireRoles(context: AuthContext, allowedRoles: string[]) {
    if (context.roles.includes('Administrator')) {
      return // Admin has full access
    }

    const hasRole = context.roles.some((role) => allowedRoles.includes(role))
    if (!hasRole) {
      throw new BusinessError(`Forbidden: Requires one of roles: ${allowedRoles.join(', ')}`)
    }
  }
}
