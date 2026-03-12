'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUserId } from '@/lib/actions/authz'

export async function deleteAttachment(
  attachmentId: string,
  fileUrl: string,
  issueId: string,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()

  const url = new URL(fileUrl)
  const marker = '/object/public/issue-attachments/'
  const idx = url.pathname.indexOf(marker)
  if (idx !== -1) {
    const path = url.pathname.slice(idx + marker.length)
    await supabase.storage.from('issue-attachments').remove([path])
  }

  const { error } = await supabase
    .from('issue_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) return { error: error.message }

  revalidatePath(`/issue/${issueId}`)
  return {}
}

export async function uploadAttachmentsToIssue(
  issueId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const actorId = await getAuthenticatedUserId()
  if (!actorId) return { error: 'Unauthorized' }

  const files = formData.getAll('attachments') as File[]
  const validFiles = files.filter((f) => f.size > 0)

  if (validFiles.length === 0) return { error: 'No files provided' }

  const supabase = createAdminClient()

  for (const file of validFiles) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `${issueId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('issue-attachments')
      .upload(storagePath, file)

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage
      .from('issue-attachments')
      .getPublicUrl(storagePath)

    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'file'

    const { error: insertError } = await supabase.from('issue_attachments').insert({
      issue_id: issueId,
      file_name: file.name,
      mime_type: file.type,
      file_type: fileType,
      file_size: file.size,
      file_url: urlData.publicUrl,
      thumbnail_url: fileType === 'image' ? urlData.publicUrl : null,
    })

    if (insertError) return { error: insertError.message }
  }

  revalidatePath(`/issue/${issueId}`)
  return {}
}
