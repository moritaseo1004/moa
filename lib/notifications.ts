import { createAdminClient } from '@/lib/supabase/admin'

interface NotificationInsert {
  recipient_user_id: string
  actor_user_id?: string | null
  issue_id?: string | null
  comment_id?: string | null
  type: 'mention' | 'assigned'
  title: string
  body?: string | null
  link_url: string
}

export async function createNotifications(notifications: NotificationInsert[]) {
  if (notifications.length === 0) return

  const supabase = createAdminClient()
  const deduped = notifications.filter((notification, index, all) => {
    const key = [
      notification.recipient_user_id,
      notification.actor_user_id ?? '',
      notification.issue_id ?? '',
      notification.comment_id ?? '',
      notification.type,
      notification.link_url,
    ].join(':')

    return index === all.findIndex((candidate) => [
      candidate.recipient_user_id,
      candidate.actor_user_id ?? '',
      candidate.issue_id ?? '',
      candidate.comment_id ?? '',
      candidate.type,
      candidate.link_url,
    ].join(':') === key)
  })

  const { error } = await supabase.from('notifications').insert(
    deduped.map((notification) => ({
      ...notification,
      actor_user_id: notification.actor_user_id ?? null,
      issue_id: notification.issue_id ?? null,
      comment_id: notification.comment_id ?? null,
      body: notification.body ?? null,
    })),
  )

  if (error) {
    console.error('[createNotifications] failed:', error)
  }
}
