'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isMasterEmail } from '@/lib/auth-policy'
import { syncUserProfileFromAuth } from '@/lib/auth-profile'

type State = { error?: string; info?: string } | null

export async function signIn(prevState: State, formData: FormData): Promise<State> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  const user = data.user
  if (!user) return { error: 'Sign in failed. Try again.' }

  const { error: profileError } = await syncUserProfileFromAuth({
    authUserId: user.id,
    email: user.email ?? email,
    name: (user.user_metadata?.name as string | undefined) ?? user.email ?? email,
    provider: 'email',
  })

  if (profileError) {
    return { error: `Failed to sync user profile: ${profileError}` }
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
  const { error: profileError } = await syncUserProfileFromAuth({
    authUserId: data.user.id,
    email,
    name,
    provider: 'email',
  })

  if (profileError) {
    return { error: `Failed to create user profile: ${profileError}` }
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
