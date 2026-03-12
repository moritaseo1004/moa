'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/data/activity'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import type { IssueStatus, IssuePriority } from '@/lib/types'

type State = { error?: string } | null

export async function deleteIssue(
  issueId: string,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  // Clean up Storage files first
  const { data: attachments } = await supabase
    .from('issue_attachments')
    .select('file_url')
    .eq('issue_id', issueId)

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

  const { error } = await supabase.from('issues').delete().eq('id', issueId)
  if (error) return { error: error.message }

  revalidatePath(`/project/${projectId}`)
  return {}
}

export async function createIssue(_prevState: State, formData: FormData): Promise<State> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const project_id = formData.get('project_id') as string
  const priority = (formData.get('priority') as IssuePriority) || 'medium'
  const due_date = (formData.get('due_date') as string) || null

  if (!title) return { error: 'Title is required' }
  if (!project_id) return { error: 'Project is required' }

  const reporter_id = await getAuthenticatedUserId()
  if (!reporter_id) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .insert({ title, description, project_id, status: 'backlog', source: 'manual', reporter_id, priority, due_date })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logActivity({
    user_id: reporter_id,
    entity_type: 'issue',
    entity_id: data.id,
    action: 'issue_created',
    metadata: { title, project_id },
  })

  // Upload attachments if any
  const files = formData.getAll('attachments') as File[]
  const validFiles = files.filter((f) => f.size > 0)

  for (const file of validFiles) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `${data.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('issue-attachments')
      .upload(storagePath, file)

    if (uploadError) continue

    const { data: urlData } = supabase.storage
      .from('issue-attachments')
      .getPublicUrl(storagePath)

    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'file'

    await supabase.from('issue_attachments').insert({
      issue_id: data.id,
      file_name: file.name,
      mime_type: file.type,
      file_type: fileType,
      file_size: file.size,
      file_url: urlData.publicUrl,
      thumbnail_url: fileType === 'image' ? urlData.publicUrl : null,
    })
  }

  revalidatePath(`/project/${project_id}`)
  return null
}

export async function updateIssue(_prevState: State, formData: FormData): Promise<State> {
  const id = formData.get('id') as string
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const project_id = formData.get('project_id') as string

  if (!title) return { error: 'Title is required' }
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('issues')
    .update({ title, description })
    .eq('id', id)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: id,
    action: 'issue_updated',
    metadata: { fields: ['title', 'description'] },
  })

  revalidatePath(`/issue/${id}`)
  revalidatePath(`/project/${project_id}`)
  return null
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { data: before } = await supabase
    .from('issues')
    .select('status')
    .eq('id', issueId)
    .single()

  const { error } = await supabase
    .from('issues')
    .update({ status })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: status === 'done' ? 'issue_completed' : 'issue_updated',
    metadata: { field: 'status', from: before?.status, to: status },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  return {}
}

export async function updateIssueAssignee(
  issueId: string,
  assigneeId: string | null,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('issues')
    .update({ assignee_id: assigneeId || null })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: 'assignee_changed',
    metadata: { assignee_id: assigneeId },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  return {}
}

export async function updateIssuePriority(
  issueId: string,
  priority: IssuePriority,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('issues')
    .update({ priority })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: 'issue_updated',
    metadata: { field: 'priority', to: priority },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  return {}
}

export async function updateIssueDueDate(
  issueId: string,
  dueDate: string | null,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('issues')
    .update({ due_date: dueDate || null })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: 'issue_updated',
    metadata: { field: 'due_date', to: dueDate },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  return {}
}

export async function moveIssueToProject(
  issueId: string,
  newProjectId: string,
  currentProjectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('issues')
    .update({ project_id: newProjectId })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: 'issue_updated',
    metadata: { field: 'project_id', from: currentProjectId, to: newProjectId },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${currentProjectId}`)
  revalidatePath(`/project/${newProjectId}`)
  return {}
}
