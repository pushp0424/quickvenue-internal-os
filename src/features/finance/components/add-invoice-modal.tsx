'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useCreateInvoice, useBookedLeadsForInvoice } from '@/features/finance/hooks/use-finance'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { isCityScoped } from '@/lib/permissions'
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

export function AddInvoiceModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const { data: bookedLeads } = useBookedLeadsForInvoice()
  const createInvoice = useCreateInvoice()

  const scoped = isCityScoped(user?.roles ?? [])
  const defaultCityId = user?.profile.city_id ?? ''

  const [form, setForm] = useState({
    customerName: '', leadId: '', amount: '',
    dueDate: '', cityId: defaultCityId, notes: '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleLeadSelect(leadId: string) {
    const lead = (bookedLeads ?? []).find((l) => l.id === leadId)
    setForm((prev) => ({
      ...prev,
      leadId,
      customerName: lead?.customer_name ?? prev.customerName,
      amount: lead?.booking_amount != null ? String(lead.booking_amount) : prev.amount,
      cityId: lead?.city_id ?? prev.cityId,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName || !form.amount) {
      toast.error('Customer name and amount are required')
      return
    }
    setLoading(true)
    try {
      await createInvoice.mutateAsync({
        customer_name: form.customerName,
        customer_lead_id: form.leadId || undefined,
        amount: Number(form.amount),
        due_date: form.dueDate || undefined,
        city_id: (scoped ? defaultCityId : form.cityId) || undefined,
        notes: form.notes || undefined,
      })
      toast.success('Invoice created')
      setOpen(false)
      setForm({ customerName: '', leadId: '', amount: '', dueDate: '', cityId: defaultCityId, notes: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0244C6] hover:bg-[#012775] gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>Generate an invoice, optionally prefilled from a booked lead.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Link a booked lead (optional)</Label>
            <Select value={form.leadId} onValueChange={handleLeadSelect}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a booked lead" /></SelectTrigger>
              <SelectContent position="popper">
                {(bookedLeads ?? []).map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.customer_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invCustomer">Customer Name <span className="text-red-500">*</span></Label>
            <Input id="invCustomer" value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invAmount">Amount (₹) <span className="text-red-500">*</span></Label>
              <Input id="invAmount" type="number" min="0" value={form.amount} onChange={(e) => updateField('amount', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invDueDate">Due Date</Label>
              <Input id="invDueDate" type="date" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
            </div>
          </div>

          {!scoped && (
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.cityId} onValueChange={(v) => updateField('cityId', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent position="popper">
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="invNotes">Notes</Label>
            <Input id="invNotes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
