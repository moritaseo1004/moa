import Link from 'next/link'
import { getUsers } from '@/lib/data/users'
import { requireAdminUser } from '@/lib/user-admin'

export const metadata = { title: 'Users — Tracker' }

function badgeClass(kind: 'approved' | 'pending' | 'admin' | 'member' | 'linked' | 'unlinked') {
  switch (kind) {
    case 'approved':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    case 'pending':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'admin':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
    case 'member':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'linked':
      return 'border-violet-400/20 bg-violet-500/10 text-violet-200'
    case 'unlinked':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-300'
  }
}

export default async function UsersPage() {
  await requireAdminUser()
  const users = await getUsers()

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage access, approval, and roles for workspace users.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Slack</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Approved</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                    {user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badgeClass(user.slack_user_id ? 'linked' : 'unlinked')}`}>
                    {user.slack_user_id ? 'Linked' : 'Not linked'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badgeClass(user.is_approved ? 'approved' : 'pending')}`}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badgeClass(user.role === 'admin' ? 'admin' : 'member')}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
