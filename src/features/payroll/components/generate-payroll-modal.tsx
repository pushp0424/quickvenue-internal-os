'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useGeneratePayroll } from '@/features/payroll/hooks/use-payroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onGenerated?: (payrollId: string) => void
}

export function GeneratePayrollModal({ onGenerated }: Props) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const generatePayroll = useGeneratePayroll()

  async function handleGenerate() {
    try {
      const monthDate = `${month}-01`
      const payrollRow = await generatePayroll.mutateAsync({ month: monthDate, generatedById: user!.profile.id })
      toast.success('Payroll generated')
      setOpen(false)
      onGenerated?.((payrollRow as unknown as { id: string }).id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate payroll')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]">
          <Play className="h-4 w-4" />
          Generate Payroll
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
          <DialogDescription>
            Computes salary slips for every employee with financial details set. Re-running for the same month recomputes it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 pt-2">
          <Label htmlFor="payrollMonth">Month</Label>
          <Input id="payrollMonth" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={generatePayroll.isPending}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={generatePayroll.isPending} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
            {generatePayroll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
