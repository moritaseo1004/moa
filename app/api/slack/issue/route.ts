import { NextRequest, NextResponse } from 'next/server'
import { verifySlackSignature, parseSlashPayload } from '@/lib/slack/verify'
import { getInboxProject } from '@/lib/data/projects'
import { getUserBySlackId } from '@/lib/data/users'
import { logActivity } from '@/lib/data/activity'
import { getTodayYmd } from '@/lib/date-utils'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Slack response helpers ────────────────────────────────────────────────────

function ephemeral(text: string) {
  return NextResponse.json({ response_type: 'ephemeral', text })
}

function inChannel(text: string) {
  return NextResponse.json({ response_type: 'in_channel', text })
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Read raw body — required for signature verification
  const rawBody = await req.text()

  // 2. Verify Slack signature
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) {
    console.error('[slack/issue] SLACK_SIGNING_SECRET is not set')
    return ephemeral('Server configuration error. Please contact an admin.')
  }

  const timestamp = req.headers.get('x-slack-request-timestamp') ?? ''
  const signature = req.headers.get('x-slack-signature') ?? ''

  if (!verifySlackSignature({ signingSecret, rawBody, timestamp, signature })) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // 3. Parse payload
  const payload = parseSlashPayload(rawBody)
  const title = payload.text.trim()

  if (!title) {
    return ephemeral(
      'Please provide an issue title.\nUsage: `/issue login button not working`',
    )
  }

  // 4. Resolve Inbox project
  const inboxProject = await getInboxProject()
  if (!inboxProject) {
    return ephemeral('No project found. Please create a project first.')
  }

  // 5. Optionally map Slack user → internal user
  const reporter = payload.user_id ? await getUserBySlackId(payload.user_id) : null

  // 6. Create the issue
  const supabase = createAdminClient()
  const { data: issue, error } = await supabase
    .from('issues')
    .insert({
      title,
      description: null,
      project_id: inboxProject.id,
      status: 'backlog',
      source: 'slack',
      start_date: getTodayYmd(),
      reporter_id: reporter?.id ?? null,
      assignee_id: null,
    })
    .select('id')
    .single()

  if (error || !issue) {
    console.error('[slack/issue] insert failed:', error?.message)
    return ephemeral('Failed to create issue. Please try again.')
  }

  // 7. Activity log
  await logActivity({
    user_id: reporter?.id ?? null,
    entity_type: 'issue',
    entity_id: issue.id,
    action: 'issue_created',
    metadata: {
      title,
      project_id: inboxProject.id,
      source: 'slack',
      start_date: getTodayYmd(),
      slack_user_id: payload.user_id || null,
      slack_channel_id: payload.channel_id || null,
      slack_channel_name: payload.channel_name || null,
      slack_team_id: payload.team_id || null,
    },
  })

  // 8. Respond to Slack
  const reporter_mention = reporter
    ? ` — assigned to ${reporter.name}`
    : payload.user_name
      ? ` — reported by @${payload.user_name}`
      : ''

  return inChannel(
    `✅ *Issue created in ${inboxProject.name}${reporter_mention}*\n> ${title}`,
  )
}
