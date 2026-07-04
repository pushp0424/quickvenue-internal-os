'use client'

import { useUpdateB2BLeadStage } from '@/features/b2b/hooks/use-b2b-leads'
import { B2B_STAGES, STAGE_CONFIG } from '@/features/b2b/components/b2b-stage-badge'
import { B2BLeadCard, B2BLeadCardData } from '@/features/b2b/components/b2b-lead-card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  leads: B2BLeadCardData[]
}

export function B2BKanbanBoard({ leads }: Props) {
  const updateStage = useUpdateB2BLeadStage()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
      {B2B_STAGES.map((stage, stageIndex) => {
        const stageLeads = leads.filter((l) => l.pipeline_stage === stage)
        return (
          <div key={stage} className="min-w-0">
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-sm font-semibold">{STAGE_CONFIG[stage].label}</p>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {stageLeads.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[80px]">
              {stageLeads.map((lead) => (
                <B2BLeadCard
                  key={lead.id}
                  lead={lead}
                  variant="kanban"
                  stageControl={
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        disabled={stageIndex === 0 || updateStage.isPending}
                        onClick={() => updateStage.mutate({ id: lead.id, stage: B2B_STAGES[stageIndex - 1] })}
                        title="Move to previous stage"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        disabled={stageIndex === B2B_STAGES.length - 1 || updateStage.isPending}
                        onClick={() => updateStage.mutate({ id: lead.id, stage: B2B_STAGES[stageIndex + 1] })}
                        title="Move to next stage"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
