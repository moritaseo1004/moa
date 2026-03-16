import { createAdminClient } from '@/lib/supabase/admin'
import type { ActivityLogWithUser } from '@/lib/types'

export async function logActivity({
  user_id = null,
  entity_type,
  entity_id,
  action,
  metadata,
}: {
  user_id?: string | null
  entity_type: 'issue' | 'project' | 'comment'
  entity_id: string
  action: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createAdminClient()
  await supabase.from('activity_logs').insert({
    user_id,
    entity_type,
    entity_id,
    action,
    metadata: metadata ?? null,
  })
}

export async function getActivityByEntity(
  entity_type: string,
  entity_id: string,
): Promise<ActivityLogWithUser[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, user:users(*)')
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
