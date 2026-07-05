'use client'

import { useAuth } from '@/context/auth-provider'
import { useB2BLeads } from '@/features/b2b/hooks/use-b2b-leads'
import { useB2CLeads } from '@/features/b2c/hooks/use-b2c-leads'
import { B2BLeadCard, B2BLeadCardData } from '@/features/b2b/components/b2b-lead-card'
import { B2CLeadCard, B2CLeadCardData } from '@/features/b2c/components/b2c-lead-card'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { Card, CardContent } from '@/components/ui/card'
import { B2BLeadsTable } from '@/features/b2b/components/b2b-leads-table'
import { B2CLeadsTable } from '@/features/b2c/components/b2c-leads-table'
import { AddB2BLeadModal } from '@/features/b2b/components/add-b2b-lead-modal'
import { AddB2CLeadModal } from '@/features/b2c/components/add-b2c-lead-modal'
import { ListChecks, CheckCircle2, MapPinned, CalendarClock, AlertTriangle } from 'lucide-react'

const B2B_WON_STAGES = ['onboarded']
const B2C_WON_STAGES = ['booked', 'completed']
const B2C_CLOSED_STAGES = ['booked', 'completed', 'lost']
const B2C_POST_VISIT_STAGES = ['site_visit', 'negotiation', 'booked', 'completed']

function isToday(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function isThisWeek(dateStr: string | null) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return d >= startOfWeek
}

export default function MyCRMDashboard() {
  const { user } = useAuth()
  const userId = user?.profile.id

  const { data: myB2BLeads, isLoading: b2bLoading } = useB2BLeads(
    { assignedTo: userId },
    { enabled: !!userId }
  )
  const { data: myB2CLeads, isLoading: b2cLoading } = useB2CLeads(
    { assignedTo: userId },
    { enabled: !!userId }
  )

  const b2bLeads = (myB2BLeads ?? []) as B2BLeadCardData[]
  const b2cLeads = (myB2CLeads ?? []) as B2CLeadCardData[]

  const b2bTotal = b2bLeads.length
  const b2cTotal = b2cLeads.length
  const totalLeads = b2bTotal + b2cTotal
  const isLoading = b2bLoading || b2cLoading

  const won =
    b2bLeads.filter((l) => B2B_WON_STAGES.includes(l.pipeline_stage ?? '')).length +
    b2cLeads.filter((l) => B2C_WON_STAGES.includes(l.pipeline_stage)).length

  const siteVisitsDone =
    b2bLeads.filter((l) => (l as unknown as { visit_done?: boolean }).visit_done).length +
    b2cLeads.filter((l) => B2C_POST_VISIT_STAGES.includes(l.pipeline_stage)).length

  const wonThisWeek =
    b2bLeads.filter((l) => B2B_WON_STAGES.includes(l.pipeline_stage ?? '') && isThisWeek((l as unknown as { updated_at?: string }).updated_at ?? null)).length +
    b2cLeads.filter((l) => B2C_WON_STAGES.includes(l.pipeline_stage) && isThisWeek((l as unknown as { updated_at?: string }).updated_at ?? null)).length

  const todayB2B = b2bLeads.filter((l) => isToday(l.follow_up_date) && l.pipeline_stage !== 'onboarded')
  const todayB2C = b2cLeads.filter((l) => isToday(l.follow_up_date) && !B2C_CLOSED_STAGES.includes(l.pipeline_stage))
  const followUpsToday = todayB2B.length + todayB2C.length

  const overdueB2B = b2bLeads.filter((l) => isOverdue(l.follow_up_date) && l.pipeline_stage !== 'onboarded')
  const overdueB2C = b2cLeads.filter((l) => isOverdue(l.follow_up_date) && !B2C_CLOSED_STAGES.includes(l.pipeline_stage))
  const overdueTotal = overdueB2B.length + overdueB2C.length

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My CRM</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your assigned leads across the B2B and B2C pipelines
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Leads" value={totalLeads} icon={ListChecks}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading} />
        <StatCard label="Won" value={won} icon={CheckCircle2}
          iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
        <StatCard label="Site Visits Done" value={siteVisitsDone} icon={MapPinned}
          iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" loading={isLoading} />
        <StatCard label="Follow-ups Today" value={followUpsToday} icon={CalendarClock}
          iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={isLoading} />
        <StatCard label="Won This Week" value={wonThisWeek} sub="No weekly target set yet"
          icon={CheckCircle2} iconColor="text-teal-600" iconBg="bg-teal-50 dark:bg-teal-950" loading={isLoading} />
      </div>

      {/* Today's follow-ups */}
      {!isLoading && followUpsToday > 0 && (
        <div>
          <SectionHeader title="Today's Follow-ups" subtitle="Leads you need to contact today" />
          <Card className="mt-4 border-amber-300/50 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20">
            <CardContent className="p-0 divide-y divide-amber-200/60 dark:divide-amber-900/40">
              {todayB2B.map((lead) => <B2BLeadCard key={lead.id} lead={lead} variant="row" />)}
              {todayB2C.map((lead) => <B2CLeadCard key={lead.id} lead={lead} variant="row" />)}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue */}
      {!isLoading && overdueTotal > 0 && (
        <div>
          <SectionHeader title="Overdue" subtitle="Follow-ups that are past their date" />
          <Card className="mt-4 border-red-300/50 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20">
            <CardContent className="p-0 divide-y divide-red-200/60 dark:divide-red-900/40">
              {overdueB2B.map((lead) => <B2BLeadCard key={lead.id} lead={lead} variant="row" />)}
              {overdueB2C.map((lead) => <B2CLeadCard key={lead.id} lead={lead} variant="row" />)}
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && followUpsToday === 0 && overdueTotal === 0 && (
        <Card>
          <CardContent className="py-8 text-center flex flex-col items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No follow-ups due today or overdue. You&apos;re all caught up.</p>
          </CardContent>
        </Card>
      )}

      {/* B2B */}
      <div>
        <SectionHeader
          title="My B2B Leads"
          subtitle="Venue acquisition leads assigned to you"
          action={<AddB2BLeadModal />}
        />
        <div className="mt-4">
          <B2BLeadsTable assignedToMe />
        </div>
      </div>

      {/* B2C */}
      <div>
        <SectionHeader
          title="My B2C Leads"
          subtitle="Customer sales leads assigned to you"
          action={<AddB2CLeadModal />}
        />
        <div className="mt-4">
          <B2CLeadsTable assignedToMe />
        </div>
      </div>
    </div>
  )
}
