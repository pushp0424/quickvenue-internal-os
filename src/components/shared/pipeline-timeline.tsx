'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  stages: readonly string[]
  labels: Record<string, string>
  currentStage: string
  onSelect: (stage: string) => void
  disabled?: boolean
}

export function PipelineTimeline({ stages, labels, currentStage, onSelect, disabled }: Props) {
  const currentIndex = stages.indexOf(currentStage)

  return (
    <div className="flex items-center w-full overflow-x-auto pb-1">
      {stages.map((stage, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const isLast = i === stages.length - 1

        return (
          <div key={stage} className={cn('flex items-center', !isLast && 'flex-1')}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(stage)}
              className="flex flex-col items-center gap-1.5 shrink-0 group disabled:cursor-not-allowed"
              title={labels[stage]}
            >
              <span
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-colors border-2',
                  isCurrent
                    ? 'bg-[#0244C6] border-[#0244C6] text-white'
                    : isDone
                      ? 'bg-[#0244C6]/15 border-[#0244C6]/40 text-[#0244C6]'
                      : 'bg-muted border-border text-muted-foreground group-hover:border-[#0244C6]/40'
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={cn(
                'text-[10px] whitespace-nowrap',
                isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}>
                {labels[stage]}
              </span>
            </button>
            {!isLast && (
              <div className={cn('h-0.5 flex-1 min-w-4 mx-1 mb-4', isDone ? 'bg-[#0244C6]/40' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
