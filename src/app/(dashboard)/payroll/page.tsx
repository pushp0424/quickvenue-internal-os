'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { usePayrollRuns, useSlipsForRun } from '@/features/payroll/hooks/use-payroll'
import { GeneratePayrollModal } from '@/features/payroll/components/generate-payroll-modal'
import { PayrollSummaryCards } from '@/features/payroll/components/payroll-summary-cards'
import { SalarySlipsList } from '@/features/payroll/components/salary-slips-list'
import { MySalarySlipsList } from '@/features/payroll/components/my-salary-slips-list'
import { SectionHeader } from '@/components/shared/section-header'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function PayrollPage() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const isHR = hasPermission(user?.roles ?? [], 'MANAGE_HR')

  const { data: runs, isLoading: runsLoading } = usePayrollRuns()
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined)
  const effectiveRunId = selectedRunId ?? runs?.[0]?.id

  const { data: slips, isLoading: slipsLoading } = useSlipsForRun(effectiveRunId)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isHR ? 'Generate payroll and manage salary slips' : 'View your salary slips'}
          </p>
        </div>
        {isHR && <GeneratePayrollModal onGenerated={setSelectedRunId} />}
      </div>

      {isHR && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Payroll run:</span>
            <Select value={effectiveRunId} onValueChange={setSelectedRunId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a run" /></SelectTrigger>
              <SelectContent position="popper">
                {(runs ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {new Date(r.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PayrollSummaryCards slips={slips ?? []} loading={runsLoading || slipsLoading} />

          <div>
            <SectionHeader title="Salary Slips" subtitle="This payroll run" />
            <div className="mt-4">
              <SalarySlipsList payrollId={effectiveRunId} />
            </div>
          </div>
        </>
      )}

      <div>
        <SectionHeader title="My Salary Slips" subtitle="Your salary slip history" />
        <div className="mt-4">
          <MySalarySlipsList profileId={profileId} />
        </div>
      </div>
    </div>
  )
}
