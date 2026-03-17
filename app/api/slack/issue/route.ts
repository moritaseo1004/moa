import { after, NextRequest, NextResponse } from 'next/server'
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

async function sendSlackFollowUp(
  responseUrl: string,
  {
    text,
    responseType = 'ephemeral',
  }: {
    text: string
    responseType?: 'ephemeral' | 'in_channel'
  },
) {
  if (!responseUrl) return

  const response = await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response_type: responseType,
      replace_original: false,
      text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Slack follow-up failed with status ${response.status}`)
  }
}

async function createSlackIssue(rawBody: string) {
  const payload = parseSlashPayload(rawBody)
  const title = payload.text.trim()

  if (!title) {
    await sendSlackFollowUp(payload.response_url, {
      text: 'Please provide an issue title.\nUsage: `/issue login button not working`',
    })
    return
  }

  const inboxProject = await getInboxProject()
  if (!inboxProject) {
    await sendSlackFollowUp(payload.response_url, {
      text: 'No project found. Please create a project first.',
    })
    return
  }

  const reporter = payload.user_id ? await getUserBySlackId(payload.user_id) : null

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
    await sendSlackFollowUp(payload.response_url, {
      text: 'Failed to create issue. Please try again.',
    })
    return
  }

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

  const reporterMention = reporter
    ? ` — assigned to ${reporter.name}`
    : payload.user_name
      ? ` — reported by @${payload.user_name}`
      : ''

  await sendSlackFollowUp(payload.response_url, {
    responseType: 'in_channel',
    text: `✅ *Issue created in ${inboxProject.name}${reporterMention}*\n> ${title}`,
  })
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

  after(async () => {
    try {
      await createSlackIssue(rawBody)
    } catch (error) {
      const payload = parseSlashPayload(rawBody)
      console.error('[slack/issue] background job failed:', error)
      await sendSlackFollowUp(payload.response_url, {
        text: 'Unexpected error while creating the issue. Please try again.',
      }).catch((followUpError) => {
        console.error('[slack/issue] failed to send error follow-up:', followUpError)
      })
    }
  })

  return ephemeral('Issue request received. Creating it now...')
}
