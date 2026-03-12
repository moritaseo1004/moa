import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowUpRight, Clock3, FolderKanban, UserRound } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { getSearchFilterOptions, searchIssues } from '@/lib/services/search'
import { SearchFilters } from './_components/search-filters'
import type { IssueStatus } from '@/lib/types'

export const metadata = { title: 'Search — Tracker' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    project?: string
    status?: IssueStatus
    assignee?: string
  }>
}) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const project = params.project?.trim() || undefined
  const status = params.status || undefined
  const assignee = params.assignee?.trim() || undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [results, options] = await Promise.all([
    searchIssues(user.id, q, { projectId: project, status, assigneeId: assignee }),
    getSearchFilterOptions(user.id),
  ])

  return (
    <div className="mx-auto max-w-5xl px-6 py-6 space-y-5">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h1 className="text-lg font-semibold tracking-tight">Global Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {q ? (
            <>
              Results for <span className="text-foreground">&quot;{q}&quot;</span> · {results.length} issue
              {results.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Showing latest issues · {results.length} issue{results.length !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>

      <SearchFilters
        projects={options.projects}
        assignees={options.assignees}
        current={{ project, status, assignee }}
      />

      <div className="space-y-2">
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No issues found.
          </div>
        ) : (
          results.map((item) => (
            <Link
              key={item.issueId}
              href={`/issue/${item.issueId}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.issueTitle}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FolderKanban className="h-3.5 w-3.5" />
                    {item.projectName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {item.assignee ?? 'Unassigned'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_COLORS[item.status],
                )}
              >
                {STATUS_LABELS[item.status]}
              </span>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
