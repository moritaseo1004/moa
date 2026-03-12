'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import type { Project } from '@/lib/types'

function generatePrefix(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
  if (letters.length >= 3) return letters
  const alnum = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
  return alnum.padEnd(3, 'X').slice(0, 3)
}

export async function getProjectsAction(): Promise<Project[]> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function deleteProject(projectId: string): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  // Guard: prevent deleting the last project
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  if ((count ?? 0) <= 1) {
    return { error: '마지막 프로젝트는 삭제할 수 없습니다.' }
  }

  // Clean up Storage files for all issues in this project
  const { data: issues } = await supabase
    .from('issues')
    .select('id')
    .eq('project_id', projectId)

  const issueIds = (issues ?? []).map((i) => i.id)

  const { data: attachments } = issueIds.length > 0
    ? await supabase
        .from('issue_attachments')
        .select('file_url')
        .in('issue_id', issueIds)
    : { data: [] }

  if (attachments && attachments.length > 0) {
    const paths = attachments
      .map((a) => {
        const url = new URL(a.file_url)
        const marker = '/object/public/issue-attachments/'
        const idx = url.pathname.indexOf(marker)
        return idx !== -1 ? url.pathname.slice(idx + marker.length) : null
      })
      .filter(Boolean) as string[]

    if (paths.length > 0) {
      await supabase.storage.from('issue-attachments').remove(paths)
    }
  }

  // Delete project (cascade removes issues, comments)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return {}
}

export async function updateProjectPrefix(
  projectId: string,
  prefix: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const cleaned = prefix.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()
  if (!cleaned) return { error: '유효한 prefix를 입력해주세요.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('projects')
    .update({ prefix: cleaned })
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  revalidatePath(`/project/${projectId}`)
  return {}
}

type State = { error?: string } | null

export async function createProject(_prevState: State, formData: FormData): Promise<State> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) return { error: 'Name is required' }

  const prefix = generatePrefix(name)

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('projects')
    .insert({ name, description, prefix })

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return null
}
