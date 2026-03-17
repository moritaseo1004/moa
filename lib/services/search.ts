import { createAdminClient } from '@/lib/supabase/admin'
import type { IssueStatus, Project, SearchFilters, SearchResult, User } from '@/lib/types'

function escapeForIlike(input: string): string {
  return input.replace(/[%_]/g, '\\$&')
}

function toOrIlikePattern(input: string): string {
  // PostgREST `or` expression uses `*` wildcard for ilike patterns.
  return `*${input.replace(/\*/g, '')}*`
}

function getRelationName(
  relation: { name?: string | null } | { name?: string | null }[] | null | undefined,
): string | null {
  if (!relation) return null
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null
  }
  return relation.name ?? null
}

async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  void userId
  // Current MVP authorization model: authenticated users can access all projects.
  // Keep this isolated for future project-membership based ACL extension.
  const supabase = createAdminClient()
  const { data } = await supabase.from('projects').select('id')
  return (data ?? []).map((p) => p.id)
}

export async function getSearchFilterOptions(userId: string): Promise<{
  projects: Pick<Project, 'id' | 'name'>[]
  assignees: Pick<User, 'id' | 'name'>[]
}> {
  const accessibleProjectIds = await getAccessibleProjectIds(userId)
  if (accessibleProjectIds.length === 0) return { projects: [], assignees: [] }

  const supabase = createAdminClient()
  const [{ data: projects }, { data: assignees }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name')
      .in('id', accessibleProjectIds)
      .order('name'),
    supabase
      .from('users')
      .select('id, name')
      .order('name'),
  ])

  return {
    projects: projects ?? [],
    assignees: assignees ?? [],
  }
}

export async function searchIssues(
  userId: string,
  query: string,
  filters: SearchFilters = {},
): Promise<SearchResult[]> {
  const accessibleProjectIds = await getAccessibleProjectIds(userId)
  if (accessibleProjectIds.length === 0) return []

  const supabase = createAdminClient()
  const q = query.trim()
  const ilikePattern = `%${escapeForIlike(q)}%`
  const orPattern = toOrIlikePattern(q)

  let projectIdsMatchedByName: string[] = []
  if (q) {
    const { data: matchedProjects } = await supabase
      .from('projects')
      .select('id')
      .in('id', accessibleProjectIds)
      .ilike('name', ilikePattern)
    projectIdsMatchedByName = (matchedProjects ?? []).map((p) => p.id)
  }

  let issueQuery = supabase
    .from('issues')
    .select(`
      id,
      title,
      status,
      created_at,
      project:projects(name),
      assignee:users!assignee_id(name)
    `)
    .in('project_id', accessibleProjectIds)
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters.projectId) {
    issueQuery = issueQuery.eq('project_id', filters.projectId)
  }

  if (filters.status) {
    issueQuery = issueQuery.eq('status', filters.status)
  }

  if (filters.assigneeId === 'unassigned') {
    issueQuery = issueQuery.is('assignee_id', null)
  } else if (filters.assigneeId) {
    issueQuery = issueQuery.eq('assignee_id', filters.assigneeId)
  }

  if (q) {
    if (projectIdsMatchedByName.length > 0) {
      issueQuery = issueQuery.or(
        `title.ilike.${orPattern},description.ilike.${orPattern},project_id.in.(${projectIdsMatchedByName.join(',')})`,
      )
    } else {
      issueQuery = issueQuery.or(`title.ilike.${orPattern},description.ilike.${orPattern}`)
    }
  }

  const { data, error } = await issueQuery
  if (error || !data) {
    console.error('[searchIssues] query failed:', error?.message)
    return []
  }

  return data.map((row) => ({
    issueId: row.id,
    issueTitle: row.title,
    projectName: getRelationName(row.project) ?? 'Unknown project',
    status: row.status as IssueStatus,
    assignee: getRelationName(row.assignee),
    updatedAt: row.created_at,
  }))
}
