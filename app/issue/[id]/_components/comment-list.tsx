'use client'

import { useMemo, useState, useTransition } from 'react'
import { LinkifiedText } from '@/components/linkified-text'
import { deleteComment } from '@/lib/actions/comments'
import { formatSeoulDateTime } from '@/lib/date-format'
import type { CommentWithUser } from '@/lib/types'

export function CommentList({
  comments,
  issueId,
  currentUserId,
}: {
  comments: CommentWithUser[]
  issueId: string
  currentUserId: string | null
}) {
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest')

  if (comments.length === 0) return null

  const sorted = [...comments].sort((a, b) => {
    const diff = a.created_at < b.created_at ? -1 : 1
    return order === 'newest' ? -diff : diff
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{comments.length}개의 댓글</span>
        <button
          onClick={() => setOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {order === 'newest' ? '최신순 ↓' : '오래된순 ↑'}
        </button>
      </div>
      {sorted.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          issueId={issueId}
          currentUserId={currentUserId}
        />
      ))}
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
    <div className="rounded-lg border border-border p-3 space-y-1">
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
