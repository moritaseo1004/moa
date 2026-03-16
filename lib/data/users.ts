import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@/lib/types'

export async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getUser(id: string): Promise<User | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data ?? null
}

export async function getUserBySlackId(slackUserId: string): Promise<User | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .single()
  return data ?? null
}
