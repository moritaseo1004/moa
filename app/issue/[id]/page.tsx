import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIssue } from '@/lib/data/issues'
import { getProjects } from '@/lib/data/projects'
import { getUsers } from '@/lib/data/users'
import { getActivityByEntity } from '@/lib/data/activity'
import { getAttachmentsByIssue } from '@/lib/data/attachments'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { cn } from '@/lib/utils'
import { EditIssueForm } from './_components/edit-issue-form'
import { StatusSelect } from './_components/status-select'
import { AssigneeSelect } from './_components/assignee-select'
import { ProjectSelect } from './_components/project-select'
import { PrioritySelect } from './_components/priority-select'
import { DueDateInput } from './_components/due-date-input'
import { CommentForm } from './_components/comment-form'
import { CompleteButton } from './_components/complete-button'
import { DeleteIssueButton } from './_components/delete-issue-button'
import { IssueAttachments } from './_components/issue-attachments'
import { CommentList } from './_components/comment-list'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await getIssue(id)
  return { title: issue ? `${issue.title} — Tracker` : 'Issue' }
}

const ACTION_LABELS: Record<string, string> = {
  issue_created: 'Issue created',
  issue_updated: 'Issue updated',
  issue_completed: 'Marked as done',
  assignee_changed: 'Assignee changed',
  comment_added: 'Comment added',
}

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [issue, projects, users, activity, attachments] = await Promise.all([
    getIssue(id),
    getProjects(),
    getUsers(),
    getActivityByEntity('issue', id),
    getAttachmentsByIssue(id),
  ])

  if (!issue) notFound()

  const comments = issue.comments ?? []
  const isDone = issue.status === 'done'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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
          <DeleteIssueButton issueId={issue.id} projectId={issue.project_id} />
          <CompleteButton issueId={issue.id} projectId={issue.project_id} isDone={isDone} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
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

            <CommentList comments={comments} issueId={id} currentUserId={user?.id ?? null} />

            <CommentForm issueId={issue.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <StatusSelect issueId={issue.id} projectId={issue.project_id} current={issue.status} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Priority
              </label>
              <PrioritySelect issueId={issue.id} projectId={issue.project_id} current={issue.priority} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due date
              </label>
              <DueDateInput issueId={issue.id} projectId={issue.project_id} current={issue.due_date} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assignee
              </label>
              <AssigneeSelect
                issueId={issue.id}
                projectId={issue.project_id}
                current={issue.assignee_id}
                users={users}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Project
              </label>
              <ProjectSelect issueId={issue.id} current={issue.project_id} projects={projects} />
            </div>

            {issue.reporter && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reporter
                </label>
                <p className="text-sm">{issue.reporter.name}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created
              </label>
              <p className="text-xs text-muted-foreground">
                {new Date(issue.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Activity log */}
          {activity.length > 0 && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Activity
              </h3>
              <div className="space-y-2">
                {activity.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    <div className="min-w-0">
                      <p className="text-xs">{ACTION_LABELS[log.action] ?? log.action}</p>
                      {log.metadata?.field != null && (
                        <p className="text-xs text-muted-foreground">
                          {String(log.metadata.from)} → {String(log.metadata.to)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
