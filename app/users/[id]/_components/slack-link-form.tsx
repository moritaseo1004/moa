'use client'

import { useActionState } from 'react'
import { updateUserSlackId } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'

export function SlackLinkForm({
  userId,
  defaultSlackUserId,
}: {
  userId: string
  defaultSlackUserId: string | null
}) {
  const [state, action, isPending] = useActionState(updateUserSlackId, null)

  return (
    <form action={action} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <input type="hidden" name="user_id" value={userId} />

      <div className="space-y-1">
        <h3 className="text-sm font-medium">Slack account</h3>
        <p className="text-xs text-muted-foreground">
          Slack 멤버 ID를 연결하면 `/issue`로 생성된 이슈가 이 사용자 기준으로 기록돼.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="slack-user-id" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Slack member ID
        </label>
        <input
          id="slack-user-id"
          name="slack_user_id"
          defaultValue={defaultSlackUserId ?? ''}
          placeholder="U012ABCDEF"
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Slack 프로필의 멤버 ID 또는 사용자 프로필 링크에서 `U...` 형식 값을 넣으면 돼. 비우고 저장하면 연결이 해제돼.
        </p>
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
          {isPending ? 'Saving…' : 'Save Slack link'}
        </Button>
      </div>
    </form>
  )
}
