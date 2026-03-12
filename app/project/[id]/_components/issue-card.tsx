'use client'

import Link from 'next/link'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useSyncExternalStore } from 'react'
import { BookOpen, CheckCircle2, Circle, ListTodo, PlayCircle, ScanSearch, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/priority'
import { STATUS_CARD_TINT } from '@/lib/status'
import type { IssueWithRelations, IssueStatus } from '@/lib/types'

const STATUS_ICONS: Record<IssueStatus, LucideIcon> = {
  backlog: Circle,
  todo: ListTodo,
  doing: PlayCircle,
  review: ScanSearch,
  done: CheckCircle2,
}

// Visual card only — used both for the real card and the DragOverlay
export function IssueCardContent({
  issue,
  shadow,
}: {
  issue: IssueWithRelations
  shadow?: boolean
}) {
  const StatusIcon = STATUS_ICONS[issue.status]

  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-3 select-none space-y-2.5',
        STATUS_CARD_TINT[issue.status],
        shadow && 'shadow-xl ring-1 ring-border',
      )}
    >
      <div className="flex items-start gap-2">
        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        <p className="text-sm font-semibold leading-snug line-clamp-2">{issue.title}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-mono text-muted-foreground/80 leading-none">
          {issue.project?.prefix}-{issue.issue_number}
        </p>
        <StatusIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            PRIORITY_COLORS[issue.priority],
          )}
        >
          {PRIORITY_LABELS[issue.priority]}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[120px] text-right">
          {issue.assignee?.name ?? 'Unassigned'}
        </span>
      </div>
    </div>
  )
}

// Draggable card with grip handle + link
export function IssueCard({ issue }: { issue: IssueWithRelations }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  })

  return (
    <Link
      href={`/issue/${issue.id}`}
      ref={setNodeRef}
      {...(mounted ? attributes : {})}
      {...(mounted ? listeners : {})}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'group block min-w-0 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
      )}
    >
      <IssueCardContent issue={issue} />
    </Link>
  )
}
