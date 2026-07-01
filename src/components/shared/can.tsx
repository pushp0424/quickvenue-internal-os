'use client'

import { PermissionKey } from '@/lib/permissions'
import { usePermission } from '@/hooks/use-permission'

interface CanProps {
  permission: PermissionKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission)
  return allowed ? <>{children}</> : <>{fallback}</>
}