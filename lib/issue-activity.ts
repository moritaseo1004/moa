import { PRIORITY_LABELS } from '@/lib/priority'
import { STATUS_LABELS } from '@/lib/status'
import type { ActivityLogWithUser, Project, User } from '@/lib/types'

export const ACTION_LABELS: Record<string, string> = {
  issue_created: 'Issue created',
  issue_updated: 'Issue updated',
  issue_completed: 'Marked as done',
  assignee_changed: 'Assignee changed',
  comment_added: 'Comment added',
}

export function formatActivityValue(
  field: string | null,
  value: unknown,
  users: User[],
  projects: Project[],
) {
  if (value === null || value === undefined || value === '') return '—'

  if (field === 'status') {
    return STATUS_LABELS[value as keyof typeof STATUS_LABELS] ?? String(value)
  }

  if (field === 'priority') {
    return PRIORITY_LABELS[value as keyof typeof PRIORITY_LABELS] ?? String(value)
  }

  if (field === 'project_id') {
    const project = projects.find((item) => item.id === value)
    return project?.name ?? String(value)
  }

  if (field === 'assignee_id') {
    const user = users.find((item) => item.id === value)
    return user?.name ?? String(value)
  }

  return String(value)
}

export function formatActivityDetail(
  log: Pick<ActivityLogWithUser, 'metadata'>,
  users: User[],
  projects: Project[],
) {
  const metadata = log.metadata
  if (!metadata) return null

  const field = typeof metadata.field === 'string' ? metadata.field : null

  if (field) {
    const labels: Record<string, string> = {
      status: 'Status',
      priority: 'Priority',
      start_date: 'Start date',
      due_date: 'Due date',
      project_id: 'Project',
      assignee_id: 'Assignee',
    }

    const from = formatActivityValue(field, metadata.from, users, projects)
    const to = formatActivityValue(field, metadata.to, users, projects)
    return `${labels[field] ?? field}: ${from} → ${to}`
  }

  if (typeof metadata.assignee_id === 'string' || metadata.assignee_id === null) {
    const assignee = formatActivityValue('assignee_id', metadata.assignee_id, users, projects)
    return `Assignee: ${assignee}`
  }

  if (Array.isArray(metadata.fields) && metadata.fields.length > 0) {
    return `Updated: ${metadata.fields.join(', ')}`
  }

  if (typeof metadata.title === 'string') {
    return metadata.title
  }

  return null
}
