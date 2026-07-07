'use client'

import { useSystemStats } from '@/features/developer/hooks/use-system-stats'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeader } from '@/components/shared/section-header'
import {
  Code2, Database, Shield, Zap, CheckCircle2, GitBranch, Table2,
} from 'lucide-react'

const STACK = [
  { label: 'Next.js', version: '16 (App Router, Proxy)', icon: Code2 },
  { label: 'TypeScript', version: '5.x', icon: Code2 },
  { label: 'Tailwind CSS', version: '4.x', icon: Code2 },
  { label: 'Supabase', version: 'Postgres + Auth + Realtime + Storage', icon: Database },
  { label: 'React Query', version: '5.x', icon: Zap },
  { label: 'shadcn/ui', version: 'Latest', icon: Code2 },
]

// Reflects what is actually shipped (Phases 1–4 complete).
const MODULES = [
  { name: 'Authentication & RBAC', route: '/lib/permissions.ts' },
  { name: 'Server-side route protection', route: '/proxy.ts' },
  { name: 'CRM — B2B / B2C / My Leads', route: '/b2b · /b2c · /crm' },
  { name: 'Operations & Finance', route: '/operations · /finance' },
  { name: 'HRMS — Attendance / Leave / Payroll', route: '/attendance · /leaves · /payroll' },
  { name: 'Employee Profiles', route: '/admin/team' },
  { name: 'Task Management', route: '/tasks' },
  { name: 'Weekly Goals & KPI', route: '/goals' },
  { name: 'Internal Chat (Realtime)', route: '/chat' },
  { name: 'Calendar', route: '/calendar' },
]

export default function DeveloperDashboard() {
  const { data: stats, isLoading } = useSystemStats()

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Live system data, module status, and tech stack overview
        </p>
      </div>

      {/* Live data counts */}
      <div>
        <SectionHeader title="Live Data" subtitle="Row counts pulled from the database" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            : (stats ?? []).map((stat) => (
                <Card key={stat.table}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Table2 className="h-3.5 w-3.5" />
                      {stat.label}
                    </div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums mt-1">{stat.count}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{stat.table}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <div>
          <SectionHeader title="Tech Stack" subtitle="Current versions in production" />
          <Card className="mt-4">
            <CardContent className="p-0">
              {STACK.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-4 px-6 py-3.5 border-b last:border-0">
                    <div className="h-8 w-8 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#0244C6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.version}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px] shrink-0">
                      stable
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Module Status */}
        <div>
          <SectionHeader title="Module Status" subtitle="Shipped modules (Phases 1–4)" />
          <Card className="mt-4">
            <CardContent className="p-0">
              {MODULES.map((mod) => (
                <div key={mod.name} className="flex items-center gap-4 px-6 py-3.5 border-b last:border-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mod.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{mod.route}</p>
                  </div>
                  <Badge className="text-[10px] border-0 shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Complete
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Environment */}
      <div>
        <SectionHeader title="Environment" subtitle="Runtime configuration" />
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Environment', value: process.env.NODE_ENV ?? 'development', icon: GitBranch },
                { label: 'Auth Provider', value: 'Supabase Auth', icon: Shield },
                { label: 'Database', value: 'PostgreSQL (Supabase)', icon: Database },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <Icon className="h-5 w-5 text-[#0244C6] shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
