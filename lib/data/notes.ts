import { createAdminClient } from '@/lib/supabase/admin'
import type { DashboardNote } from '@/lib/types'

export async function getDashboardNotesByUser(userId: string): Promise<DashboardNote[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('dashboard_notes')
    .select('*')
    .eq('user_id', userId)
    .order('note_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    console.error('[getDashboardNotesByUser] failed:', error)
    return []
  }
  return data ?? []
}
