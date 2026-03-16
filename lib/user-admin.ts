import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isMasterEmail } from '@/lib/auth-policy'
import { getStoredAuthProfile } from '@/lib/auth-profile'
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
      first_auth_provider: profile.first_auth_provider || 'email',
      last_sign_in_provider: profile.last_sign_in_provider || profile.first_auth_provider || 'email',
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
    first_auth_provider: 'email',
    last_sign_in_provider: 'email',
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

  const profile = await getStoredAuthProfile(user.id)
  return applyMasterOverride(profile ?? null, user)
}

export async function requireAdminUser(): Promise<User> {
  const profile = await getCurrentUserProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}
