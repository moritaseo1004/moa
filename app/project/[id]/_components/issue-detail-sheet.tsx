import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getIssue, getIssueSequence } from '@/lib/data/issues'
import { getProjects } from '@/lib/data/projects'
import { getUsers } from '@/lib/data/users'
import { getActivityByEntity } from '@/lib/data/activity'
import { getAttachmentsByIssue } from '@/lib/data/attachments'
import { formatSeoulDateTime } from '@/lib/date-format'
import { ACTION_LABELS, formatActivityDetail } from '@/lib/issue-activity'
import { StatusSelect } from '@/app/issue/[id]/_components/status-select'
import { PrioritySelect } from '@/app/issue/[id]/_components/priority-select'
import { StartDateInput } from '@/app/issue/[id]/_components/start-date-input'
import { DueDateInput } from '@/app/issue/[id]/_components/due-date-input'
import { AssigneeSelect, AssignToMeButton } from '@/app/issue/[id]/_components/assignee-select'
import { ProjectSelect } from '@/app/issue/[id]/_components/project-select'
import { EditIssueForm } from '@/app/issue/[id]/_components/edit-issue-form'
import { IssueAttachments } from '@/app/issue/[id]/_components/issue-attachments'
import { CommentList } from '@/app/issue/[id]/_components/comment-list'
import { CommentForm } from '@/app/issue/[id]/_components/comment-form'
import { CompleteButton } from '@/app/issue/[id]/_components/complete-button'
import { DeleteIssueButton } from '@/app/issue/[id]/_components/delete-issue-button'
import { CopyIssueLinkButton } from '@/app/issue/[id]/_components/copy-issue-link-button'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { IssueDetailSheetCloseButton, IssueDetailSheetFrame } from './issue-detail-sheet-frame'

export async function IssueDetailSheet({
  issueId,
  projectId,
  basePath,
}: {
  issueId: string
  projectId: string
  basePath?: string
}) {
  const currentUser = await getCurrentUserProfile()

  const [issue, sequence, projects, users, activity, attachments] = await Promise.all([
    getIssue(issueId),
    getIssueSequence(projectId),
    getProjects(),
    getUsers(),
    getActivityByEntity('issue', issueId),
    getAttachmentsByIssue(issueId),
  ])

  if (!issue) return null

  const comments = issue.comments ?? []
  const recentActivity = activity.slice(0, 3)
  const remainingActivity = activity.slice(3)
  const panelBasePath = basePath ?? `/project/${projectId}`
  const closeHref = panelBasePath
  const currentIndex = sequence.findIndex((item) => item.id === issue.id)
  const previousIssue = currentIndex > 0 ? sequence[currentIndex - 1] : null
  const nextIssue = currentIndex >= 0 && currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null
  const previousHref = previousIssue ? `${panelBasePath}?issue=${previousIssue.id}` : null
  const nextHref = nextIssue ? `${panelBasePath}?issue=${nextIssue.id}` : null

  return (
    <IssueDetailSheetFrame closeHref={closeHref}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {issue.project?.prefix}-{issue.issue_number}
              </p>
              <h2 className="truncate text-sm font-semibold">{issue.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="mr-1 flex items-center gap-1">
                {previousHref ? (
                  <Link
                    href={previousHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
                    aria-label={`Open previous issue: ${previousIssue?.title ?? ''}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-[#1b1b1b] text-muted-foreground/35">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
                    aria-label={`Open next issue: ${nextIssue?.title ?? ''}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-[#1b1b1b] text-muted-foreground/35">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
              <Link
                href={`/issue/${issue.id}`}
                className="inline-flex h-8 items-center rounded-md border border-border bg-[#1f1f1f] px-3 text-xs text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              >
                Open full page
              </Link>
              <CopyIssueLinkButton issueId={issue.id} size="xs" />
              <IssueDetailSheetCloseButton
                closeHref={closeHref}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="dashboard-scroll min-h-0 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                <div className="flex items-center justify-end gap-2">
                  <DeleteIssueButton issueId={issue.id} projectId={issue.project_id} />
                  <CompleteButton issueId={issue.id} projectId={issue.project_id} isDone={issue.status === 'done'} />
                </div>

                <EditIssueForm issue={issue} />
                <IssueAttachments attachments={attachments} issueId={issue.id} />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Comments
                    {comments.length > 0 ? (
                      <span className="ml-1 normal-case font-normal">({comments.length})</span>
                    ) : null}
                  </h3>
                  <CommentList comments={comments} issueId={issue.id} currentUserId={currentUser?.id ?? null} />
                  <CommentForm issueId={issue.id} />
                </div>
              </div>
            </div>

            <div className="dashboard-scroll min-h-0 overflow-y-auto border-t border-border px-5 py-6 xl:border-l xl:border-t-0">
              <div className="space-y-5">
                <div>
                  <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </label>
                  <StatusSelect issueId={issue.id} projectId={issue.project_id} current={issue.status} />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Priority
                  </label>
                  <PrioritySelect issueId={issue.id} projectId={issue.project_id} current={issue.priority} />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Start date
                  </label>
                  <StartDateInput issueId={issue.id} projectId={issue.project_id} current={issue.start_date} />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Due date
                  </label>
                  <DueDateInput issueId={issue.id} projectId={issue.project_id} current={issue.due_date} />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Project
                  </label>
                  <ProjectSelect issueId={issue.id} current={issue.project_id} projects={projects} />
                </div>

                {issue.reporter ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Reporter
                    </label>
                    <p className="text-sm">{issue.reporter.name}</p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Created
                  </label>
                  <p className="text-xs text-muted-foreground">{formatSeoulDateTime(issue.created_at)}</p>
                </div>

                {activity.length > 0 ? (
                  <div className="rounded-lg border border-border bg-card/50 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
    </IssueDetailSheetFrame>
  )
}
