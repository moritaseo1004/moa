'use client'

import Link from 'next/link'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/priority'
import type { IssueWithRelations } from '@/lib/types'

function DueDateBadge({ dueDate }: { dueDate: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = dueDate < today
  const isToday = dueDate === today
  return (
    <span
      className={cn(
        'text-xs',
        overdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-muted-foreground',
      )}
    >
      {overdue ? '⚠ ' : ''}{dueDate}
    </span>
  )
}

// Visual card only — used both for the real card and the DragOverlay
export function IssueCardContent({
  issue,
  shadow,
}: {
  issue: IssueWithRelations
  shadow?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card px-3 py-2.5 space-y-1.5 select-none',
        shadow && 'shadow-xl ring-1 ring-border',
      )}
    >
      <p className="text-sm font-medium leading-snug line-clamp-3">{issue.title}</p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
            PRIORITY_COLORS[issue.priority],
          )}
        >
          {PRIORITY_LABELS[issue.priority]}
        </span>
        <div className="flex items-center gap-2">
          {issue.due_date && <DueDateBadge dueDate={issue.due_date} />}
          {issue.assignee && (
            <span className="text-xs text-muted-foreground">{issue.assignee.name}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Draggable card with grip handle + link
export function IssueCard({ issue }: { issue: IssueWithRelations }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn('group flex items-start gap-1', isDragging && 'opacity-30')}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        tabIndex={-1}
        className="mt-2.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors"
      >
        <GripVertical size={13} />
      </button>

      {/* Card body — navigates to issue detail */}
      <Link href={`/issue/${issue.id}`} className="flex-1 min-w-0 block">
        <IssueCardContent issue={issue} />
      </Link>
    </div>
  )
}
