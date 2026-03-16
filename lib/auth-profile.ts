import { createAdminClient } from '@/lib/supabase/admin'
import { isMasterEmail } from '@/lib/auth-policy'
import type { AuthProvider, User } from '@/lib/types'

type SyncUserProfileInput = {
  userId: string
  email: string
  name?: string | null
  provider: AuthProvider
}

export async function getStoredAuthProfile(userId: string): Promise<User | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return data ?? null
}

export async function syncUserProfileFromAuth({
  userId,
  email,
  name,
  provider,
}: SyncUserProfileInput): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedName = name?.trim() || null
  const existingProfile = await getStoredAuthProfile(userId)
  const master = isMasterEmail(normalizedEmail)
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { error } = await admin
    .from('users')
    .upsert(
      {
        id: userId,
        email: normalizedEmail,
        name: existingProfile?.name || trimmedName || normalizedEmail,
        role: existingProfile?.role ?? (master ? 'admin' : 'member'),
        is_approved: existingProfile?.is_approved ?? master,
        approved_at: existingProfile?.approved_at ?? (master ? now : null),
        approved_by: existingProfile?.approved_by ?? null,
        auth_provider: provider,
        first_auth_provider: existingProfile?.first_auth_provider ?? provider,
        last_sign_in_provider: provider,
        last_sign_in_at: now,
        created_at: existingProfile?.created_at ?? now,
      },
      { onConflict: 'id' },
    )

  if (error) {
    return { error: error.message }
  }

  return {}
}
