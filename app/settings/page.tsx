import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { MySlackLinkForm } from './_components/my-slack-link-form'

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile()
  if (!profile) redirect('/login')

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Account settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          계정 정보와 Slack 연동 정보를 여기서 관리합니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-card/50 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-medium">Profile</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              현재 계정에 연결된 기본 정보를 확인할 수 있어요.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium">{profile.name}</p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{profile.email}</p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="mt-1 text-sm font-medium capitalize">{profile.role}</p>
            </div>
          </div>
        </section>

        <MySlackLinkForm defaultSlackUserId={profile.slack_user_id} />
      </div>
    </div>
  )
}
