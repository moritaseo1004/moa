'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedProfile, getAuthenticatedUserId } from '@/lib/actions/authz'
import { getNotificationsForUser, getUnreadNotificationCount } from '@/lib/data/notifications'

export async function getNotificationsSnapshot() {
  const profile = await getAuthenticatedProfile()
  if (!profile) {
    return { notifications: [], unreadCount: 0 }
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(profile.id),
    getUnreadNotificationCount(profile.id, profile.last_seen_notification_at),
  ])

  return { notifications, unreadCount }
}

export async function markNotificationsSeen() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('users')
    .update({ last_seen_notification_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return {}
}
