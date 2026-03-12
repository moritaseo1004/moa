import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function parseId(pathname: string, base: '/project/' | '/issue/'): string | null {
  if (!pathname.startsWith(base)) return null
  const rest = pathname.slice(base.length)
  const id = rest.split('/')[0]?.trim()
  return id || null
}

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.searchParams.get('pathname') ?? ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ activeProject: null, projectShortcuts: [] }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: shortcuts } = await admin
    .from('projects')
    .select('id, name, prefix')
    .order('name')
    .limit(10)

  const projectIdFromProjectPath = parseId(pathname, '/project/')
  if (projectIdFromProjectPath) {
    const { data } = await admin
      .from('projects')
      .select('id, name')
      .eq('id', projectIdFromProjectPath)
      .single()
    return NextResponse.json({ activeProject: data ?? null, projectShortcuts: shortcuts ?? [] })
  }

  const issueId = parseId(pathname, '/issue/')
  if (issueId) {
    const { data: issue } = await admin
      .from('issues')
      .select('project_id')
      .eq('id', issueId)
      .single()

    if (!issue?.project_id) {
      return NextResponse.json({ activeProject: null, projectShortcuts: shortcuts ?? [] })
    }

    const { data: project } = await admin
      .from('projects')
      .select('id, name')
      .eq('id', issue.project_id)
      .single()

    return NextResponse.json({ activeProject: project ?? null, projectShortcuts: shortcuts ?? [] })
  }

  return NextResponse.json({ activeProject: null, projectShortcuts: shortcuts ?? [] })
}
