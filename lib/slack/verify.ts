import { createHmac, timingSafeEqual } from 'crypto'

/** Max age of a Slack request before it is rejected (5 minutes). */
const MAX_AGE_SECONDS = 300

/**
 * Verifies a Slack request using HMAC-SHA256.
 *
 * @see https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature({
  signingSecret,
  rawBody,
  timestamp,
  signature,
}: {
  signingSecret: string
  rawBody: string
  timestamp: string
  signature: string
}): boolean {
  // Reject stale requests to prevent replay attacks
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp, 10)) > MAX_AGE_SECONDS) {
    return false
  }

  const sigBasestring = `v0:${timestamp}:${rawBody}`
  const expected =
    'v0=' + createHmac('sha256', signingSecret).update(sigBasestring).digest('hex')

  // Constant-time comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'))
  } catch {
    return false
  }
}

/** Parses a Slack slash command form-encoded payload into a typed object. */
export interface SlashCommandPayload {
  command: string        // e.g. "/issue"
  text: string           // everything after the command
  user_id: string        // Slack user ID, e.g. "U012AB3CD"
  user_name: string
  channel_id: string
  channel_name: string
  team_id: string
  response_url: string
  trigger_id: string
}

export function parseSlashPayload(body: string): SlashCommandPayload {
  const params = new URLSearchParams(body)
  return {
    command: params.get('command') ?? '',
    text: params.get('text') ?? '',
    user_id: params.get('user_id') ?? '',
    user_name: params.get('user_name') ?? '',
    channel_id: params.get('channel_id') ?? '',
    channel_name: params.get('channel_name') ?? '',
    team_id: params.get('team_id') ?? '',
    response_url: params.get('response_url') ?? '',
    trigger_id: params.get('trigger_id') ?? '',
  }
}
