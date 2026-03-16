'use client'

import { useTransition } from 'react'
import { IssueDetailSelect } from './issue-detail-select'
import { updateIssueStatus } from '@/lib/actions/issues'
import { STATUS_LABELS, ALL_STATUSES, STATUS_COLORS } from '@/lib/status'
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
    <IssueDetailSelect
      value={current}
      disabled={isPending}
      onChange={(next) => {
        startTransition(() => {
          updateIssueStatus(issueId, next as IssueStatus, projectId)
        })
      }}
      options={ALL_STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
        badgeClassName: STATUS_COLORS[status],
      }))}
    />
  )
}
