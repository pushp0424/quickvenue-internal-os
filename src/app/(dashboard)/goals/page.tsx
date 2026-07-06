'use client'

import { KPICards } from '@/features/goals/components/kpi-cards'
import { Leaderboard } from '@/features/goals/components/leaderboard'
import { GoalModal } from '@/features/goals/components/goal-modal'
import { GoalList } from '@/features/goals/components/goal-list'
import { SectionHeader } from '@/components/shared/section-header'

export default function GoalsPage() {
  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Goals & KPI</h1>
          <p className="text-muted-foreground text-sm mt-1">Set targets, track progress, and see how the team is doing</p>
        </div>
        <GoalModal />
      </div>

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader title="Goals" subtitle="This week (Sun–Sat)" />
          <div className="mt-4">
            <GoalList />
          </div>
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}
