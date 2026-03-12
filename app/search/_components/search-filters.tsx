'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { IssueStatus } from '@/lib/types'
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/status'

interface FilterOption {
  id: string
  name: string
}

export function SearchFilters({
  projects,
  assignees,
  current,
}: {
  projects: FilterOption[]
  assignees: FilterOption[]
  current: {
    project?: string
    status?: IssueStatus
    assignee?: string
  }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <select
        value={current.project ?? ''}
        onChange={(e) => updateParam('project', e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-2 pr-8 text-sm outline-none focus:ring-0 text-muted-foreground"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={current.status ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-2 pr-8 text-sm outline-none focus:ring-0 text-muted-foreground"
      >
        <option value="">All statuses</option>
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
        ))}
      </select>

      <select
        value={current.assignee ?? ''}
        onChange={(e) => updateParam('assignee', e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-2 pr-8 text-sm outline-none focus:ring-0 text-muted-foreground"
      >
        <option value="">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {assignees.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  )
}
