'use client'

import { useTransition } from 'react'
import { moveIssueToProject } from '@/lib/actions/issues'
import type { Project } from '@/lib/types'

export function ProjectSelect({
  issueId,
  current,
  projects,
}: {
  issueId: string
  current: string
  projects: Project[]
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={current}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() => {
          moveIssueToProject(issueId, e.target.value, current)
        })
      }}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-0 disabled:opacity-50"
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )
}
