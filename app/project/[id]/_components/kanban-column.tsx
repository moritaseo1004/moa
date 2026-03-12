'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_HEADER_BOX, STATUS_COLUMN_SURFACE } from '@/lib/status'
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
    <div className="min-w-0 flex flex-col gap-2">
      {/* Column header */}
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border px-3 py-2',
          STATUS_HEADER_BOX[status],
        )}
      >
        <span className="text-xs font-semibold tracking-wide">{STATUS_LABELS[status]}</span>
        <span className="text-sm font-semibold tabular-nums">{issues.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 rounded-xl border p-2.5 min-h-[140px] transition-colors duration-150',
          STATUS_COLUMN_SURFACE[status],
          isOver && 'ring-1 ring-primary/40',
        )}
      >
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
