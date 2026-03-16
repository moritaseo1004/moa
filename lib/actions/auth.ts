'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMasterEmail } from '@/lib/auth-policy'

type State = { error?: string; info?: string } | null

export async function signIn(prevState: State, formData: FormData): Promise<State> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  const user = data.user
  if (!user) return { error: 'Sign in failed. Try again.' }

  const admin = createAdminClient()
  const { data: existingProfile } = await admin
    .from('users')
    .select('role, is_approved, approved_at, approved_by, created_at')
    .eq('id', user.id)
    .single()

  const master = isMasterEmail(user.email ?? email)
  const { error: profileError } = await admin
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email ?? email,
        name: (user.user_metadata?.name as string | undefined)?.trim() || user.email || email,
        role: existingProfile?.role ?? (master ? 'admin' : 'member'),
        is_approved: existingProfile?.is_approved ?? master,
        approved_at: existingProfile?.approved_at ?? (master ? new Date().toISOString() : null),
        approved_by: existingProfile?.approved_by ?? null,
        auth_provider: 'email',
        last_sign_in_at: new Date().toISOString(),
        created_at: existingProfile?.created_at ?? new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

  if (profileError) {
    return { error: `Failed to sync user profile: ${profileError.message}` }
  }

  redirect('/dashboard')
}

export async function signUp(prevState: State, formData: FormData): Promise<State> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Sign up failed. Try again.' }

  // Upsert profile into public.users (admin client to bypass RLS)
  const { error: profileError } = await createAdminClient()
    .from('users')
    .upsert(
      {
        id: data.user.id,
        email,
        name,
        role: 'member',
        is_approved: isMasterEmail(email),
        approved_at: isMasterEmail(email) ? new Date().toISOString() : null,
        auth_provider: 'email',
        last_sign_in_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

  if (profileError) {
    return { error: `Failed to create user profile: ${profileError.message}` }
  }

  // No session = email confirmation required
  if (!data.session) {
    return { info: 'Account created. Check your email to confirm before signing in.' }
  }

  redirect(isMasterEmail(email) ? '/dashboard' : '/pending-approval')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
