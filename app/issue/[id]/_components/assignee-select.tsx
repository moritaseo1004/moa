'use client'

import { useTransition } from 'react'
import { updateIssueAssignee } from '@/lib/actions/issues'
import type { User } from '@/lib/types'

export function AssigneeSelect({
  issueId,
  projectId,
  current,
  users,
}: {
  issueId: string
  projectId: string
  current: string | null
  users: User[]
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={current ?? ''}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() => {
          updateIssueAssignee(issueId, e.target.value || null, projectId)
        })
      }}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-0 disabled:opacity-50"
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  )
}
