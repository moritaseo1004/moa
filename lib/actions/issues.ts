'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/data/activity'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { getTodayYmd } from '@/lib/date-utils'
import { getNewMentionedUserIds } from '@/lib/notification-utils'
import { createNotifications } from '@/lib/notifications'
import type { IssueStatus, IssuePriority } from '@/lib/types'

type State = { error?: string } | null

function validateSchedule(startDate: string | null, dueDate: string | null) {
  if (startDate && dueDate && startDate > dueDate) {
    return '시작일은 마감일보다 늦을 수 없습니다.'
  }
  return null
}

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
  revalidatePath('/inbox')
  return {}
}

export async function createIssue(_prevState: State, formData: FormData): Promise<State> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const project_id = formData.get('project_id') as string
  const assignee_id = ((formData.get('assignee_id') as string) || '').trim() || null
  const priority = (formData.get('priority') as IssuePriority) || 'medium'
  const start_date = (formData.get('start_date') as string) || getTodayYmd()
  const due_date = (formData.get('due_date') as string) || null

  if (!title) return { error: 'Title is required' }
  if (!project_id) return { error: 'Project is required' }
  const scheduleError = validateSchedule(start_date, due_date)
  if (scheduleError) return { error: scheduleError }

  const reporter_id = await getAuthenticatedUserId()
  if (!reporter_id) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('issues')
    .insert({ title, description, project_id, status: 'backlog', source: 'manual', reporter_id, assignee_id, priority, start_date, due_date })
    .select('id, title')
    .single()

  if (error) return { error: error.message }

  await logActivity({
    user_id: reporter_id,
    entity_type: 'issue',
    entity_id: data.id,
    action: 'issue_created',
    metadata: { title, project_id, start_date, due_date },
  })

  const mentionRecipientIds = getNewMentionedUserIds(description, null)

  await createNotifications(
    mentionRecipientIds.map((recipient_user_id) => ({
      recipient_user_id,
      actor_user_id: reporter_id,
      issue_id: data.id,
      type: 'mention',
      title: `You were mentioned in ${title}`,
      body: 'A teammate mentioned you in a new issue description.',
      link_url: `/issue/${data.id}`,
    })),
  )

  if (mentionRecipientIds.length > 0) {
    revalidatePath('/', 'layout')
  }

  if (assignee_id) {
    await createNotifications([
      {
        recipient_user_id: assignee_id,
        actor_user_id: reporter_id,
        issue_id: data.id,
        type: 'assigned',
        title: `You were assigned to ${data.title}`,
        body: 'A teammate assigned this new issue to you.',
        link_url: `/issue/${data.id}`,
      },
    ])
    revalidatePath('/', 'layout')
  }

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
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
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
  const { data: before } = await supabase
    .from('issues')
    .select('description, title')
    .eq('id', id)
    .single()

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

  const mentionRecipientIds = getNewMentionedUserIds(description, before?.description)

  await createNotifications(
    mentionRecipientIds.map((recipient_user_id) => ({
      recipient_user_id,
      actor_user_id: actorId,
      issue_id: id,
      type: 'mention',
      title: `You were mentioned in ${title}`,
      body: 'A teammate mentioned you in an issue description update.',
      link_url: `/issue/${id}`,
    })),
  )

  if (mentionRecipientIds.length > 0) {
    revalidatePath('/', 'layout')
  }

  revalidatePath(`/issue/${id}`)
  revalidatePath(`/project/${project_id}`)
  revalidatePath('/inbox')
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
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
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
  const { data: before } = await supabase
    .from('issues')
    .select('assignee_id, title')
    .eq('id', issueId)
    .single()

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

  if (assigneeId && assigneeId !== before?.assignee_id) {
    await createNotifications([
      {
        recipient_user_id: assigneeId,
        actor_user_id: actorId,
        issue_id: issueId,
        type: 'assigned',
        title: `You were assigned to ${before?.title ?? 'an issue'}`,
        body: 'A teammate assigned this issue to you.',
        link_url: `/issue/${issueId}`,
      },
    ])

    revalidatePath('/', 'layout')
  }

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
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
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
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

  const { data: issue } = await supabase
    .from('issues')
    .select('start_date')
    .eq('id', issueId)
    .single()

  const scheduleError = validateSchedule(issue?.start_date ?? null, dueDate)
  if (scheduleError) return { error: scheduleError }

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
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
  return {}
}

export async function updateIssueStartDate(
  issueId: string,
  startDate: string | null,
  projectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { data: issue } = await supabase
    .from('issues')
    .select('due_date')
    .eq('id', issueId)
    .single()

  const scheduleError = validateSchedule(startDate, issue?.due_date ?? null)
  if (scheduleError) return { error: scheduleError }

  const { error } = await supabase
    .from('issues')
    .update({ start_date: startDate || null })
    .eq('id', issueId)

  if (error) return { error: error.message }

  await logActivity({
    user_id: actorId,
    entity_type: 'issue',
    entity_id: issueId,
    action: 'issue_updated',
    metadata: { field: 'start_date', to: startDate },
  })

  revalidatePath(`/issue/${issueId}`)
  revalidatePath(`/project/${projectId}`)
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
  return {}
}

