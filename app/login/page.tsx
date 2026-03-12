import { AuthForm } from './_components/auth-form'

export const metadata = { title: 'Sign in — Tracker' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Tracker</h1>
          <p className="text-sm text-muted-foreground">Internal project & issue tracking</p>
        </div>
        <div className="rounded-xl border border-border p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
