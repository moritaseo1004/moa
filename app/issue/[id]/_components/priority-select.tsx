'use client'

import { useTransition } from 'react'
import { updateIssuePriority } from '@/lib/actions/issues'
import { ALL_PRIORITIES, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/priority'
import { cn } from '@/lib/utils'
import type { IssuePriority } from '@/lib/types'

export function PrioritySelect({
  issueId,
  projectId,
  current,
}: {
  issueId: string
  projectId: string
  current: IssuePriority
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const priority = e.target.value as IssuePriority
    startTransition(() => {
      updateIssuePriority(issueId, priority, projectId)
    })
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={isPending}
      className={cn(
        'w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-0 transition-opacity',
        isPending && 'opacity-50',
        PRIORITY_COLORS[current],
      )}
    >
      {ALL_PRIORITIES.map((p) => (
        <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
      ))}
    </select>
  )
}
