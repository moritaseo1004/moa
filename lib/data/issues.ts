import { createAdminClient } from '@/lib/supabase/admin'
import type { IssueWithRelations } from '@/lib/types'

export interface IssueSequenceItem {
  id: string
  issue_number: number
  title: string
}

export async function getIssuesByProject(projectId: string): Promise<IssueWithRelations[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      project:projects(*),
      assignee:users!assignee_id(*),
      reporter:users!reporter_id(*),
      comments(id),
      issue_attachments(id)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getIssue(id: string): Promise<IssueWithRelations | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      project:projects(*),
      assignee:users!assignee_id(*),
      reporter:users!reporter_id(*),
      comments(*, user:users(*))
    `)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getIssueSequence(projectId: string): Promise<IssueSequenceItem[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .select('id, issue_number, title')
    .eq('project_id', projectId)
    .order('issue_number', { ascending: true })

  if (error) {
    console.error('[getIssueSequence] failed:', error)
    return []
  }

  return data ?? []
}

export async function getDueIssuesForDashboard(userId: string): Promise<IssueWithRelations[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      project:projects(*),
      assignee:users!assignee_id(*)
    `)
    .not('due_date', 'is', null)
    .neq('status', 'done')
    .eq('assignee_id', userId)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getDueIssuesForDashboard] failed:', error)
    return []
  }
  return data ?? []
}
