'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/shared/section-header'
import {
  Code2, Database, Shield, Zap,
  CheckCircle2, Clock, GitBranch,
} from 'lucide-react'

const STACK = [
  { label: 'Next.js', version: '15.x', status: 'stable', icon: Code2 },
  { label: 'TypeScript', version: '5.x', status: 'stable', icon: Code2 },
  { label: 'Tailwind CSS', version: '4.x', status: 'stable', icon: Code2 },
  { label: 'Supabase', version: 'Latest', status: 'stable', icon: Database },
  { label: 'React Query', version: '5.x', status: 'stable', icon: Zap },
  { label: 'shadcn/ui', version: 'Latest', status: 'stable', icon: Code2 },
]

const MODULES = [
  { name: 'Authentication', status: 'done', route: '/sign-in' },
  { name: 'RBAC System', status: 'done', route: '/lib/permissions.ts' },
  { name: 'Founder Dashboard', status: 'done', route: '/founder' },
  { name: 'Admin Dashboard', status: 'done', route: '/admin' },
  { name: 'City Dashboard + Venues', status: 'done', route: '/city' },
  { name: 'Sales Dashboard + Leads', status: 'done', route: '/sales' },
  { name: 'Team Management', status: 'done', route: '/admin/team' },
  { name: 'HR Dashboard', status: 'done', route: '/hr' },
  { name: 'JWT Custom Claims', status: 'pending', route: '' },
  { name: 'Venue Add/Edit Forms', status: 'pending', route: '' },
  { name: 'Lead Detail Page', status: 'pending', route: '' },
  { name: 'File Storage (Avatars)', status: 'pending', route: '' },
]

export default function DeveloperDashboard() {
  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">
          System architecture, module status, and tech stack overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <div>
          <SectionHeader title="Tech Stack" subtitle="Current versions in production" />
          <Card className="mt-4">
            <CardContent className="p-0">
              {STACK.map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-3.5 border-b last:border-0"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#0244C6]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#0244C6]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.version}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Module Status */}
        <div>
          <SectionHeader title="Module Status" subtitle="Build progress tracker" />
          <Card className="mt-4">
            <CardContent className="p-0">
              {MODULES.map((mod, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-3.5 border-b last:border-0"
                >
                  {mod.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mod.name}</p>
                    {mod.route && (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {mod.route}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={`text-[10px] border-0 shrink-0 ${
                      mod.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {mod.status === 'done' ? 'Complete' : 'Pending'}
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