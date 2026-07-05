'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-provider'
import {
  useNotifications, useUnreadNotificationCount,
  useMarkNotificationRead, useMarkAllNotificationsRead,
} from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationBell() {
  const router = useRouter()
  const { user } = useAuth()
  const recipientId = user?.profile.id ?? ''
  const { data: notifications } = useNotifications(recipientId)
  const { data: unreadCount } = useUnreadNotificationCount(recipientId)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  if (!user) return null

  function handleClick(notification: { id: string; read_at: string | null; link: string | null }) {
    if (!notification.read_at) {
      markRead.mutate({ id: notification.id, recipientId })
    }
    if (notification.link) router.push(notification.link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(unreadCount ?? 0) > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-red-600 text-white border-0">
              {unreadCount! > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-1.5 py-1">
          <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
          {(unreadCount ?? 0) > 0 && (
            <button
              className="text-xs text-[#0244C6] hover:underline"
              onClick={(e) => { e.stopPropagation(); markAllRead.mutate(recipientId) }}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {(!notifications || notifications.length === 0) ? (
          <p className="px-1.5 py-3 text-sm text-muted-foreground text-center">No notifications yet</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn('flex flex-col items-start gap-0.5 py-2 whitespace-normal', !n.read_at && 'bg-accent/50')}
                onClick={() => handleClick(n)}
              >
                <span className="text-sm font-medium">{n.title}</span>
                {n.body && <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
                <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
