'use client'

import { useUpdateB2BLeadStage } from '@/features/b2b/hooks/use-b2b-leads'
import { B2BStageBadge, B2B_STAGES, STAGE_CONFIG } from '@/features/b2b/components/b2b-stage-badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select'

interface Props {
  leadId: string
  stage: string | null
  size?: 'sm' | 'default'
}

export function B2BStageSelect({ leadId, stage, size = 'default' }: Props) {
  const updateStage = useUpdateB2BLeadStage()

  return (
    <Select
      value={stage ?? undefined}
      onValueChange={(v) => updateStage.mutate({ id: leadId, stage: v })}
    >
      <SelectTrigger
        className={size === 'sm'
          ? 'h-7 w-full border-0 shadow-none p-0 [&>svg]:hidden'
          : 'h-7 w-[140px] border-0 shadow-none p-0 [&>svg]:hidden'}
      >
        <B2BStageBadge stage={stage} />
      </SelectTrigger>
      <SelectContent>
        {B2B_STAGES.map((s) => (
          <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
