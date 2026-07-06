'use client'

import { useState } from 'react'
import { useLeaderboard } from '@/features/goals/hooks/use-goals'
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, toLocalDateStr } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const RANK_COLORS = ['text-[#D4AF37]', 'text-slate-400', 'text-amber-700']

export function Leaderboard() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const now = new Date()
  const start = period === 'week' ? getWeekStart(now) : getMonthStart(now)
  const end = period === 'week' ? getWeekEnd(now) : getMonthEnd(now)
  const { data: entries, isLoading } = useLeaderboard(toLocalDateStr(start), toLocalDateStr(end))

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-[#D4AF37]" />
          Leaderboard
        </CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant={period === 'week' ? 'default' : 'outline'} className={cn('h-7 text-xs', period === 'week' && 'bg-[#0244C6] hover:bg-[#012775]')} onClick={() => setPeriod('week')}>Week</Button>
          <Button size="sm" variant={period === 'month' ? 'default' : 'outline'} className={cn('h-7 text-xs', period === 'month' && 'bg-[#0244C6] hover:bg-[#012775]')} onClick={() => setPeriod('month')}>Month</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : !entries || entries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No personal goals tracked yet</p>
        ) : (
          entries.map((e, i) => (
            <div key={e.ownerId} className="flex items-center gap-3">
              <span className={cn('text-sm font-bold w-5 shrink-0 text-center', RANK_COLORS[i] ?? 'text-muted-foreground')}>
                {i + 1}
              </span>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                  {initials(e.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.fullName}</p>
                <p className="text-xs text-muted-foreground">{e.goalCount} goal{e.goalCount !== 1 ? 's' : ''}</p>
              </div>
              <span className="text-sm font-semibold shrink-0">{e.avgCompletionPct}%</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
