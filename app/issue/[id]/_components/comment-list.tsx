'use client'

import { useMemo, useState, useTransition } from 'react'
import { LinkifiedText } from '@/components/linkified-text'
import { deleteComment } from '@/lib/actions/comments'
import { formatSeoulDateTime } from '@/lib/date-format'
import type { CommentWithUser } from '@/lib/types'

const DEFAULT_VISIBLE_COMMENTS = 5

export function CommentList({
  comments,
  issueId,
  currentUserId,
}: {
  comments: CommentWithUser[]
  issueId: string
  currentUserId: string | null
}) {
  if (comments.length === 0) return null

  const sorted = [...comments].sort((a, b) => {
    const diff = a.created_at < b.created_at ? -1 : 1
    return -diff
  })
  const recentComments = sorted.slice(0, DEFAULT_VISIBLE_COMMENTS)
  const remainingComments = sorted.slice(DEFAULT_VISIBLE_COMMENTS)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {Math.min(DEFAULT_VISIBLE_COMMENTS, comments.length)} of {comments.length}
        </span>
        <span className="text-xs text-muted-foreground">Newest first</span>
      </div>

      <div className="space-y-2">
        {recentComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            issueId={issueId}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {remainingComments.length > 0 ? (
        <details className="group rounded-md border border-border/70 bg-background/30 px-3 py-2">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
            <span className="group-open:hidden">
              Show {remainingComments.length} more comment{remainingComments.length !== 1 ? 's' : ''}
            </span>
            <span className="hidden group-open:inline">Hide older comments</span>
          </summary>

          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            {remainingComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                issueId={issueId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  )
}

function CommentItem({
  comment,
  issueId,
  currentUserId,
}: {
  comment: CommentWithUser
  issueId: string
  currentUserId: string | null
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canDelete = currentUserId && comment.user_id === currentUserId
  const createdAtLabel = useMemo(() => formatSeoulDateTime(comment.created_at), [comment.created_at])

  function handleDelete() {
    startTransition(async () => {
      await deleteComment(comment.id, issueId)
    })
  }

  return (
    <div id={`comment-${comment.id}`} className="rounded-lg border border-border p-3 space-y-1 scroll-mt-20">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium">
          {comment.user?.name ?? 'Anonymous'}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">
            {createdAtLabel}
          </span>
          {canDelete && (
            confirm ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs text-destructive hover:underline disabled:opacity-50"
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                삭제
              </button>
            )
          )}
        </div>
      </div>
      <LinkifiedText text={comment.content} className="text-sm whitespace-pre-wrap break-words" />
    </div>
  )
}
