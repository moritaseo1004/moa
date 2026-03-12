'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { IssueCard } from './issue-card'
import type { IssueWithRelations, IssueStatus } from '@/lib/types'

export function KanbanColumn({
  status,
  issues,
}: {
  status: IssueStatus
  issues: IssueWithRelations[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col gap-2 w-[230px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">{issues.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-1.5 rounded-xl p-2 min-h-[120px] transition-colors duration-150',
          isOver ? 'bg-muted' : 'bg-muted/40',
        )}
      >
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
