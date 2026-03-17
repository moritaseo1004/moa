import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { isMasterEmail } from '@/lib/auth-policy'

export async function middleware(request: NextRequest) {
  // Pass-through for Slack webhooks — no session needed
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — required for Server Components to read updated session
  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPendingApprovalPage = request.nextUrl.pathname === '/pending-approval'
  const isAuthCallbackPage = request.nextUrl.pathname === '/auth/callback'
  const isForgotPasswordPage = request.nextUrl.pathname === '/forgot-password'
  const isResetPasswordPage = request.nextUrl.pathname === '/reset-password'

  // Not logged in → redirect to login
  if (!user && !isLoginPage && !isAuthCallbackPage && !isForgotPasswordPage && !isResetPasswordPage) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_approved')
      .eq('auth_user_id', user.id)
      .single()

    const approved = isMasterEmail(user.email) || Boolean(profile?.is_approved)

    if (!approved && !isPendingApprovalPage) {
      const pendingUrl = request.nextUrl.clone()
      pendingUrl.pathname = '/pending-approval'
      return NextResponse.redirect(pendingUrl)
    }

    if (approved && isPendingApprovalPage) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/dashboard'
      return NextResponse.redirect(homeUrl)
    }
  }

  // Already logged in → skip login page
  if (user && isLoginPage) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_approved')
      .eq('auth_user_id', user.id)
      .single()
    const approved = isMasterEmail(user.email) || Boolean(profile?.is_approved)
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = approved ? '/dashboard' : '/pending-approval'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
