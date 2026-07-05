'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { TaskPriorityBadge } from '@/features/tasks/components/task-priority-badge'
import { TaskStatusBadge } from '@/features/tasks/components/task-status-badge'
import { TaskDetailPanel } from '@/features/tasks/components/task-detail-panel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ListTodo, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportToCSV } from '@/lib/csv-export'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const FILTERS = [
  { key: 'mine', label: 'My Tasks' },
  { key: 'assigned_by_me', label: 'Assigned by Me' },
  { key: 'all', label: 'All' },
] as const

export function TaskList() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const { data: tasks, isLoading } = useTasks()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('mine')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!tasks) return []
    if (filter === 'mine') {
      return tasks.filter((t) => (t.assignees ?? []).some((a) => a.profile?.id === profileId))
    }
    if (filter === 'assigned_by_me') {
      return tasks.filter((t) => t.assigned_by === profileId)
    }
    return tasks
  }, [tasks, filter, profileId])

  function handleExport() {
    exportToCSV(
      filtered.map((t) => ({
        title: t.title,
        assignees: (t.assignees ?? []).map((a) => a.profile?.full_name).filter(Boolean).join('; '),
        priority: t.priority,
        status: t.status,
        deadline: t.deadline ? formatDate(t.deadline) : '',
      })),
      [
        { key: 'title', label: 'Title' },
        { key: 'assignees', label: 'Assignees' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'deadline', label: 'Deadline' },
      ],
      'tasks.csv'
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'outline'}
              className={filter === f.key ? 'bg-[#0244C6] hover:bg-[#012775]' : ''}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No tasks here</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assignees</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const overdue = t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date()
                  return (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedTaskId(t.id)}>
                      <TableCell className="font-medium whitespace-normal max-w-[240px]">{t.title}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {(t.assignees ?? []).slice(0, 4).map((a) => (
                            <Avatar key={a.profile?.id} className="h-6 w-6 border-2 border-background" title={a.profile?.full_name}>
                              <AvatarFallback className="bg-[#0244C6] text-white text-[9px] font-bold">
                                {a.profile?.full_name ? initials(a.profile.full_name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {(t.assignees ?? []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell><TaskPriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className={cn('text-sm', overdue && 'text-red-600 font-medium')}>
                        {t.deadline ? formatDate(t.deadline) : '—'}
                        {overdue && ' (Overdue)'}
                      </TableCell>
                      <TableCell><TaskStatusBadge status={t.status} /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  )
}
