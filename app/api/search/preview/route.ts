import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchIssues } from '@/lib/services/search'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 })
  }

  const results = await searchIssues(user.id, q)
  return NextResponse.json({ results: results.slice(0, 5) })
}
