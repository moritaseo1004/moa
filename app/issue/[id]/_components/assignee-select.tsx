'use client'

import { useTransition } from 'react'
import { IssueDetailSelect } from './issue-detail-select'
import { updateIssueAssignee } from '@/lib/actions/issues'
import type { User } from '@/lib/types'

export function AssigneeSelect({
  issueId,
  projectId,
  current,
  users,
  currentUserId,
  showAssignToMeInline,
}: {
  issueId: string
  projectId: string
  current: string | null
  users: User[]
  currentUserId?: string | null
  showAssignToMeInline?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const canAssignToMe = Boolean(currentUserId) && currentUserId !== current

  return (
    <div className="space-y-2">
      {canAssignToMe && !showAssignToMeInline ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                updateIssueAssignee(issueId, currentUserId ?? null, projectId)
              })
            }}
            className="inline-flex h-7 items-center rounded-md border border-border bg-[#1f1f1f] px-2.5 text-xs text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Assign to me
          </button>
        </div>
      ) : null}

      <IssueDetailSelect
        value={current ?? ''}
        disabled={isPending}
        onChange={(next) => {
          startTransition(() => {
            updateIssueAssignee(issueId, next || null, projectId)
          })
        }}
        options={[
          { value: '', label: 'Unassigned', muted: true },
          ...users.map((u) => ({ value: u.id, label: u.name })),
        ]}
        placeholder="Select assignee"
      />
    </div>
  )
}

export function AssignToMeButton({
  issueId,
  projectId,
  current,
  currentUserId,
}: {
  issueId: string
  projectId: string
  current: string | null
  currentUserId?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const canAssignToMe = Boolean(currentUserId) && currentUserId !== current

  if (!canAssignToMe) return null

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          updateIssueAssignee(issueId, currentUserId ?? null, projectId)
        })
      }}
      className="inline-flex h-7 items-center rounded-md border border-border bg-[#1f1f1f] px-2.5 text-xs text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      Assign to me
    </button>
  )
}
