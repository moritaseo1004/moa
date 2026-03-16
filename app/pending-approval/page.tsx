import { signOut } from '@/lib/actions/auth'
import { getCurrentUserProfile } from '@/lib/user-admin'

export const metadata = { title: 'Pending Approval — Tracker' }

export default async function PendingApprovalPage() {
  const profile = await getCurrentUserProfile()
  const label = profile?.name ?? profile?.email ?? 'Your account'

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/50 p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
          Pending Approval
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{label}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account was created successfully, but an administrator needs to approve access before you can use this service.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please contact your administrator and try again later.
        </p>

        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
