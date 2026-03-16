'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminUser } from '@/lib/user-admin'

type UserRole = 'admin' | 'member'

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
