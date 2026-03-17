'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useSyncExternalStore } from 'react'
import { PriorityLabel, StatusBadge } from '@/components/issue-meta-badges'
import { cn } from '@/lib/utils'
import { STATUS_CARD_TINT } from '@/lib/status'
import { formatScheduleLabel } from '@/lib/issue-schedule'
import type { IssueWithRelations } from '@/lib/types'
import type { IssueOpenMode } from './kanban-board'

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
        'select-none space-y-2.5 rounded-md border px-3 py-3',
        STATUS_CARD_TINT[issue.status],
        shadow && 'shadow-xl ring-1 ring-border',
      )}
    >
      <p className="text-sm font-semibold leading-snug line-clamp-2">{issue.title}</p>

      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={issue.status} />
        <p className="text-[11px] font-mono text-muted-foreground/80 leading-none">
          {issue.project?.prefix}-{issue.issue_number}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <PriorityLabel priority={issue.priority} />
        <span className="text-xs text-muted-foreground truncate max-w-[120px] text-right">
          {issue.assignee?.name ?? 'Unassigned'}
        </span>
      </div>

      <div className="rounded-sm border border-border bg-[#202020] px-2 py-1 text-[11px] text-muted-foreground">
        {formatScheduleLabel(issue.start_date, issue.due_date)}
      </div>
    </div>
  )
}

// Draggable card with grip handle + link
export function IssueCard({
  issue,
  openMode,
}: {
  issue: IssueWithRelations
  openMode: IssueOpenMode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  })
  const nextParams = new URLSearchParams(searchParams.toString())
  nextParams.set('issue', issue.id)
  const panelHref = `${pathname}?${nextParams.toString()}`
  const pageParams = new URLSearchParams()
  pageParams.set('returnTo', pathname)
  const pageHref = `/issue/${issue.id}?${pageParams.toString()}`
  const href = openMode === 'page' ? pageHref : panelHref

  return (
    <Link
      href={href}
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
