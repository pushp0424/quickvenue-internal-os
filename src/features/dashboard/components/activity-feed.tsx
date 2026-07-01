'use client'

import { useRecentTeamMembers } from '@/features/dashboard/hooks/use-dashboard-stats'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, CheckCircle } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

export function ActivityFeed() {
  const { data: members, isLoading } = useRecentTeamMembers(8)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No activity yet. Actions will appear here as your team uses the platform.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex gap-4 relative">
                <div className="h-8 w-8 rounded-full bg-[#0244C6]/10 border-2 border-background flex items-center justify-center shrink-0 z-10">
                  <UserPlus className="h-3.5 w-3.5 text-[#0244C6]" />
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{member.full_name}</span>
                    <span className="text-muted-foreground"> joined the platform</span>
                    {member.city && (
                      <span className="text-muted-foreground"> · {member.city}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(member.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}