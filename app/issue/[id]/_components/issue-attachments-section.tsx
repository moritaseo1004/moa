import { getAttachmentsByIssue } from '@/lib/data/attachments'
import { IssueAttachments } from './issue-attachments'

export async function IssueAttachmentsSection({ issueId }: { issueId: string }) {
  const attachments = await getAttachmentsByIssue(issueId)
  return <IssueAttachments attachments={attachments} issueId={issueId} />
}
