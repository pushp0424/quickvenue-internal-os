import { B2C_STAGES, STAGE_CONFIG } from '@/features/b2c/components/b2c-stage-badge'
import { B2CLeadCard, B2CLeadCardData } from '@/features/b2c/components/b2c-lead-card'

interface Props {
  leads: B2CLeadCardData[]
}

export function B2CKanbanBoard({ leads }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
      {B2C_STAGES.map((stage) => {
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
                <B2CLeadCard key={lead.id} lead={lead} variant="kanban" />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
