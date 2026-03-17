import Link from 'next/link'
import { ArrowUpRight, Clock3, FolderKanban, UserRound } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'
import { searchIssues } from '@/lib/services/search'
import type { IssueStatus } from '@/lib/types'

export async function SearchResults({
  userId,
  q,
  project,
  status,
  assignee,
}: {
  userId: string
  q: string
  project?: string
  status?: IssueStatus
  assignee?: string
}) {
  const results = await searchIssues(userId, q, {
    projectId: project,
    status,
    assigneeId: assignee,
  })

  return (
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
  )
}
