import { createAdminClient } from '@/lib/supabase/admin'
import type { IssueAttachment } from '@/lib/types'

export async function getAttachmentsByIssue(issueId: string): Promise<IssueAttachment[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issue_attachments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}
