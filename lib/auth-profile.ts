import { createAdminClient } from '@/lib/supabase/admin'
import { isMasterEmail } from '@/lib/auth-policy'
import type { AuthProvider, User, UserIdentity } from '@/lib/types'

type SyncUserProfileInput = {
  authUserId: string
  email: string
  name?: string | null
  provider: AuthProvider
}

async function getUserIdentityByAuthUserId(authUserId: string): Promise<UserIdentity | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_identities')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()

  return data ?? null
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

export async function getStoredAuthProfileByAuthUserId(authUserId: string): Promise<User | null> {
  const identity = await getUserIdentityByAuthUserId(authUserId)
  if (!identity?.user_id) return null
  return getStoredAuthProfile(identity.user_id)
}

export async function getStoredAuthProfileByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  return data ?? null
}

export async function syncUserProfileFromAuth({
  authUserId,
  email,
  name,
  provider,
}: SyncUserProfileInput): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedName = name?.trim() || null
  const master = isMasterEmail(normalizedEmail)
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const profileByAuthUserId = await getStoredAuthProfileByAuthUserId(authUserId)
  const profileByEmail = await getStoredAuthProfileByEmail(normalizedEmail)

  if (profileByAuthUserId && profileByEmail && profileByAuthUserId.id !== profileByEmail.id) {
    return { error: 'Conflicting user profiles were found for this account. Please contact an admin.' }
  }

  const existingProfile = profileByAuthUserId ?? profileByEmail

  let internalUserId = existingProfile?.id ?? null

  if (existingProfile) {
    const { error } = await admin
      .from('users')
      .update({
        auth_user_id: existingProfile.auth_user_id ?? authUserId,
        email: normalizedEmail,
        name: existingProfile.name || trimmedName || normalizedEmail,
        role: existingProfile.role ?? (master ? 'admin' : 'member'),
        is_approved: existingProfile.is_approved ?? master,
        approved_at: existingProfile.approved_at ?? (master ? now : null),
        approved_by: existingProfile.approved_by ?? null,
        auth_provider: provider,
        first_auth_provider: existingProfile.first_auth_provider ?? provider,
        last_sign_in_provider: provider,
        last_sign_in_at: now,
      })
      .eq('id', existingProfile.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    const internalUserIdToCreate = crypto.randomUUID()
    const { data, error } = await admin
      .from('users')
      .insert({
        id: internalUserIdToCreate,
        auth_user_id: authUserId,
        email: normalizedEmail,
        name: trimmedName || normalizedEmail,
        role: master ? 'admin' : 'member',
        is_approved: master,
        approved_at: master ? now : null,
        approved_by: null,
        auth_provider: provider,
        first_auth_provider: provider,
        last_sign_in_provider: provider,
        last_sign_in_at: now,
      })
      .select('id')
      .single()

    if (error || !data) {
      return { error: error?.message ?? 'Failed to create user profile.' }
    }

    internalUserId = data.id ?? internalUserIdToCreate
  }

  if (!internalUserId) {
    return { error: 'Failed to resolve internal user id.' }
  }

  const { error: identityError } = await admin
    .from('user_identities')
    .upsert(
      {
        user_id: internalUserId,
        auth_user_id: authUserId,
        provider,
        provider_email: normalizedEmail,
        last_sign_in_at: now,
      },
      { onConflict: 'auth_user_id' },
    )

  if (identityError) {
    return { error: identityError.message }
  }

  return {}
}
