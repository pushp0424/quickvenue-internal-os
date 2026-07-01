'use client'

import { useAuth } from '@/context/auth.provider'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LogoutButton } from '@/components/shared/logout-button'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Navbar() {
  const { user, loading } = useAuth()

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <MobileSidebar />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold">{user.profile.full_name}</span>
              <div className="flex gap-1">
                {user.roles.slice(0, 2).map((r) => (
                  <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {formatRole(r)}
                  </Badge>
                ))}
              </div>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                {initials(user.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <LogoutButton />
          </div>
        ) : null}
      </div>
    </header>
  )
}