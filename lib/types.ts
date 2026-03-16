// ─── Enums ────────────────────────────────────────────────────────────────────

export type IssueStatus = 'backlog' | 'todo' | 'doing' | 'review' | 'done'

export type IssueSource = 'slack' | 'manual' | 'system'

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low'

export type AuthProvider = 'email' | 'google'

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  slack_user_id: string | null
  role: 'admin' | 'member'
  is_approved: boolean
  approved_at: string | null
  approved_by: string | null
  first_auth_provider: AuthProvider
  last_sign_in_provider: AuthProvider
  last_sign_in_at: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  prefix: string
  created_at: string
}

export interface Issue {
  id: string
  issue_number: number
  title: string
  description: string | null
  project_id: string
  status: IssueStatus
  priority: IssuePriority
  start_date: string | null
  due_date: string | null
  assignee_id: string | null
  reporter_id: string | null
  source: IssueSource
  updated_at?: string
  created_at: string
}

export interface Comment {
  id: string
  issue_id: string
  user_id: string | null
  content: string
  created_at: string
}

export interface CommentWithUser extends Comment {
  user?: User | null
}

export interface ActivityLog {
  id: string
  user_id: string | null
  entity_type: 'issue' | 'project' | 'comment'
  entity_id: string
  action: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: User | null
}

export interface DashboardNote {
  id: string
  user_id: string
  note_date: string
  title: string
  content: string | null
  created_at: string
}

// ─── Attachments ──────────────────────────────────────────────────────────────

export type AttachmentFileType = 'image' | 'video' | 'file'

export interface IssueAttachment {
  id: string
  issue_id: string
  file_name: string
  mime_type: string
  file_type: AttachmentFileType
  file_size: number
  file_url: string
  thumbnail_url: string | null
  created_at: string
}

// ─── Joined / enriched types ──────────────────────────────────────────────────

export interface IssueWithRelations extends Issue {
  project?: Project
  assignee?: User | null
  reporter?: User | null
  comments?: CommentWithUser[]
  issue_attachments?: Pick<IssueAttachment, 'id'>[]
}

export interface SearchFilters {
  projectId?: string
  status?: IssueStatus
  assigneeId?: string
}

export interface SearchResult {
  issueId: string
  issueTitle: string
  projectName: string
  status: IssueStatus
  assignee: string | null
  updatedAt: string
}
