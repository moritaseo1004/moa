'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type State = { error?: string; info?: string } | null

export async function signIn(prevState: State, formData: FormData): Promise<State> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/projects')
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
  await createAdminClient()
    .from('users')
    .upsert({ id: data.user.id, email, name }, { onConflict: 'id' })

  // No session = email confirmation required
  if (!data.session) {
    return { info: 'Account created. Check your email to confirm before signing in.' }
  }

  redirect('/projects')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
