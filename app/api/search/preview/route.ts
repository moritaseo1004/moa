import { NextRequest, NextResponse } from 'next/server'
import { getApprovedAuthUser } from '@/lib/actions/authz'
import { searchIssues } from '@/lib/services/search'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''

  const { user, profile, approved } = await getApprovedAuthUser()

  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 })
  }

  if (!approved || !profile) {
    return NextResponse.json({ results: [] }, { status: 403 })
  }

  const results = await searchIssues(profile.id, q)
  return NextResponse.json({ results: results.slice(0, 5) })
}
