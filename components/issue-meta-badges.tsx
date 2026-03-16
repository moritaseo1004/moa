import { PRIORITY_LABELS } from '@/lib/priority'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { IssuePriority, IssueStatus } from '@/lib/types'

const PRIORITY_DOT_COLORS: Record<IssuePriority, string> = {
  urgent: 'bg-rose-400',
  high: 'bg-amber-400',
  medium: 'bg-sky-400',
  low: 'bg-zinc-400',
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium leading-none',
        STATUS_COLORS[status],
      )}
    >
      <span>{STATUS_LABELS[status]}</span>
    </span>
  )
}

export function PriorityLabel({ priority }: { priority: IssuePriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-muted-foreground">
      <span className={cn('h-2 w-2 rounded-full', PRIORITY_DOT_COLORS[priority])} />
      <span>{PRIORITY_LABELS[priority]}</span>
    </span>
  )
}
