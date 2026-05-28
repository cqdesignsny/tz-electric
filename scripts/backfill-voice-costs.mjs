#!/usr/bin/env node
/**
 * One-time backfill of tz_voice_call_costs from Vapi's last 14 days
 * of calls. After this runs, the live end-of-call-report write path in
 * /api/agents/voice/server takes over for new calls.
 *
 * Idempotent: ON CONFLICT (vapi_call_id) DO UPDATE — safe to re-run.
 *
 * Usage:
 *   node scripts/backfill-voice-costs.mjs
 *
 * Requires VAPI_PRIVATE_KEY + DATABASE_URL in .env.local.
 */
import { config as loadDotenv } from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
loadDotenv({ path: join(repoRoot, '.env.local') })

const VAPI_KEY = process.env.VAPI_PRIVATE_KEY
const DB_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!VAPI_KEY) {
  console.error('VAPI_PRIVATE_KEY not set in .env.local')
  process.exit(1)
}
if (!DB_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const sql = neon(DB_URL)
const now = new Date()
const since = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 60_000)

async function fetchVapiCalls() {
  const calls = []
  let createdAtLt
  for (let i = 0; i < 30; i++) {
    let url = `https://api.vapi.ai/call?limit=100&createdAtGt=${encodeURIComponent(since.toISOString())}`
    if (createdAtLt) url += `&createdAtLt=${encodeURIComponent(createdAtLt)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${VAPI_KEY}` } })
    if (!res.ok) {
      console.error(`Vapi /call returned ${res.status}: ${await res.text()}`)
      break
    }
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    calls.push(...batch)
    if (batch.length < 100) break
    createdAtLt = batch[batch.length - 1].createdAt
  }
  return calls
}

function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return null
}

async function findConversationIdByVapiCallId(vapiCallId) {
  const rows = await sql`
    SELECT id FROM tz_agent_conversations WHERE external_call_id = ${vapiCallId} LIMIT 1
  `
  return rows[0]?.id ?? null
}

async function upsertCost(call) {
  const bd = call.costBreakdown || {}
  const a = bd.analysisCostBreakdown || {}
  const analysisTotal =
    (a.summary || 0) + (a.structuredData || 0) + (a.structuredOutput || 0) + (a.successEvaluation || 0)

  const startedAt = call.startedAt || null
  const endedAt = call.endedAt || null
  let durationSeconds = null
  if (startedAt && endedAt) {
    durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000))
  }

  const customerPhone = normalizePhone(call.customer?.number || null)
  const conversationId = await findConversationIdByVapiCallId(call.id)

  const assistant = call.assistant || {}

  await sql`
    INSERT INTO tz_voice_call_costs (
      vapi_call_id, conversation_id, customer_phone,
      started_at, ended_at, duration_seconds, ended_reason,
      total_cost,
      vapi_cost, llm_cost, stt_cost, tts_cost, analysis_cost,
      transport_cost, knowledge_base_cost,
      llm_prompt_tokens, llm_cached_prompt_tokens, llm_completion_tokens,
      tts_characters,
      model_provider, model_name,
      transcriber_provider, transcriber_model,
      voice_provider, voice_id,
      raw_cost_breakdown
    ) VALUES (
      ${call.id}, ${conversationId}, ${customerPhone},
      ${startedAt}, ${endedAt}, ${durationSeconds}, ${call.endedReason || null},
      ${call.cost || 0},
      ${bd.vapi || 0}, ${bd.llm || 0}, ${bd.stt || 0}, ${bd.tts || 0}, ${analysisTotal},
      ${bd.transport || 0}, ${bd.knowledgeBaseCost || 0},
      ${bd.llmPromptTokens || 0}, ${bd.llmCachedPromptTokens || 0}, ${bd.llmCompletionTokens || 0},
      ${bd.ttsCharacters || 0},
      ${assistant.model?.provider || null}, ${assistant.model?.model || null},
      ${assistant.transcriber?.provider || null}, ${assistant.transcriber?.model || null},
      ${assistant.voice?.provider || null}, ${assistant.voice?.voiceId || null},
      ${JSON.stringify(bd)}::jsonb
    )
    ON CONFLICT (vapi_call_id) DO UPDATE SET
      total_cost          = EXCLUDED.total_cost,
      vapi_cost           = EXCLUDED.vapi_cost,
      llm_cost            = EXCLUDED.llm_cost,
      stt_cost            = EXCLUDED.stt_cost,
      tts_cost            = EXCLUDED.tts_cost,
      analysis_cost       = EXCLUDED.analysis_cost,
      transport_cost      = EXCLUDED.transport_cost,
      knowledge_base_cost = EXCLUDED.knowledge_base_cost,
      llm_prompt_tokens          = EXCLUDED.llm_prompt_tokens,
      llm_cached_prompt_tokens   = EXCLUDED.llm_cached_prompt_tokens,
      llm_completion_tokens      = EXCLUDED.llm_completion_tokens,
      tts_characters             = EXCLUDED.tts_characters,
      raw_cost_breakdown         = EXCLUDED.raw_cost_breakdown,
      updated_at                 = NOW()
  `
}

async function main() {
  console.log(`Fetching Vapi calls since ${since.toISOString().slice(0, 19)}…`)
  const calls = await fetchVapiCalls()
  console.log(`Pulled ${calls.length} calls`)

  let written = 0
  let zero = 0
  let totalCost = 0
  for (const c of calls) {
    await upsertCost(c)
    written++
    if ((c.cost || 0) === 0) zero++
    totalCost += c.cost || 0
    if (written % 20 === 0) console.log(`  ${written}/${calls.length} upserted…`)
  }

  console.log()
  console.log(`Done. ${written} rows upserted (${zero} had $0 cost).`)
  console.log(`Total cost recorded: $${totalCost.toFixed(2)}`)
}

main().catch((e) => {
  console.error('Backfill failed:', e)
  process.exit(1)
})
