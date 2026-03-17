'use server'

import { createClient } from '@/lib/supabase/server'
import { getStoredAuthProfileByAuthUserId } from '@/lib/auth-profile'
import { isMasterEmail } from '@/lib/auth-policy'
import type { User } from '@/lib/types'

export async function getAuthenticatedProfile(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return getStoredAuthProfileByAuthUserId(user.id)
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const profile = await getAuthenticatedProfile()
  return profile?.id ?? null
}

export async function getApprovedAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, approved: false }
  }

  const profile = await getStoredAuthProfileByAuthUserId(user.id)
  const approved = isMasterEmail(user.email) || Boolean(profile?.is_approved)

  return { user, profile, approved }
}
