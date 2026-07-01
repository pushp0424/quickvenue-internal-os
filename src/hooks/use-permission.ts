'use client'

import { useAuth } from '@/context/auth-provider'
import { hasPermission, PermissionKey } from '@/lib/permissions'

export function usePermission(permission: PermissionKey): boolean {
  const { user } = useAuth()
  if (!user) return false
  return hasPermission(user.roles, permission)
}

export function useRoles() {
  const { user } = useAuth()
  return user?.roles ?? []
}