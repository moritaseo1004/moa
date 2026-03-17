import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoredAuthProfileByAuthUserId, syncUserProfileFromAuth } from '@/lib/auth-profile'
import { isMasterEmail } from '@/lib/auth-policy'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error')
  const redirectUrl = new URL('/login', requestUrl.origin)

  if (error) {
    redirectUrl.searchParams.set('error', error)
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    redirectUrl.searchParams.set('error', 'Missing authentication code.')
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    redirectUrl.searchParams.set('error', exchangeError.message)
    return NextResponse.redirect(redirectUrl)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    redirectUrl.searchParams.set('error', 'Unable to read Google account email.')
    return NextResponse.redirect(redirectUrl)
  }

  const { error: profileError } = await syncUserProfileFromAuth({
    authUserId: user.id,
    email: user.email,
    name: (user.user_metadata?.name as string | undefined) ?? user.email,
    provider: 'google',
  })

  if (profileError) {
    redirectUrl.searchParams.set('error', profileError)
    return NextResponse.redirect(redirectUrl)
  }

  const profile = await getStoredAuthProfileByAuthUserId(user.id)
  const approved = isMasterEmail(user.email) || Boolean(profile?.is_approved)

  return NextResponse.redirect(new URL(approved ? '/dashboard' : '/pending-approval', requestUrl.origin))
}
