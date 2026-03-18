'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare2, Inbox, Square } from 'lucide-react'
import { PriorityLabel } from '@/components/issue-meta-badges'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { IssueDetailSelect } from '@/app/issue/[id]/_components/issue-detail-select'
import { bulkUpdateInboxIssues } from '@/lib/actions/issues'
import { cn } from '@/lib/utils'
import type { IssueWithRelations, Project, User } from '@/lib/types'

const KEEP_VALUE = '__KEEP__'
const UNASSIGNED_VALUE = '__UNASSIGNED__'

function SourceBadge({ source }: { source: IssueWithRelations['source'] }) {
  const label = source === 'slack' ? 'Slack' : source === 'manual' ? 'Manual' : 'System'
  const tone =
    source === 'slack'
      ? 'border-sky-400/20 bg-sky-500/10 text-sky-200'
      : source === 'manual'
        ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
        : 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'

  return <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium', tone)}>{label}</span>
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function InboxTriageTable({
  issues,
  inboxProjectId,
  projects,
  users,
}: {
  issues: IssueWithRelations[]
  inboxProjectId: string
  projects: Project[]
  users: User[]
}) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [projectValue, setProjectValue] = useState(KEEP_VALUE)
  const [assigneeValue, setAssigneeValue] = useState(KEEP_VALUE)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return issues

    return issues.filter((issue) => {
      const issueCode = `${issue.project?.prefix ?? 'ISSUE'}-${issue.issue_number}`.toLowerCase()
      return (
        issue.title.toLowerCase().includes(query) ||
        issueCode.includes(query) ||
        issue.assignee?.name?.toLowerCase().includes(query) ||
        issue.source.toLowerCase().includes(query)
      )
    })
  }, [issues, search])

  const filteredIds = useMemo(() => filteredIssues.map((issue) => issue.id), [filteredIssues])
  const selectedCount = selectedIds.length
  const allVisibleSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id))
  const canApply = selectedCount > 0 && (projectValue !== KEEP_VALUE || assigneeValue !== KEEP_VALUE) && !isPending

  function toggleIssue(issueId: string) {
    setSelectedIds((current) => (
      current.includes(issueId)
        ? current.filter((id) => id !== issueId)
        : [...current, issueId]
    ))
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !filteredIds.includes(id))
      }

      return Array.from(new Set([...current, ...filteredIds]))
    })
  }

  function resetBulkState() {
    setSelectedIds([])
    setProjectValue(KEEP_VALUE)
    setAssigneeValue(KEEP_VALUE)
    setError(null)
  }

  function handleApply() {
    if (!canApply) return

    setError(null)

    startTransition(async () => {
      const result = await bulkUpdateInboxIssues({
        issueIds: selectedIds,
        fromProjectId: inboxProjectId,
        toProjectId: projectValue === KEEP_VALUE ? undefined : projectValue,
        assigneeId:
          assigneeValue === KEEP_VALUE
            ? undefined
            : assigneeValue === UNASSIGNED_VALUE
              ? null
              : assigneeValue,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      resetBulkState()
      router.refresh()
    })
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/30">
          <Inbox className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Inbox is clear</h2>
        <p className="mt-1 text-sm text-muted-foreground">New issues from Slack or manual intake will show up here for triage.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-4 z-20">
        <div className="rounded-xl border border-border bg-[#1c1c1c] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inbox issues..."
              className="h-9 w-[260px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
            />
            <div className="text-sm text-muted-foreground">
              {selectedCount > 0 ? `${selectedCount} selected` : `${filteredIssues.length} issues`}
            </div>
          </div>

          {selectedCount > 0 ? (
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-border/80 pt-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-[240px]">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Project</p>
                  <IssueDetailSelect
                    value={projectValue}
                    onChange={setProjectValue}
                    disabled={isPending}
                    options={[
                      { value: KEEP_VALUE, label: 'Keep current project', muted: true },
                      ...projects.map((project) => ({ value: project.id, label: project.name })),
                    ]}
                  />
                </div>

                <div className="w-[240px]">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Assignee</p>
                  <IssueDetailSelect
                    value={assigneeValue}
                    onChange={setAssigneeValue}
                    disabled={isPending}
                    options={[
                      { value: KEEP_VALUE, label: 'Keep current assignee', muted: true },
                      { value: UNASSIGNED_VALUE, label: 'Unassigned', muted: true },
                      ...users.map((user) => ({ value: user.id, label: user.name })),
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end">
                <button
                  type="button"
                  onClick={resetBulkState}
                  disabled={isPending}
                  className="inline-flex h-9 items-center rounded-md border border-border bg-[#202020] px-3 text-sm text-muted-foreground transition-colors hover:bg-[#242424] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!canApply}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
                  Apply
                </button>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={toggleAllVisible}
                  className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={allVisibleSelected ? 'Deselect all visible issues' : 'Select all visible issues'}
                >
                  {allVisibleSelected ? <CheckSquare2 className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Assignee</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIds.includes(issue.id)

              return (
                <tr key={issue.id} className={cn('transition-colors hover:bg-muted/30', isSelected && 'bg-muted/20')}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleIssue(issue.id)}
                      className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring/50"
                      aria-label={`Select ${issue.title}`}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-muted-foreground">
                    {issue.project?.prefix}-{issue.issue_number}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/issue/${issue.id}?returnTo=${encodeURIComponent('/inbox')}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {issue.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SourceBadge source={issue.source} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {issue.assignee?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityLabel priority={issue.priority} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {formatCreatedAt(issue.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
