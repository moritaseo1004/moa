'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import type { DashboardNote } from '@/lib/types'

interface AddDashboardNoteInput {
  noteDate: string
  title: string
  content?: string | null
}

interface AddDashboardNoteResult {
  error?: string
  note?: DashboardNote
}

export async function addDashboardNote(input: AddDashboardNoteInput): Promise<AddDashboardNoteResult> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'Unauthorized' }

  const title = input.title.trim()
  const noteDate = input.noteDate.trim()
  const content = input.content?.trim() || null

  if (!title) return { error: '메모 제목을 입력해 주세요.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) return { error: '유효한 날짜를 선택해 주세요.' }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('dashboard_notes')
    .insert({
      user_id: userId,
      note_date: noteDate,
      title,
      content,
    })
    .select('*')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return { note: data }
}

export async function deleteDashboardNote(noteId: string): Promise<{ error?: string }> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data: note, error: findError } = await supabase
    .from('dashboard_notes')
    .select('user_id')
    .eq('id', noteId)
    .single()

  if (findError || !note) return { error: '메모를 찾을 수 없습니다.' }
  if (note.user_id !== userId) return { error: '삭제 권한이 없습니다.' }

  const { error } = await supabase
    .from('dashboard_notes')
    .delete()
    .eq('id', noteId)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return {}
}
