'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type State = { error?: string } | null

export async function createProject(prevState: State, formData: FormData): Promise<State> {
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) return { error: 'Name is required' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('projects')
    .insert({ name, description })

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return null
}
