import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@/lib/types'

function normalizeUser(user: Partial<User>): User {
  return {
    ...user,
    is_assignable: user.is_assignable ?? true,
  } as User
}

export const getUsers = cache(async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []).map(normalizeUser)
})

export const getAssignableUsers = cache(async function getAssignableUsers(): Promise<User[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_assignable', true)
    .order('name')

  if (error) {
    if ((error as { code?: string }).code === '42703') {
      return getUsers()
    }
    throw error
  }

  return (data ?? []).map(normalizeUser)
})

export const getUser = cache(async function getUser(id: string): Promise<User | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data ? normalizeUser(data) : null
})

export const getUserBySlackId = cache(async function getUserBySlackId(slackUserId: string): Promise<User | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .single()
  return data ? normalizeUser(data) : null
})
