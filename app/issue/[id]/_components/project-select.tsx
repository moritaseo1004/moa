'use client'

import { useState, useTransition } from 'react'
import { IssueDetailSelect } from './issue-detail-select'
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
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-2">
      <IssueDetailSelect
        value={current}
        disabled={isPending}
        onChange={(next) => {
          setError(null)
          startTransition(async () => {
            const result = await moveIssueToProject(issueId, next, current)
            if (result?.error) setError(result.error)
          })
        }}
        options={projects.map((project) => ({ value: project.id, label: project.name }))}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
