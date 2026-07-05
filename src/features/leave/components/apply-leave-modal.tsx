'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useLeaveTypes, useApplyForLeave } from '@/features/leave/hooks/use-leaves'
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
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ApplyLeaveModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: leaveTypes } = useLeaveTypes()
  const applyForLeave = useApplyForLeave()

  const [form, setForm] = useState({
    leaveTypeId: '', startDate: '', endDate: '', reason: '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.leaveTypeId || !form.startDate || !form.endDate) {
      toast.error('Leave type and dates are required')
      return
    }
    if (form.endDate < form.startDate) {
      toast.error('End date cannot be before start date')
      return
    }
    setLoading(true)
    try {
      await applyForLeave.mutateAsync({
        profileId: user!.profile.id,
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
        reportingManagerId: user!.profile.reporting_manager_id,
      })
      toast.success('Leave request submitted')
      setOpen(false)
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]">
          <Plus className="h-4 w-4" />
          Apply for Leave
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Submit a leave request for approval.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Leave Type <span className="text-red-500">*</span></Label>
            <Select value={form.leaveTypeId} onValueChange={(v) => set('leaveTypeId', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select leave type" /></SelectTrigger>
              <SelectContent position="popper">
                {(leaveTypes ?? []).map((lt) => (
                  <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
              <Input id="endDate" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" value={form.reason} onChange={(e) => set('reason', e.target.value)} className="min-h-16" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
