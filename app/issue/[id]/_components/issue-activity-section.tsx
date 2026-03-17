import { getActivityByEntity } from '@/lib/data/activity'
import { getProjects } from '@/lib/data/projects'
import { getUsers } from '@/lib/data/users'
import { formatSeoulDateTime } from '@/lib/date-format'
import { ACTION_LABELS, formatActivityDetail } from '@/lib/issue-activity'

export async function IssueActivitySection({ issueId }: { issueId: string }) {
  const [activity, users, projects] = await Promise.all([
    getActivityByEntity('issue', issueId),
    getUsers(),
    getProjects(),
  ])

  if (activity.length === 0) return null

  const recentActivity = activity.slice(0, 3)
  const remainingActivity = activity.slice(3)

  return (
    <div className="rounded-lg border border-border bg-card/50 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Activity
        </h3>
        <span className="text-xs text-muted-foreground">
          {Math.min(3, activity.length)} of {activity.length}
        </span>
      </div>

      <div className="space-y-2">
        {recentActivity.map((log) => {
          const detail = formatActivityDetail(log, users, projects)
          return (
            <div key={log.id} className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              <div className="min-w-0">
                <p className="text-xs">
                  {ACTION_LABELS[log.action] ?? log.action}
                  <span className="ml-1 text-muted-foreground">
                    · {log.user?.name ?? 'System'}
                  </span>
                </p>
                {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
                <p className="text-xs text-muted-foreground/60">
                  {formatSeoulDateTime(log.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {remainingActivity.length > 0 ? (
        <details className="group rounded-md border border-border/70 bg-background/30 px-3 py-2">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
            <span className="group-open:hidden">
              Show {remainingActivity.length} more activity item{remainingActivity.length !== 1 ? 's' : ''}
            </span>
            <span className="hidden group-open:inline">Hide older activity</span>
          </summary>

          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            {remainingActivity.map((log) => {
              const detail = formatActivityDetail(log, users, projects)
              return (
                <div key={log.id} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  <div className="min-w-0">
                    <p className="text-xs">
                      {ACTION_LABELS[log.action] ?? log.action}
                      <span className="ml-1 text-muted-foreground">
                        · {log.user?.name ?? 'System'}
                      </span>
                    </p>
                    {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
                    <p className="text-xs text-muted-foreground/60">
                      {formatSeoulDateTime(log.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      ) : null}
    </div>
  )
}
