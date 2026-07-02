'use client'

import { useAuth } from '@/context/auth.provider'
import { useLeadStats } from '@/features/crm/hooks/use-leads'
import { useVenueStats } from '@/features/crm/hooks/use-venues'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { LeadsTable } from '@/features/crm/components/leads-table'
import { LeadPipeline } from '@/features/crm/components/lead-pipeline'
import {
  TrendingUp, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'

export default function SalesDashboard() {
  const { user } = useAuth()
  const { data: leadStats, isLoading: leadsLoading } = useLeadStats()
  const { data: venueStats, isLoading: venueLoading } = useVenueStats()

  const firstName = user?.profile.full_name.split(' ')[0] ?? ''
  const won = leadStats?.byStatus?.['won'] ?? 0
  const negotiating = leadStats?.byStatus?.['negotiating'] ?? 0
  const newLeads = leadStats?.byStatus?.['new'] ?? 0
  const total = leadStats?.total ?? 0
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0

  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Sales Dashboard
          {firstName && (
            <span className="text-muted-foreground font-normal text-lg ml-2">
              — {firstName}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your leads, follow-ups, and pipeline performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={total}
          sub="All time"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950"
          loading={leadsLoading}
        />
        <StatCard
          label="Won"
          value={won}
          sub={`${winRate}% win rate`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          trend={{ value: winRate, positive: true }}
          loading={leadsLoading}
        />
        <StatCard
          label="In Negotiation"
          value={negotiating}
          sub="Needs attention"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950"
          loading={leadsLoading}
        />
        <StatCard
          label="New Leads"
          value={newLeads}
          sub="Not yet contacted"
          icon={AlertCircle}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 dark:bg-purple-950"
          loading={leadsLoading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="All Leads"
            subtitle="Filter by status, search by venue or city"
          />
          <div className="mt-4">
            <LeadsTable />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <LeadPipeline />
        </div>
      </div>
    </div>
  )
}