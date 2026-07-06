'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useCreateGoal, useMyHeadedDepartments } from '@/features/goals/hooks/use-goals'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { useDepartments } from '@/features/employee-profile/hooks/use-employee-profile'
import { GoalScopeType } from '@/services/supabase/goals-services'
import { getWeekStart, getWeekEnd, toLocalDateStr } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SCOPE_LABELS: Record<GoalScopeType, string> = {
  personal: 'Personal', team: 'Team', department: 'Department', city: 'City',
}

export function GoalModal() {
  const { user } = useAuth()
  const roles = user?.roles ?? []
  const isAdmin = hasPermission(roles, 'MANAGE_USERS')
  const isTeamLead = isAdmin || roles.includes('team_lead')
  const isCityLead = isAdmin || roles.includes('city_lead')
  const profileId = user?.profile.id ?? ''

  const { data: headedDepartments } = useMyHeadedDepartments(profileId)
  const { data: allDepartments } = useDepartments()
  const { data: cities } = useCities()
  const isDepartmentHead = isAdmin || (headedDepartments ?? []).length > 0

  const availableScopes: GoalScopeType[] = ['personal']
  if (isTeamLead && user?.profile.team) availableScopes.push('team')
  if (isDepartmentHead) availableScopes.push('department')
  if (isCityLead && user?.profile.city_id) availableScopes.push('city')

  const createGoal = useCreateGoal()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', targetValue: '', unit: '',
    scopeType: 'personal' as GoalScopeType,
    departmentId: '', city: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function reset() {
    setForm({ title: '', targetValue: '', unit: '', scopeType: 'personal', departmentId: '', city: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetValue = Number(form.targetValue)
    if (!form.title.trim() || !targetValue || targetValue <= 0) {
      toast.error('Title and a positive target are required')
      return
    }

    let scopeValue: string | undefined
    if (form.scopeType === 'team') scopeValue = user?.profile.team ?? undefined
    if (form.scopeType === 'city') scopeValue = isAdmin ? form.city || undefined : user?.profile.city_id ?? undefined
    if (form.scopeType === 'department') {
      scopeValue = isAdmin ? form.departmentId || undefined : headedDepartments?.[0]?.id
    }

    const weekStart = getWeekStart(new Date())
    const weekEnd = getWeekEnd(new Date())

    setLoading(true)
    try {
      await createGoal.mutateAsync({
        title: form.title.trim(),
        targetValue,
        unit: form.unit || undefined,
        scopeType: form.scopeType,
        scopeValue,
        periodStart: toLocalDateStr(weekStart),
        periodEnd: toLocalDateStr(weekEnd),
      })
      toast.success('Goal created')
      setOpen(false)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Goal</DialogTitle>
          <DialogDescription>Set a target for this week (Sun–Sat).</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Title <span className="text-red-500">*</span></Label>
            <Input id="goal-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Make 50 calls" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target <span className="text-red-500">*</span></Label>
              <Input id="goal-target" type="number" min="1" value={form.targetValue} onChange={(e) => set('targetValue', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-unit">Unit</Label>
              <Input id="goal-unit" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="calls, leads, %..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Scope</Label>
            <div className="flex flex-wrap gap-2">
              {availableScopes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set('scopeType', s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    form.scopeType === s ? 'bg-[#0244C6] text-white border-[#0244C6]' : 'bg-transparent hover:bg-muted'
                  )}
                >
                  {SCOPE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {form.scopeType === 'department' && isAdmin && (
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => set('departmentId', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent position="popper">
                  {(allDepartments ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.scopeType === 'city' && isAdmin && (
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => set('city', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent position="popper">
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
