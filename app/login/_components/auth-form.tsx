'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground'

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const [signInState, signInAction, signInPending] = useActionState(signIn, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, null)

  const isSignIn = mode === 'signin'
  const state = isSignIn ? signInState : signUpState
  const isPending = isSignIn ? signInPending : signUpPending

  return (
    <div className="space-y-5">
      <form action={isSignIn ? signInAction : signUpAction} className="space-y-3">
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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isSignIn ? 'Signing in…' : 'Creating account…'
            : isSignIn ? 'Sign in' : 'Create account'}
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
