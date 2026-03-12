import { createAdminClient } from '@/lib/supabase/admin'
import type { Project } from '@/lib/types'

export async function getProjects(): Promise<Project[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

/**
 * Returns the Inbox project (case-insensitive name match),
 * falling back to the oldest project if no Inbox exists.
 */
export async function getInboxProject(): Promise<Project | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .ilike('name', 'inbox')
    .limit(1)
    .single()
  if (data) return data

  // Fallback: oldest project
  const { data: fallback } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  return fallback ?? null
}
