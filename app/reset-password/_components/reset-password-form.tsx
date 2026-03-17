'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground'

export function ResetPasswordForm() {
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  useEffect(() => {
    let active = true

    async function resolveSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) return

      setValidSession(Boolean(session))
      setReady(true)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setValidSession(Boolean(session))
      setReady(true)
    })

    void resolveSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordMismatch) return

    setError(null)
    setInfo(null)
    setIsPending(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      await supabase.auth.signOut()
      window.location.href = '/login?info=Password updated successfully. Please sign in again.'
    } finally {
      setIsPending(false)
    }
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">Reset password</h1>
        <p className="text-sm text-muted-foreground">Checking your recovery session…</p>
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">Reset password</h1>
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-white">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            name="password"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="New password"
            required
            minLength={8}
            autoComplete="new-password"
            className={`${inputCls} pr-10`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setPasswordVisible((value) => !value)}
            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <input
            name="confirm_password"
            type={confirmVisible ? 'text' : 'password'}
            placeholder="Confirm new password"
            required
            minLength={8}
            autoComplete="new-password"
            className={`${inputCls} pr-10`}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={confirmVisible ? 'Hide password confirmation' : 'Show password confirmation'}
            onClick={() => setConfirmVisible((value) => !value)}
            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {confirmVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {passwordMismatch ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Passwords do not match.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {info}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending || passwordMismatch} className="w-full">
          {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
          {isPending ? 'Updating password…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
