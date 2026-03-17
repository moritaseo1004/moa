import { getIssueComments } from '@/lib/data/issues'
import { CommentForm } from './comment-form'
import { CommentList } from './comment-list'

export async function IssueCommentsSection({
  issueId,
  currentUserId,
}: {
  issueId: string
  currentUserId: string | null
}) {
  const comments = await getIssueComments(issueId)

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Comments
        {comments.length > 0 ? (
          <span className="ml-1 normal-case font-normal">({comments.length})</span>
        ) : null}
      </h2>

      <CommentList comments={comments} issueId={issueId} currentUserId={currentUserId} />
      <CommentForm issueId={issueId} />
    </div>
  )
}
