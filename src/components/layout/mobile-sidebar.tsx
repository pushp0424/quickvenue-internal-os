'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useAuth } from '@/context/auth-provider'
import { getVisibleNavItems } from '@/lib/nav-config'
import { useUnreadChannelCount } from '@/features/chat/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const navItems = user ? getVisibleNavItems(user.roles) : []
  const { data: unreadChatCount } = useUnreadChannelCount()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[#012775] text-white border-0 w-64 p-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-lg font-bold">
            Quick<span className="text-[#D4AF37]">Venue</span>
          </span>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0244C6] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.href === '/chat' && !!unreadChatCount && (
                  <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}