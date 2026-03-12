'use client'

import { useTransition } from 'react'
import { updateIssueStatus } from '@/lib/actions/issues'
import { STATUS_LABELS, ALL_STATUSES } from '@/lib/status'
import type { IssueStatus } from '@/lib/types'

export function StatusSelect({
  issueId,
  projectId,
  current,
}: {
  issueId: string
  projectId: string
  current: IssueStatus
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={current}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() => {
          updateIssueStatus(issueId, e.target.value as IssueStatus, projectId)
        })
      }}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}
