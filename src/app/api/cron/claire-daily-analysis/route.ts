/**
 * Claire's nightly self-improvement cron handler. Wired to run at 6:00
 * UTC daily via the `crons` array in vercel.json (≈ 2 AM ET, after
 * Tyler's day is done). Pulls yesterday's voice + web chat + SMS
 * conversations + lead-form submissions, computes baseline metrics, runs
 * an LLM pattern pass, persists the structured analysis to
 * tz_claire_daily_analysis, and emails Tyler + Cesar the daily report.
 *
 * Phase 1: observation only. Tyler approves any proposed KB additions
 * manually via /switchboard/knowledge-base; prompt-rule changes still go
 * through Cesar. Phase 2 will add an approval UI.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when
 * the env var is set. Verify before doing any work.
 *
 * Manual fire: GET /api/cron/claire-daily-analysis?date=YYYY-MM-DD with
 * the same Bearer header. Useful for backfilling or re-running.
 */
import { NextRequest, NextResponse } from 'next/server'

import {
  computeBaselineMetrics,
  explicitNYRange,
  persistAnalysis,
  pullDailyData,
  runLLMAnalysis,
  yesterdayNYRange,
} from '@/lib/claire-self-improvement'
import { renderClaireDailyAnalysisEmail } from '@/lib/agent-notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// LLM analysis can take 20-40s on a busy day. Vercel cron functions
// default to 60s on Pro plans; bump for safety.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  // Auth: bearer token check before doing any work.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Date override via ?date=YYYY-MM-DD for manual backfills.
  const url = new URL(req.url)
  const overrideDate = url.searchParams.get('date')
  const range = overrideDate ? explicitNYRange(overrideDate) : yesterdayNYRange()

  // Pull raw data.
  const data = await pullDailyData(range)
  const metrics = computeBaselineMetrics(data)

  // Skip everything (no DB write, no email) on a truly quiet day. Tyler
  // doesn't need a "no calls yesterday" email every weekend morning.
  const hasActivity =
    metrics.voice_count > 0 ||
    metrics.web_chat_count > 0 ||
    metrics.sms_count > 0 ||
    metrics.lead_form_count > 0
  if (!hasActivity) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: `No conversations or leads on ${range.dateLabel}. Skipping.`,
      range,
    })
  }

  // LLM pattern pass. Wrap in try/catch so a model failure still lets us
  // persist the metrics + send a degraded email with just the numbers.
  let proposals
  let llmInputTokens = 0
  let llmOutputTokens = 0
  let llmModel = 'anthropic/claude-opus-4.7'
  let llmError: string | null = null
  try {
    const llm = await runLLMAnalysis(data, metrics)
    proposals = llm.proposals
    llmInputTokens = llm.usage.inputTokens
    llmOutputTokens = llm.usage.outputTokens
    llmModel = llm.model
  } catch (e) {
    llmError = e instanceof Error ? e.message : String(e)
    console.error('[claire-daily-analysis] LLM analysis failed:', llmError)
    proposals = {
      summary: `LLM analysis failed: ${llmError}. Metrics below are computed from raw DB data.`,
      wins: [],
      failure_patterns: [],
      kb_gaps: [],
      proposed_prompt_rules: [],
      calls_worth_listening_to: [],
      questions_for_tyler: [],
    }
  }

  // Render the email.
  const { subject, html, text } = renderClaireDailyAnalysisEmail({
    dateLabel: range.dateLabel,
    metrics,
    proposals,
  })

  // Send via Resend.
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress =
    process.env.DIGEST_FROM_EMAIL ||
    process.env.AGENT_TRAINING_FROM_EMAIL ||
    'TZ Switchboard <notifications@tzelectricinc.com>'
  const replyTo =
    process.env.DIGEST_REPLY_TO ||
    process.env.AGENT_TRAINING_REPLY_TO ||
    'service@tzelectricinc.com'

  const recipients = (
    process.env.CLAIRE_REPORT_TO_EMAILS ||
    process.env.DIGEST_TO_EMAILS ||
    'tyler@tzelectricinc.com,cesar@creativequalitymarketing.com'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  let emailSentAt: Date | null = null
  let emailError: string | null = null

  if (!apiKey) {
    emailError = 'RESEND_API_KEY not set'
  } else if (recipients.length === 0) {
    emailError = 'No recipients configured'
  } else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: recipients,
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown')
        emailError = `Resend ${res.status}: ${errText}`
        console.error('[claire-daily-analysis]', emailError)
      } else {
        emailSentAt = new Date()
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e)
      console.error('[claire-daily-analysis] send failed:', emailError)
    }
  }

  // Persist regardless of email outcome so we have the analysis trail.
  let persistedId: string | null = null
  try {
    const persisted = await persistAnalysis({
      dateLabel: range.dateLabel,
      metrics,
      proposals,
      reportHtml: html,
      reportText: text,
      emailSentAt,
      emailRecipients: emailSentAt ? recipients : null,
      emailError,
      llmInputTokens,
      llmOutputTokens,
      llmModel,
      llmError,
    })
    persistedId = persisted.id
  } catch (e) {
    console.error('[claire-daily-analysis] persist failed:', e)
  }

  return NextResponse.json({
    ok: !llmError && !emailError,
    range,
    persistedId,
    metrics: {
      voice_count: metrics.voice_count,
      web_chat_count: metrics.web_chat_count,
      sms_count: metrics.sms_count,
      lead_form_count: metrics.lead_form_count,
      total_leads: metrics.total_leads,
    },
    proposalCounts: {
      wins: proposals.wins.length,
      failure_patterns: proposals.failure_patterns.length,
      kb_gaps: proposals.kb_gaps.length,
      proposed_prompt_rules: proposals.proposed_prompt_rules.length,
      calls_worth_listening_to: proposals.calls_worth_listening_to.length,
      questions_for_tyler: proposals.questions_for_tyler.length,
    },
    emailSent: !!emailSentAt,
    emailError,
    llmError,
    llmTokens: { input: llmInputTokens, output: llmOutputTokens },
  })
}
