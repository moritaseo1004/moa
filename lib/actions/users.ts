'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminUser } from '@/lib/user-admin'

type UserRole = 'admin' | 'member'
type SlackLinkState = { error?: string; success?: string } | null

async function countAdmins() {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')
  return count ?? 0
}

export async function updateUserApproval(userId: string, approved: boolean): Promise<{ error?: string }> {
  const actor = await requireAdminUser()
  const supabase = createAdminClient()

  if (actor.id === userId && !approved) {
    return { error: '본인 승인은 해제할 수 없습니다.' }
  }

  const { error } = await supabase
    .from('users')
    .update({
      is_approved: approved,
      approved_at: approved ? new Date().toISOString() : null,
      approved_by: approved ? actor.id : null,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
  return {}
}

export async function updateUserRole(userId: string, role: UserRole): Promise<{ error?: string }> {
  const actor = await requireAdminUser()
  const supabase = createAdminClient()

  const { data: target } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (!target) return { error: 'User not found.' }

  if (actor.id === userId && role !== 'admin') {
    return { error: '본인 관리자 권한은 해제할 수 없습니다.' }
  }

  if (target.role === 'admin' && role !== 'admin') {
    const adminCount = await countAdmins()
    if (adminCount <= 1) {
      return { error: '마지막 admin 권한은 해제할 수 없습니다.' }
    }
  }

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
  return {}
}

export async function updateUserSlackId(
  _prevState: SlackLinkState,
  formData: FormData,
): Promise<SlackLinkState> {
  await requireAdminUser()

  const userId = String(formData.get('user_id') ?? '').trim()
  const rawSlackId = String(formData.get('slack_user_id') ?? '').trim()
  const slackUserId = rawSlackId.toUpperCase() || null

  if (!userId) {
    return { error: 'User not found.' }
  }

  if (slackUserId && !/^U[A-Z0-9]+$/i.test(slackUserId)) {
    return { error: 'Slack 사용자 ID 형식이 올바르지 않습니다. 예: U012ABCDEF' }
  }

  const supabase = createAdminClient()

  if (slackUserId) {
    const { data: existing } = await supabase
      .from('users')
      .select('id, name')
      .eq('slack_user_id', slackUserId)
      .neq('id', userId)
      .maybeSingle()

    if (existing) {
      return { error: `${existing.name} 사용자에게 이미 연결된 Slack ID입니다.` }
    }
  }

  const { error } = await supabase
    .from('users')
    .update({ slack_user_id: slackUserId })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)

  return {
    success: slackUserId
      ? 'Slack 계정이 연결되었습니다.'
      : 'Slack 계정 연결이 해제되었습니다.',
  }
}
