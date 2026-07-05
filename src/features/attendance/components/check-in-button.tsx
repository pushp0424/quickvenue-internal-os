'use client'

import { useAuth } from '@/context/auth-provider'
import { useTodayAttendance, useCheckIn, useCheckOut } from '@/features/attendance/hooks/use-attendance'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, LogOut, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const WORK_MODES: { value: string; label: string }[] = [
  { value: 'office', label: 'Check In — Office' },
  { value: 'wfh', label: 'Check In — Work From Home' },
  { value: 'field_visit', label: 'Check In — Field Visit' },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function CheckInButton() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const { data: today, isLoading } = useTodayAttendance(profileId)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()

  if (!user) return null

  if (isLoading) {
    return <Skeleton className="h-9 w-32" />
  }

  async function handleCheckIn(workMode: string) {
    try {
      await checkIn.mutateAsync({ profileId, workMode, cityId: user?.profile.city_id })
      toast.success('Checked in')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check in')
    }
  }

  async function handleCheckOut() {
    try {
      await checkOut.mutateAsync({ profileId })
      toast.success('Checked out')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check out')
    }
  }

  if (today?.check_out_at) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2 rounded-md bg-muted/50">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        Done for today
      </div>
    )
  }

  if (today?.check_in_at) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={handleCheckOut}
        disabled={checkOut.isPending}
      >
        {checkOut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        Check Out
        <span className="hidden md:inline text-muted-foreground">· since {formatTime(today.check_in_at)}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-[#0244C6] hover:bg-[#012775]" disabled={checkIn.isPending}>
          {checkIn.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
          Check In
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {WORK_MODES.map((m) => (
          <DropdownMenuItem key={m.value} onClick={() => handleCheckIn(m.value)}>
            {m.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
