'use client'

import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useGoals, useUpdateGoalProgress, useDeleteGoal } from '@/features/goals/hooks/use-goals'
import { GoalScopeType } from '@/services/supabase/goals-services'
import { getWeekStart, toLocalDateStr, cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDeleteButton } from '@/components/shared/confirm-delete-button'
import { Target, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const TABS: { key: 'mine' | GoalScopeType | 'all'; label: string }[] = [
  { key: 'mine', label: 'My Goals' },
  { key: 'team', label: 'Team' },
  { key: 'department', label: 'Department' },
  { key: 'city', label: 'City' },
  { key: 'all', label: 'All' },
]

export function GoalList() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const isAdmin = hasPermission(user?.roles ?? [], 'MANAGE_USERS')
  const weekStart = toLocalDateStr(getWeekStart(new Date()))
  const { data: goals, isLoading } = useGoals(weekStart)
  const updateProgress = useUpdateGoalProgress()
  const deleteGoal = useDeleteGoal()
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('mine')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const filtered = useMemo(() => {
    if (!goals) return []
    if (tab === 'mine') return goals.filter((g) => g.scope_type === 'personal' && g.owner_id === profileId)
    if (tab === 'all') return goals
    return goals.filter((g) => g.scope_type === tab)
  }, [goals, tab, profileId])

  function startEdit(id: string, currentValue: number) {
    setEditingId(id)
    setEditValue(String(currentValue))
  }

  async function saveEdit(id: string) {
    const newValue = Number(editValue)
    if (Number.isNaN(newValue) || newValue < 0) {
      toast.error('Enter a valid number')
      return
    }
    try {
      const { justCompleted } = await updateProgress.mutateAsync({ id, newValue })
      if (justCompleted) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
        toast.success('Goal completed! 🎉')
      } else {
        toast.success('Progress updated')
      }
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update progress')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal.mutateAsync(id)
      toast.success('Goal deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete goal')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? 'default' : 'outline'}
            className={tab === t.key ? 'bg-[#0244C6] hover:bg-[#012775]' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No goals here this week</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const pct = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0
            const isEditing = editingId === g.id
            const canEdit = g.owner_id === profileId
            const canDelete = canEdit || isAdmin
            return (
              <Card key={g.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-[#0244C6] text-white text-[10px] font-bold">
                          {g.owner?.full_name ? initials(g.owner.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{g.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {g.owner?.full_name ?? 'Unknown'} · {g.scope_type}{g.scope_value ? ` · ${g.scope_value}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-sm font-semibold', pct >= 100 && 'text-emerald-600')}>
                        {pct}%
                      </span>
                      {canDelete && (
                        <ConfirmDeleteButton
                          iconOnly
                          className="h-7 w-7"
                          title="Delete this goal?"
                          description="This permanently removes the goal and its progress. This cannot be undone."
                          onConfirm={() => handleDelete(g.id)}
                        />
                      )}
                    </div>
                  </div>

                  <Progress value={pct} className={pct >= 100 ? '[&>div]:bg-emerald-500' : undefined} />

                  <div className="flex items-center justify-between gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="h-8 w-24"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <span className="text-xs text-muted-foreground">/ {g.target_value} {g.unit}</span>
                        <Button size="icon" className="h-7 w-7 bg-[#0244C6] hover:bg-[#012775]" onClick={() => saveEdit(g.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {g.current_value} / {g.target_value} {g.unit}
                      </span>
                    )}
                    {canEdit && !isEditing && (
                      <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => startEdit(g.id, g.current_value)}>
                        <Pencil className="h-3 w-3" />
                        Update
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
