'use client'

import { useMemo } from 'react'
import { useLeaveTypes, useMyLeaves } from '@/features/leave/hooks/use-leaves'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'

interface Props {
  profileId: string
}

export function LeaveBalanceCards({ profileId }: Props) {
  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes()
  const { data: myLeaves, isLoading: leavesLoading } = useMyLeaves(profileId)

  const usedByType = useMemo(() => {
    const map = new Map<string, number>()
    const currentYear = new Date().getFullYear()
    ;(myLeaves ?? []).forEach((l) => {
      if (l.status !== 'approved') return
      if (new Date(l.start_date).getFullYear() !== currentYear) return
      map.set(l.leave_type_id, (map.get(l.leave_type_id) ?? 0) + Number(l.days))
    })
    return map
  }, [myLeaves])

  if (typesLoading || leavesLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {(leaveTypes ?? []).map((lt) => {
        const used = usedByType.get(lt.id) ?? 0
        const remaining = lt.annual_days != null ? lt.annual_days - used : null
        return (
          <Card key={lt.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {lt.name}
              </div>
              {remaining != null ? (
                <p className="text-2xl font-bold tracking-tight mt-1">
                  {remaining}<span className="text-sm text-muted-foreground font-normal">/{lt.annual_days} left</span>
                </p>
              ) : (
                <p className="text-2xl font-bold tracking-tight mt-1">
                  {used}<span className="text-sm text-muted-foreground font-normal"> used</span>
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
