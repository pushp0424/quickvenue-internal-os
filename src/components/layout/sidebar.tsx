'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-provider'
import { getVisibleNavItems } from '@/lib/nav-config'
import { useUnreadChannelCount } from '@/features/chat/hooks/use-chat'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const navItems = user ? getVisibleNavItems(user.roles) : []
  const { data: unreadChatCount } = useUnreadChannelCount()

  return (
    <aside className="hidden md:flex w-64 flex-col shrink-0 bg-[#012775] text-white overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <span className="text-lg font-bold tracking-tight select-none">
          Quick<span className="text-[#D4AF37]">Venue</span>
          <span className="ml-2 text-xs font-normal text-white/50 align-middle">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full bg-white/10 mb-1" />
          ))
        ) : (
          navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#0244C6] text-white shadow-sm'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-white/50')} />
                <span className="truncate">{item.label}</span>
                {item.href === '/chat' && !!unreadChatCount && (
                  <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
                {isActive && !(item.href === '/chat' && !!unreadChatCount) && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                )}
              </Link>
            )
          })
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 shrink-0">
        <p className="text-[11px] text-white/30 font-medium tracking-wide uppercase">
          Quick Venue OS v1.0
        </p>
      </div>
    </aside>
  )
}
