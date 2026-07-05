'use client'

import { useUpdateB2CLeadStage } from '@/features/b2c/hooks/use-b2c-leads'
import { B2CStageBadge, B2C_STAGES, STAGE_CONFIG } from '@/features/b2c/components/b2c-stage-badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select'

interface Props {
  leadId: string
  stage: string
}

export function B2CStageSelect({ leadId, stage }: Props) {
  const updateStage = useUpdateB2CLeadStage()

  return (
    <Select
      value={stage}
      onValueChange={(v) => updateStage.mutate({ id: leadId, stage: v })}
    >
      <SelectTrigger className="h-7 w-[150px] border border-input shadow-none px-1.5 cursor-pointer hover:border-ring transition-colors">
        <B2CStageBadge stage={stage} />
      </SelectTrigger>
      <SelectContent position="popper">
        {B2C_STAGES.map((s) => (
          <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
