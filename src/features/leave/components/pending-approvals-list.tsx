'use client'

import { useState } from 'react'
import { usePendingApprovals, useDecideLeave } from '@/features/leave/hooks/use-leaves'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Check, X, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

interface Props {
  profileId: string
  isHR: boolean
}

export function PendingApprovalsList({ profileId, isHR }: Props) {
  const { data: leaves, isLoading } = usePendingApprovals({ managerId: profileId, isHR })
  const decideLeave = useDecideLeave()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  async function handleApprove(id: string) {
    try {
      await decideLeave.mutateAsync({ id, decision: 'approve', actingAsHR: isHR, actingUserId: profileId })
      toast.success('Leave approved')
    } catch {
      toast.error('Failed to approve leave')
    }
  }

  async function handleReject() {
    if (!rejectingId) return
    try {
      await decideLeave.mutateAsync({ id: rejectingId, decision: 'reject', actingAsHR: isHR, actingUserId: profileId, rejectionReason: rejectionReason || undefined })
      toast.success('Leave rejected')
      setRejectingId(null)
      setRejectionReason('')
    } catch {
      toast.error('Failed to reject leave')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!leaves || leaves.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">Nothing waiting on your approval.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0 divide-y">
          {leaves.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-6 py-4">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-bold bg-[#0244C6] text-white">
                  {initials(l.profile?.full_name ?? '?')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{l.profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {l.leave_type?.name} · {formatDate(l.start_date)} – {formatDate(l.end_date)} · {l.days} day{l.days !== 1 ? 's' : ''}
                </p>
                {l.reason && <p className="text-xs text-muted-foreground italic truncate">&quot;{l.reason}&quot;</p>}
              </div>
              <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 shrink-0" onClick={() => handleApprove(l.id)} title="Approve">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 shrink-0" onClick={() => setRejectingId(l.id)} title="Reject">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject leave request?</AlertDialogTitle>
            <AlertDialogDescription>Optionally add a reason for the applicant.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-16"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
