'use client'

import { useTransition } from 'react'
import { IssueDetailSelect } from './issue-detail-select'
import { updateIssuePriority } from '@/lib/actions/issues'
import { ALL_PRIORITIES, PRIORITY_LABELS } from '@/lib/priority'
import type { IssuePriority } from '@/lib/types'

const PRIORITY_DOT_COLORS: Record<IssuePriority, string> = {
  urgent: 'bg-rose-400',
  high: 'bg-amber-400',
  medium: 'bg-sky-400',
  low: 'bg-zinc-400',
}

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

  function handleChange(priority: IssuePriority) {
    startTransition(() => {
      updateIssuePriority(issueId, priority, projectId)
    })
  }

  return (
    <IssueDetailSelect
      value={current}
      onChange={(next) => handleChange(next as IssuePriority)}
      disabled={isPending}
      options={ALL_PRIORITIES.map((priority) => ({
        value: priority,
        label: PRIORITY_LABELS[priority],
        dotClassName: PRIORITY_DOT_COLORS[priority],
      }))}
    />
  )
}
