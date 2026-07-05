'use client'

import { useState } from 'react'
import { useFinancialDetails, useUpsertFinancialDetails } from '@/features/employee-profile/hooks/use-employee-profile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  profileId: string
  canEditSalary: boolean
  canEditBank: boolean
}

interface Details {
  salary_basic: number | null
  salary_hra: number | null
  salary_da: number | null
  salary_allowances: number | null
  bank_account_number: string | null
  bank_ifsc: string | null
  bank_upi: string | null
}

export function FinancialDetailsForm({ profileId, canEditSalary, canEditBank }: Props) {
  const { data: details, isLoading } = useFinancialDetails(profileId, true)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <FinancialDetailsFields
      profileId={profileId}
      details={details as Details | null}
      canEditSalary={canEditSalary}
      canEditBank={canEditBank}
    />
  )
}

function FinancialDetailsFields({
  profileId, details, canEditSalary, canEditBank,
}: Props & { details: Details | null }) {
  const upsert = useUpsertFinancialDetails()

  const [form, setForm] = useState({
    salary_basic: details?.salary_basic != null ? String(details.salary_basic) : '',
    salary_hra: details?.salary_hra != null ? String(details.salary_hra) : '',
    salary_da: details?.salary_da != null ? String(details.salary_da) : '',
    salary_allowances: details?.salary_allowances != null ? String(details.salary_allowances) : '',
    bank_account_number: details?.bank_account_number ?? '',
    bank_ifsc: details?.bank_ifsc ?? '',
    bank_upi: details?.bank_upi ?? '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await upsert.mutateAsync({
        profileId,
        input: {
          salary_basic: form.salary_basic ? Number(form.salary_basic) : null,
          salary_hra: form.salary_hra ? Number(form.salary_hra) : null,
          salary_da: form.salary_da ? Number(form.salary_da) : null,
          salary_allowances: form.salary_allowances ? Number(form.salary_allowances) : null,
          bank_account_number: form.bank_account_number || null,
          bank_ifsc: form.bank_ifsc || null,
          bank_upi: form.bank_upi || null,
        },
      })
      toast.success('Financial details updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update financial details')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Salary &amp; Bank Details</h2>
          <span className="text-xs text-muted-foreground">Visible only to you and HR/Founder</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Salary (₹/month)</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salary_basic">Basic</Label>
                <Input id="salary_basic" type="number" min="0" value={form.salary_basic} onChange={(e) => set('salary_basic', e.target.value)} disabled={!canEditSalary} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_hra">HRA</Label>
                <Input id="salary_hra" type="number" min="0" value={form.salary_hra} onChange={(e) => set('salary_hra', e.target.value)} disabled={!canEditSalary} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_da">DA</Label>
                <Input id="salary_da" type="number" min="0" value={form.salary_da} onChange={(e) => set('salary_da', e.target.value)} disabled={!canEditSalary} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_allowances">Allowances</Label>
                <Input id="salary_allowances" type="number" min="0" value={form.salary_allowances} onChange={(e) => set('salary_allowances', e.target.value)} disabled={!canEditSalary} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Bank Details</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input id="bank_account_number" value={form.bank_account_number} onChange={(e) => set('bank_account_number', e.target.value)} disabled={!canEditBank} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank_ifsc">IFSC</Label>
                <Input id="bank_ifsc" value={form.bank_ifsc} onChange={(e) => set('bank_ifsc', e.target.value)} disabled={!canEditBank} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank_upi">UPI ID</Label>
                <Input id="bank_upi" value={form.bank_upi} onChange={(e) => set('bank_upi', e.target.value)} disabled={!canEditBank} />
              </div>
            </div>
          </div>

          {(canEditSalary || canEditBank) && (
            <div className="flex justify-end">
              <Button type="submit" disabled={upsert.isPending} className="bg-[#0244C6] hover:bg-[#012775]">
                {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
