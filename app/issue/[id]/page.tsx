import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIssue, getIssueSequence } from '@/lib/data/issues'
import { getProjects } from '@/lib/data/projects'
import { getUsers } from '@/lib/data/users'
import { getActivityByEntity } from '@/lib/data/activity'
import { getAttachmentsByIssue } from '@/lib/data/attachments'
import { formatSeoulDateTime } from '@/lib/date-format'
import { ACTION_LABELS, formatActivityDetail } from '@/lib/issue-activity'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { cn } from '@/lib/utils'
import { IssuePageNav } from './_components/issue-page-nav'
import { EditIssueForm } from './_components/edit-issue-form'
import { StatusSelect } from './_components/status-select'
import { AssigneeSelect, AssignToMeButton } from './_components/assignee-select'
import { ProjectSelect } from './_components/project-select'
import { PrioritySelect } from './_components/priority-select'
import { StartDateInput } from './_components/start-date-input'
import { DueDateInput } from './_components/due-date-input'
import { CommentForm } from './_components/comment-form'
import { CompleteButton } from './_components/complete-button'
import { DeleteIssueButton } from './_components/delete-issue-button'
import { IssueAttachments } from './_components/issue-attachments'
import { CommentList } from './_components/comment-list'
import { CopyIssueLinkButton } from './_components/copy-issue-link-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await getIssue(id)
  return { title: issue ? `${issue.title} — Tracker` : 'Issue' }
}

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currentUser = await getCurrentUserProfile()

  const [issue, projects, users, activity, attachments] = await Promise.all([
    getIssue(id),
    getProjects(),
    getUsers(),
    getActivityByEntity('issue', id),
    getAttachmentsByIssue(id),
  ])

  if (!issue) notFound()

  const sequence = await getIssueSequence(issue.project_id)
  const currentIndex = sequence.findIndex((item) => item.id === issue.id)
  const previousIssue =
    currentIndex > 0
      ? {
          id: sequence[currentIndex - 1].id,
          label: `${issue.project?.prefix}-${sequence[currentIndex - 1].issue_number} ${sequence[currentIndex - 1].title}`,
        }
      : null
  const nextIssue =
    currentIndex >= 0 && currentIndex < sequence.length - 1
      ? {
          id: sequence[currentIndex + 1].id,
          label: `${issue.project?.prefix}-${sequence[currentIndex + 1].issue_number} ${sequence[currentIndex + 1].title}`,
        }
      : null

  const comments = issue.comments ?? []
  const isDone = issue.status === 'done'
  const recentActivity = activity.slice(0, 3)
  const remainingActivity = activity.slice(3)

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <IssuePageNav
        projectHref={`/project/${issue.project_id}`}
        previousIssue={previousIssue}
        nextIssue={nextIssue}
      />

      {/* Breadcrumb + top actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>/</span>
          {issue.project && (
            <>
              <Link href={`/project/${issue.project_id}`} className="hover:underline">
                {issue.project.name}
              </Link>
              <span>/</span>
              <span className="font-mono font-medium text-foreground/70">
                {issue.project.prefix}-{issue.issue_number}
              </span>
              <span>/</span>
            </>
          )}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_COLORS[issue.status],
            )}
          >
            {STATUS_LABELS[issue.status]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CopyIssueLinkButton issueId={issue.id} />
          <DeleteIssueButton issueId={issue.id} projectId={issue.project_id} />
          <CompleteButton issueId={issue.id} projectId={issue.project_id} isDone={isDone} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main */}
        <div className="space-y-8 min-w-0">
          {/* Title + description (inline edit) */}
          <EditIssueForm issue={issue} />

          {/* Attachments */}
          <IssueAttachments attachments={attachments} issueId={id} />

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Comments
              {comments.length > 0 && (
                <span className="ml-1 normal-case font-normal">({comments.length})</span>
              )}
            </h2>

            <CommentList comments={comments} issueId={id} currentUserId={currentUser?.id ?? null} />

            <CommentForm issueId={issue.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 text-sm">
          <div className="rounded-lg border border-border bg-card/50 p-5 space-y-5">
            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <StatusSelect issueId={issue.id} projectId={issue.project_id} current={issue.status} />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Priority
              </label>
              <PrioritySelect issueId={issue.id} projectId={issue.project_id} current={issue.priority} />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start date
              </label>
              <StartDateInput issueId={issue.id} projectId={issue.project_id} current={issue.start_date} />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due date
              </label>
              <DueDateInput issueId={issue.id} projectId={issue.project_id} current={issue.due_date} />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assignee
                </label>
                <AssignToMeButton
                  issueId={issue.id}
                  projectId={issue.project_id}
                  current={issue.assignee_id}
                  currentUserId={currentUser?.id ?? null}
                />
              </div>
              <AssigneeSelect
                issueId={issue.id}
                projectId={issue.project_id}
                current={issue.assignee_id}
                users={users}
                currentUserId={currentUser?.id ?? null}
                showAssignToMeInline
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Project
              </label>
              <ProjectSelect issueId={issue.id} current={issue.project_id} projects={projects} />
            </div>

            {issue.reporter && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reporter
                </label>
                <p className="text-sm">{issue.reporter.name}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created
              </label>
              <p className="text-xs text-muted-foreground">
                {formatSeoulDateTime(issue.created_at)}
              </p>
            </div>
          </div>

          {/* Activity log */}
          {activity.length > 0 && (
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
                {recentActivity.map((log) => (
                  (() => {
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
                          {detail ? (
                            <p className="text-xs text-muted-foreground">
                              {detail}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground/60">
                            {formatSeoulDateTime(log.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })()
                ))}
              </div>

              {remainingActivity.length > 0 ? (
                <details className="group rounded-md border border-border/70 bg-background/30 px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <span className="group-open:hidden">
                      Show {remainingActivity.length} more activity item{remainingActivity.length !== 1 ? 's' : ''}
                    </span>
                    <span className="hidden group-open:inline">
                      Hide older activity
                    </span>
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
                            {detail ? (
                              <p className="text-xs text-muted-foreground">
                                {detail}
                              </p>
                            ) : null}
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
          )}
        </div>
      </div>
    </div>
  )
}
