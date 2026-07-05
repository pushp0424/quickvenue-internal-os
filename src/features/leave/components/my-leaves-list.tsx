'use client'

import { useMyLeaves } from '@/features/leave/hooks/use-leaves'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_team_lead: { label: 'Pending Manager', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  pending_hr: { label: 'Pending HR', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  profileId: string
}

export function MyLeavesList({ profileId }: Props) {
  const { data: leaves, isLoading } = useMyLeaves(profileId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!leaves || leaves.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No leave requests yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {leaves.map((l) => {
          const status = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.pending_team_lead
          return (
            <div key={l.id} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{l.leave_type?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDate(l.start_date)} – {formatDate(l.end_date)} · {l.days} day{l.days !== 1 ? 's' : ''}
                </p>
                {l.status === 'rejected' && l.rejection_reason && (
                  <p className="text-xs text-red-500 mt-1">Reason: {l.rejection_reason}</p>
                )}
              </div>
              <Badge className={cn('text-xs font-medium border-0 shrink-0', status.className)}>
                {status.label}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
