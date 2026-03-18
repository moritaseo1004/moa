import { getProjects } from '@/lib/data/projects'
import { getAssignableUsers } from '@/lib/data/users'
import type { IssueWithRelations } from '@/lib/types'
import { formatSeoulDateTime } from '@/lib/date-format'
import { StatusSelect } from './status-select'
import { PrioritySelect } from './priority-select'
import { StartDateInput } from './start-date-input'
import { DueDateInput } from './due-date-input'
import { AssigneeSelect, AssignToMeButton } from './assignee-select'
import { ProjectSelect } from './project-select'
import { DeleteIssueButton } from './delete-issue-button'

export async function IssueDetailSidebar({
  issue,
  currentUserId,
  returnHref,
}: {
  issue: IssueWithRelations
  currentUserId: string | null
  returnHref?: string
}) {
  const [projects, assignableUsers] = await Promise.all([getProjects(), getAssignableUsers()])
  const users =
    issue.assignee && !assignableUsers.some((user) => user.id === issue.assignee?.id)
      ? [...assignableUsers, issue.assignee]
      : assignableUsers

  return (
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
            currentUserId={currentUserId}
          />
        </div>
        <AssigneeSelect
          issueId={issue.id}
          projectId={issue.project_id}
          current={issue.assignee_id}
          users={users}
          currentUserId={currentUserId}
          showAssignToMeInline
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Project
        </label>
        <ProjectSelect issueId={issue.id} current={issue.project_id} projects={projects} />
      </div>

      {issue.reporter ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Reporter
          </label>
          <p className="text-sm">{issue.reporter.name}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Created
        </label>
        <p className="text-xs text-muted-foreground">
          {formatSeoulDateTime(issue.created_at)}
        </p>
      </div>

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center">
          <DeleteIssueButton
            issueId={issue.id}
            projectId={issue.project_id}
            label="Delete issue"
            returnHref={returnHref}
          />
        </div>
      </div>
    </div>
  )
}
