'use client'

import { useState } from 'react'
import { useCreateTask } from '@/features/tasks/hooks/use-tasks'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { useDepartments } from '@/features/employee-profile/hooks/use-employee-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export function TaskModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: teamMembers } = useTeamMembers()
  const { data: cities } = useCities()
  const { data: departments } = useDepartments()
  const createTask = useCreateTask()

  const [form, setForm] = useState({
    title: '', description: '', assigneeIds: [] as string[],
    team: '', department: '', city: '', priority: 'medium' as (typeof PRIORITIES)[number], deadline: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleAssignee(id: string) {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id) ? f.assigneeIds.filter((a) => a !== id) : [...f.assigneeIds, id],
    }))
  }

  function reset() {
    setForm({ title: '', description: '', assigneeIds: [], team: '', department: '', city: '', priority: 'medium', deadline: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setLoading(true)
    try {
      await createTask.mutateAsync({
        title: form.title.trim(),
        description: form.description || undefined,
        assigneeIds: form.assigneeIds,
        team: form.team || undefined,
        department: form.department || undefined,
        city: form.city || undefined,
        priority: form.priority,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      })
      toast.success('Task created')
      setOpen(false)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const selectedNames = (teamMembers ?? [])
    .filter((m) => form.assigneeIds.includes(m.id))
    .map((m) => m.full_name)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>Create and assign a task to one or more people.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} className="min-h-20" />
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between font-normal">
                  <span className="truncate">{selectedNames.length > 0 ? selectedNames.join(', ') : 'Select assignees'}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto w-[--radix-dropdown-menu-trigger-width]">
                {(teamMembers ?? []).map((m) => (
                  <DropdownMenuCheckboxItem
                    key={m.id}
                    checked={form.assigneeIds.includes(m.id)}
                    onCheckedChange={() => toggleAssignee(m.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {m.full_name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="team">Team</Label>
              <Input id="team" value={form.team} onChange={(e) => set('team', e.target.value)} placeholder="e.g. Growth" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department || undefined} onValueChange={(v) => set('department', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent position="popper">
                  {(departments ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.city || undefined} onValueChange={(v) => set('city', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent position="popper">
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v as (typeof PRIORITIES)[number])}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
