'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useCreateTransaction } from '@/features/finance/hooks/use-finance'
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

export function AddTransactionModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const createTransaction = useCreateTransaction()

  const scoped = isCityScoped(user?.roles ?? [])
  const defaultCityId = user?.profile.city_id ?? ''

  const [form, setForm] = useState({
    type: 'income', category: '', amount: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    cityId: defaultCityId, description: '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount) {
      toast.error('Amount is required')
      return
    }
    setLoading(true)
    try {
      await createTransaction.mutateAsync({
        type: form.type,
        category: form.category || undefined,
        amount: Number(form.amount),
        transaction_date: form.transactionDate,
        city_id: (scoped ? defaultCityId : form.cityId) || undefined,
        description: form.description || undefined,
      })
      toast.success('Transaction logged')
      setOpen(false)
      setForm({ type: 'income', category: '', amount: '', transactionDate: new Date().toISOString().slice(0, 10), cityId: defaultCityId, description: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Log a one-off income or expense entry outside of bookings and tracked expenses.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txAmount">Amount (₹) <span className="text-red-500">*</span></Label>
              <Input id="txAmount" type="number" min="0" value={form.amount} onChange={(e) => updateField('amount', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="txDescription">Description</Label>
            <Input id="txDescription" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="e.g. refund, other income" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="txCategory">Category</Label>
              <Input id="txCategory" value={form.category} onChange={(e) => updateField('category', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txDate">Date</Label>
              <Input id="txDate" type="date" value={form.transactionDate} onChange={(e) => updateField('transactionDate', e.target.value)} />
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

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
