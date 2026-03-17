'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { createClient } from '@/lib/supabase/client'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground'
const rememberedEmailKey = 'tracker.remembered_email'

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const rememberEmailRef = useRef<HTMLInputElement | null>(null)
  const searchParams = useSearchParams()

  const [signInState, signInAction, signInPending] = useActionState(signIn, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, null)

  const isSignIn = mode === 'signin'
  const state = isSignIn ? signInState : signUpState
  const isPending = isSignIn ? signInPending : signUpPending
  const callbackError = searchParams.get('error')
  const callbackInfo = searchParams.get('info')
  const title = isSignIn ? '로그인' : '회원가입'
  const description = isSignIn
    ? '기존 계정이 있으면 이메일 또는 Google로 로그인하세요.'
    : '이메일 또는 Google로 가입할수 있어요.'
  const passwordMismatch = !isSignIn && confirmPassword.length > 0 && password !== confirmPassword

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setPasswordVisible(false)
    setConfirmPasswordVisible(false)
    setPassword('')
    setConfirmPassword('')
    setMode(nextMode)
  }

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(rememberedEmailKey)
    if (!rememberedEmail) return

    if (emailInputRef.current) {
      emailInputRef.current.value = rememberedEmail
    }

    if (rememberEmailRef.current) {
      rememberEmailRef.current.checked = true
    }
  }, [])

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

  const handleEmailSubmit = () => {
    if (isSignIn) {
      const shouldRemember = rememberEmailRef.current?.checked
      const email = emailInputRef.current?.value.trim() ?? ''

      if (shouldRemember && email) {
        window.localStorage.setItem(rememberedEmailKey, email)
      } else {
        window.localStorage.removeItem(rememberedEmailKey)
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isSignIn
                  ? 'bg-white text-[#0f1115]'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !isSignIn
                  ? 'bg-[#68d28c] text-[#08120d]'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              회원가입
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isGooglePending}
          className="w-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
          onClick={handleGoogleSignIn}
        >
          {isGooglePending ? <InlineSpinner className="h-4 w-4" /> : <GoogleMark />}
          {isGooglePending ? 'Connecting to Google…' : 'Google로 계속하기'}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={isSignIn ? signInAction : signUpAction} className="space-y-3" onSubmit={handleEmailSubmit}>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {isSignIn ? '이메일 로그인' : '이메일 회원가입'}
        </p>
        {!isSignIn && (
          <input
            name="name"
            placeholder="Name"
            required
            autoComplete="name"
            className={inputCls}
          />
        )}
        <input
          ref={emailInputRef}
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          className={inputCls}
        />

        <div className="relative">
          <input
            name="password"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Password"
            required
            minLength={8}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
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

        {isSignIn ? (
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                ref={rememberEmailRef}
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-primary"
              />
              이메일 기억하기
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        {!isSignIn && (
          <div className="space-y-2">
            <div className="relative">
              <input
                name="confirm_password"
                type={confirmPasswordVisible ? 'text' : 'password'}
                placeholder="Confirm password"
                required
                minLength={8}
                autoComplete="new-password"
                className={`${inputCls} pr-10`}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={confirmPasswordVisible ? 'Hide password confirmation' : 'Show password confirmation'}
                onClick={() => setConfirmPasswordVisible((value) => !value)}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {confirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordMismatch ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                비밀번호가 일치하지 않습니다.
              </p>
            ) : null}
          </div>
        )}

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
        {callbackInfo && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {callbackInfo}
          </p>
        )}
        {(oauthError || callbackError) && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {oauthError || callbackError}
          </p>
        )}

        <Button type="submit" disabled={isPending || passwordMismatch} className="w-full">
          {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
          {isPending
            ? isSignIn ? 'Signing in…' : 'Creating account…'
            : isSignIn ? '이메일로 로그인' : '이메일 계정 만들기'}
        </Button>

        {!isSignIn ? (
          <p className="text-xs text-muted-foreground">
            가입후 관리자의 승인이 필요합니다.
          </p>
        ) : null}
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {isSignIn ? '계정이 아직 없나요? ' : '이미 계정이 있나요? '}
        <button
          type="button"
          onClick={() => switchMode(isSignIn ? 'signup' : 'signin')}
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {isSignIn ? '회원가입으로 이동' : '로그인으로 이동'}
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
