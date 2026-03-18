import { notFound } from 'next/navigation'
import { updateUserApproval, updateUserAssignable, updateUserRole } from '@/lib/actions/users'
import { getUser } from '@/lib/data/users'
import { requireAdminUser } from '@/lib/user-admin'
import { AccessActionButton } from './_components/access-action-button'
import { SlackLinkForm } from './_components/slack-link-form'

export const metadata = { title: 'User Detail — Tracker' }

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser()
  const { id } = await params
  const user = await getUser(id)

  if (!user) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          <h2 className="text-sm font-medium">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Name" value={user.name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="First provider" value={user.first_auth_provider} />
            <DetailRow label="Last sign-in provider" value={user.last_sign_in_provider} />
            <DetailRow label="Slack" value={user.slack_user_id ? 'Linked' : 'Not linked'} />
            <DetailRow label="Assignable" value={user.is_assignable ? 'Assignable' : 'Unavailable'} />
            <DetailRow label="Approved" value={user.is_approved ? 'Approved' : 'Pending'} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow label="Created" value={new Date(user.created_at).toLocaleString()} />
            <DetailRow label="Last sign in" value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          <h2 className="text-sm font-medium">Access</h2>

          <AccessActionButton
            action={async () => {
              'use server'
              await updateUserApproval(user.id, !user.is_approved)
            }}
            idleLabel={user.is_approved ? 'Revoke approval' : 'Approve user'}
            pendingLabel={user.is_approved ? 'Revoking…' : 'Approving…'}
          />

          <AccessActionButton
            action={async () => {
              'use server'
              await updateUserRole(user.id, user.role === 'admin' ? 'member' : 'admin')
            }}
            idleLabel={user.role === 'admin' ? 'Make member' : 'Make admin'}
            pendingLabel={user.role === 'admin' ? 'Updating role…' : 'Updating role…'}
          />

          <AccessActionButton
            action={async () => {
              'use server'
              await updateUserAssignable(user.id, !user.is_assignable)
            }}
            idleLabel={user.is_assignable ? 'Remove from assignee lists' : 'Allow as assignee'}
            pendingLabel={user.is_assignable ? 'Removing…' : 'Updating…'}
          />

          <p className="text-xs text-muted-foreground">
            Signed in as {admin.name}. Approval, role, and assignable updates take effect after the next refresh.
          </p>
        </section>
      </div>

      <SlackLinkForm userId={user.id} defaultSlackUserId={user.slack_user_id} />
    </div>
  )
}
