'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { logActivity } from '@/lib/data/activity'
import { getMentionedUserIds } from '@/lib/notification-utils'
import { createNotifications } from '@/lib/notifications'

type State = { error?: string } | null

export async function deleteComment(
  commentId: string,
  issueId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data: comment, error: findError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (findError || !comment) return { error: 'Comment not found' }
  if (comment.user_id !== actorId) return { error: 'Forbidden' }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return { error: error.message }
  revalidatePath(`/issue/${issueId}`)
  return {}
}

export async function addComment(_prevState: State, formData: FormData): Promise<State> {
  const issue_id = formData.get('issue_id') as string
  const content = (formData.get('content') as string)?.trim()

  if (!content) return { error: 'Comment cannot be empty' }
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data: issue } = await supabase
    .from('issues')
    .select('title')
    .eq('id', issue_id)
    .single()

  const { data, error } = await supabase
    .from('comments')
    .insert({ issue_id, content, user_id: userId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logActivity({
    user_id: userId,
    entity_type: 'comment',
    entity_id: data.id,
    action: 'comment_added',
    metadata: { issue_id },
  })

  const mentionRecipientIds = getMentionedUserIds(content)

  await createNotifications(
    mentionRecipientIds.map((recipient_user_id) => ({
      recipient_user_id,
      actor_user_id: userId,
      issue_id,
      comment_id: data.id,
      type: 'mention',
      title: `You were mentioned in ${issue?.title ?? 'an issue'}`,
      body: 'A teammate mentioned you in a comment.',
      link_url: `/issue/${issue_id}#comment-${data.id}`,
    })),
  )

  if (mentionRecipientIds.length > 0) {
    revalidatePath('/', 'layout')
  }

  revalidatePath(`/issue/${issue_id}`)
  return null
}
