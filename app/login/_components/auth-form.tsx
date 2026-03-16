'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground'

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const searchParams = useSearchParams()

  const [signInState, signInAction, signInPending] = useActionState(signIn, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, null)

  const isSignIn = mode === 'signin'
  const state = isSignIn ? signInState : signUpState
  const isPending = isSignIn ? signInPending : signUpPending
  const callbackError = searchParams.get('error')

  const handleGoogleSignIn = async () => {
    setOauthError(null)
    setIsGooglePending(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setOauthError(error.message)
      setIsGooglePending(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isGooglePending}
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <GoogleMark />
          {isGooglePending ? 'Connecting to Google…' : 'Google로 시작하기'}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={isSignIn ? signInAction : signUpAction} className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          이메일로 시작하기
        </p>
        {!isSignIn && (
          <input name="name" placeholder="Full name" required autoComplete="name" className={inputCls} />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          className={inputCls}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          className={inputCls}
        />

        {state?.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state?.info && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {state.info}
          </p>
        )}
        {(oauthError || callbackError) && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {oauthError || callbackError}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isSignIn ? 'Signing in…' : 'Creating account…'
            : isSignIn ? '이메일로 시작하기' : '이메일 계정 만들기'}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(isSignIn ? 'signup' : 'signin')}
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {isSignIn ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
      <path fill="#EA4335" d="M9 7.364v3.622h5.09c-.225 1.165-.9 2.151-1.912 2.814l3.09 2.398c1.8-1.658 2.84-4.095 2.84-6.989 0-.663-.06-1.3-.17-1.909H9z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.806 5.96-2.181l-3.09-2.398c-.858.575-1.956.914-2.87.914-2.207 0-4.076-1.49-4.744-3.492H1.06v2.474A8.998 8.998 0 0 0 9 18z" />
      <path fill="#4A90E2" d="M4.256 10.843A5.405 5.405 0 0 1 3.99 9c0-.64.11-1.263.306-1.843V4.683H1.06A8.998 8.998 0 0 0 0 9c0 1.451.348 2.824 1.06 4.317l3.196-2.474z" />
      <path fill="#FBBC05" d="M9 3.58c1.321 0 2.507.455 3.44 1.347l2.58-2.58C13.466.89 11.426 0 9 0A8.998 8.998 0 0 0 1.06 4.683l3.236 2.474C4.924 5.07 6.793 3.58 9 3.58z" />
    </svg>
  )
}
