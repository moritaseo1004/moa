'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/data/activity'

type State = { error?: string } | null

export async function addComment(_prevState: State, formData: FormData): Promise<State> {
  const issue_id = formData.get('issue_id') as string
  const content = (formData.get('content') as string)?.trim()

  if (!content) return { error: 'Comment cannot be empty' }

  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({ issue_id, content, user_id: user?.id ?? null })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logActivity({
    user_id: user?.id ?? null,
    entity_type: 'comment',
    entity_id: data.id,
    action: 'comment_added',
    metadata: { issue_id },
  })

  revalidatePath(`/issue/${issue_id}`)
  return null
}
