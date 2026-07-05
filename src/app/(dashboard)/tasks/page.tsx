'use client'

import { TaskModal } from '@/features/tasks/components/task-modal'
import { TaskList } from '@/features/tasks/components/task-list'

export default function TasksPage() {
  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, assign, and track work across the team</p>
        </div>
        <TaskModal />
      </div>

      <TaskList />
    </div>
  )
}
