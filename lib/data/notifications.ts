import { createAdminClient } from '@/lib/supabase/admin'
import type { NotificationWithActor } from '@/lib/types'

export async function getNotificationsForUser(
  userId: string,
  limit = 10,
): Promise<NotificationWithActor[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:users!actor_user_id(*)')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getNotificationsForUser] failed:', error)
    return []
  }

  return data ?? []
}

export async function getUnreadNotificationCount(
  userId: string,
  lastSeenAt: string | null,
): Promise<number> {
  const supabase = createAdminClient()
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_user_id', userId)

  if (lastSeenAt) {
    query = query.gt('created_at', lastSeenAt)
  }

  const { count, error } = await query
  if (error) {
    console.error('[getUnreadNotificationCount] failed:', error)
    return 0
  }

  return count ?? 0
}
