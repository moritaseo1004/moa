import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMasterEmail } from '@/lib/auth-policy'
import type { User } from '@/lib/types'

function applyMasterOverride(profile: User | null, authUser: { id: string; email?: string | null; user_metadata?: { name?: string | null } } | null): User | null {
  const email = authUser?.email?.trim().toLowerCase()
  if (!email || !isMasterEmail(email)) {
    return profile
  }

  if (profile) {
    return {
      ...profile,
      role: 'admin',
      is_approved: true,
      approved_at: profile.approved_at ?? new Date().toISOString(),
      auth_provider: profile.auth_provider || 'email',
    }
  }

  return {
    id: authUser!.id,
    name: authUser?.user_metadata?.name ?? email,
    email,
    slack_user_id: null,
    role: 'admin',
    is_approved: true,
    approved_at: new Date().toISOString(),
    approved_by: null,
    auth_provider: 'email',
    last_sign_in_at: null,
    created_at: new Date().toISOString(),
  }
}

export async function getCurrentUserProfile(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return applyMasterOverride(data ?? null, user)
}

export async function requireAdminUser(): Promise<User> {
  const profile = await getCurrentUserProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}