export async function moveIssueToProject(
  issueId: string,
  newProjectId: string,
  currentProjectId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }
  if (newProjectId === currentProjectId) return {}

  const supabase = createAdminClient()

  const { data: targetProjectIssues, error: sequenceError } = await supabase
    .from('issues')
    .select('issue_number')
    .eq('project_id', newProjectId)
    .order('issue_number', { ascending: false })
    .limit(1)

  if (sequenceError) return { error: sequenceError.message }

  const nextIssueNumber = (targetProjectIssues?.[0]?.issue_number ?? 0) + 1

  const { error } = await supabase
    .from('issues')
    .update({ project_id: newProjectId, issue_number: nextIssueNumber })
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
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/inbox')
  return {}
}

export async function bulkUpdateInboxIssues(input: {
  issueIds: string[]
  fromProjectId: string
  toProjectId?: string | null
  assigneeId?: string | null
}): Promise<{ error?: string; updatedCount?: number }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const issueIds = Array.from(new Set(input.issueIds.filter(Boolean)))
  const toProjectId = input.toProjectId ?? undefined
  const assigneeId = input.assigneeId === undefined ? undefined : input.assigneeId

  if (!input.fromProjectId) return { error: 'Inbox project is required.' }
  if (issueIds.length === 0) return { error: 'No issues selected.' }
  if (toProjectId === undefined && assigneeId === undefined) {
    return { error: 'Choose at least one field to update.' }
  }

  const supabase = createAdminClient()
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('id, title, project_id, assignee_id')
    .in('id', issueIds)
    .eq('project_id', input.fromProjectId)
    .order('created_at', { ascending: true })

  if (issuesError) return { error: issuesError.message }
  if (!issues || issues.length === 0) return { error: 'No matching inbox issues found.' }

  let nextIssueNumber = 0
  if (toProjectId && toProjectId !== input.fromProjectId) {
    const { data: targetProjectIssues, error: sequenceError } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('project_id', toProjectId)
      .order('issue_number', { ascending: false })
      .limit(1)

    if (sequenceError) return { error: sequenceError.message }
    nextIssueNumber = (targetProjectIssues?.[0]?.issue_number ?? 0) + 1
  }

  const assignmentNotifications: Array<{
    recipient_user_id: string
    actor_user_id: string | null
    issue_id: string | null
    type: 'assigned'
    title: string
    body: string | null
    link_url: string
  }> = []

  for (const issue of issues) {
    const updatePayload: {
      project_id?: string
      issue_number?: number
      assignee_id?: string | null
    } = {}

    if (toProjectId && toProjectId !== issue.project_id) {
      updatePayload.project_id = toProjectId
      updatePayload.issue_number = nextIssueNumber
      nextIssueNumber += 1
    }

    if (assigneeId !== undefined) {
      updatePayload.assignee_id = assigneeId
    }

    if (Object.keys(updatePayload).length === 0) {
      continue
    }

    const { error: updateError } = await supabase
      .from('issues')
      .update(updatePayload)
      .eq('id', issue.id)

    if (updateError) return { error: updateError.message }

    if (updatePayload.project_id) {
      await logActivity({
        user_id: actorId,
        entity_type: 'issue',
        entity_id: issue.id,
        action: 'issue_updated',
        metadata: { field: 'project_id', from: issue.project_id, to: updatePayload.project_id },
      })
    }

    if (assigneeId !== undefined && assigneeId !== issue.assignee_id) {
      await logActivity({
        user_id: actorId,
        entity_type: 'issue',
        entity_id: issue.id,
        action: 'assignee_changed',
        metadata: { assignee_id: assigneeId },
      })

      if (assigneeId) {
        assignmentNotifications.push({
          recipient_user_id: assigneeId,
          actor_user_id: actorId,
          issue_id: issue.id,
          type: 'assigned',
          title: `You were assigned to ${issue.title}`,
          body: 'A teammate assigned this issue to you.',
          link_url: `/issue/${issue.id}`,
        })
      }
    }
  }

  if (assignmentNotifications.length > 0) {
    await createNotifications(assignmentNotifications)
    revalidatePath('/', 'layout')
  }

  revalidatePath('/inbox')
  revalidatePath(`/project/${input.fromProjectId}`)

  if (toProjectId && toProjectId !== input.fromProjectId) {
    revalidatePath(`/project/${toProjectId}`)
  }

  revalidatePath('/dashboard')
  revalidatePath('/calendar')

  return { updatedCount: issues.length }
}
