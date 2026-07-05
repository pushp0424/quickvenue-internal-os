'use client'

import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useDirectReportIds } from '@/features/leave/hooks/use-leaves'
import { LeaveBalanceCards } from '@/features/leave/components/leave-balance-cards'
import { ApplyLeaveModal } from '@/features/leave/components/apply-leave-modal'
import { MyLeavesList } from '@/features/leave/components/my-leaves-list'
import { PendingApprovalsList } from '@/features/leave/components/pending-approvals-list'
import { TeamLeaveCalendar } from '@/features/leave/components/team-leave-calendar'
import { SectionHeader } from '@/components/shared/section-header'

export default function LeavesPage() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const roles = user?.roles ?? []
  const isHR = hasPermission(roles, 'MANAGE_HR')

  const { data: reportIds } = useDirectReportIds(!isHR ? profileId : undefined)
  const isManager = isHR || (reportIds?.length ?? 0) > 0

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Apply for leave and track your balance</p>
        </div>
        <ApplyLeaveModal />
      </div>

      <div>
        <SectionHeader title="Leave Balance" subtitle="This calendar year" />
        <div className="mt-4">
          <LeaveBalanceCards profileId={profileId} />
        </div>
      </div>

      {isManager && (
        <div>
          <SectionHeader title="Pending Approvals" subtitle={isHR ? 'Requests awaiting HR or manager sign-off' : 'Requests from your direct reports'} />
          <div className="mt-4">
            <PendingApprovalsList profileId={profileId} isHR={isHR} />
          </div>
        </div>
      )}

      {isManager && (
        <div>
          <TeamLeaveCalendar managerId={isHR ? undefined : profileId} />
        </div>
      )}

      <div>
        <SectionHeader title="My Leaves" subtitle="Your leave request history" />
        <div className="mt-4">
          <MyLeavesList profileId={profileId} />
        </div>
      </div>
    </div>
  )
}
