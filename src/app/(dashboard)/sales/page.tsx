'use client'

import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { useSalesDashboard } from '@/features/sales/hooks/use-sales-dashboard'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { BreakdownBarCard } from '@/components/shared/breakdown-bar-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp, CheckCircle2, Wallet, Sparkles, Trophy, Building2, Users, ArrowUpRight,
} from 'lucide-react'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const RANK_COLORS = ['text-[#D4AF37]', 'text-slate-400', 'text-amber-700']

export default function SalesDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useSalesDashboard()

  const firstName = user?.profile.full_name.split(' ')[0] ?? ''
  const winRate = data && data.overview.totalLeads > 0
    ? Math.round((data.overview.wonCount / data.overview.totalLeads) * 100)
    : 0

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
          Combined B2B + B2C pipeline performance across the org
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads" value={data?.overview.totalLeads ?? 0} sub="B2B + B2C"
          icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading}
        />
        <StatCard
          label="Won" value={data?.overview.wonCount ?? 0} sub={`${winRate}% win rate`}
          icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950"
          trend={{ value: winRate, positive: true }} loading={isLoading}
        />
        <StatCard
          label="Revenue Won" value={inr(data?.overview.totalRevenue ?? 0)} sub="Deal value + bookings"
          icon={Wallet} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950" loading={isLoading}
        />
        <StatCard
          label="New This Week" value={data?.overview.newThisWeek ?? 0} sub="Sun–Sat"
          icon={Sparkles} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="Recent Leads"
            subtitle="Latest activity across B2B and B2C"
          />
          <Card className="mt-4">
            <CardContent className="p-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : !data || data.recentLeads.length === 0 ? (
                <div className="py-16 text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No leads yet</p>
                </div>
              ) : (
                data.recentLeads.map((lead) => (
                  <Link
                    key={`${lead.type}-${lead.id}`}
                    href={lead.type === 'b2b' ? `/b2b/${lead.id}` : `/b2c/${lead.id}`}
                    className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                      {lead.type === 'b2b' ? <Building2 className="h-4 w-4 text-[#0244C6]" /> : <Users className="h-4 w-4 text-[#0244C6]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{lead.name}</p>
                        <Badge variant="secondary" className="text-[9px] uppercase">{lead.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.cityName && `${lead.cityName} · `}
                        {lead.assigneeName ?? 'Unassigned'}
                      </p>
                    </div>
                    <Badge className="text-[10px] border-0 bg-muted text-muted-foreground capitalize shrink-0">
                      {lead.stage.replace(/_/g, ' ')}
                    </Badge>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-[#D4AF37]" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : !data || data.leaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No won leads yet</p>
              ) : (
                data.leaderboard.map((rep, i) => (
                  <div key={rep.profileId} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 shrink-0 text-center ${RANK_COLORS[i] ?? 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                        {initials(rep.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rep.fullName}</p>
                      <p className="text-xs text-muted-foreground">{rep.wonCount} won</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{inr(rep.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <BreakdownBarCard
            title="Leads by City"
            loading={isLoading}
            data={(data?.cityBreakdown ?? []).map((c) => ({ label: c.cityName, value: c.leadCount }))}
          />
        </div>
      </div>
    </div>
  )
}
