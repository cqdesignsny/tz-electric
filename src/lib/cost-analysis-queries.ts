/**
 * Queries for /switchboard/cost-analysis. All data comes from
 * tz_voice_call_costs (populated by handleEndOfCallReport in
 * src/app/api/agents/voice/server/route.ts). Vapi only retains 14 days,
 * so this table is the only durable record beyond that window.
 */
import { db } from './db'

export type CostPeriod = {
  days: number
  label: string
}

export type CostHeadlineStats = {
  totalCost: number
  totalCalls: number
  totalMinutes: number
  avgCostPerCall: number
  avgCostPerMinute: number
  projectedMonthlyCost: number
  llmCacheRate: number // 0-1
  estTtsCostCreatorPlan: number // 11labs Creator plan ~$0.30/1k chars
  estTtsCostProPlan: number // 11labs Pro plan ~$0.18/1k chars
  totalTtsCharacters: number
}

export type CostByComponent = {
  component: 'vapi' | 'llm' | 'stt' | 'tts' | 'analysis' | 'transport' | 'kb'
  label: string
  totalCost: number
  share: number // 0-1
}

export type CostByDay = {
  day: string // YYYY-MM-DD (Eastern Time)
  totalCost: number
  callCount: number
  totalMinutes: number
}

export type ExpensiveCall = {
  vapiCallId: string
  conversationId: string | null
  customerPhone: string | null
  startedAt: string | null
  durationSeconds: number | null
  totalCost: number
  endedReason: string | null
  llmCost: number
  vapiCost: number
  promptTokens: number
  cachedPromptTokens: number
}

function rangeFrom(days: number): { startDate: Date; prevStartDate: Date } {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevStartDate = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000)
  return { startDate, prevStartDate }
}

export async function getCostHeadlineStats(days: number): Promise<CostHeadlineStats> {
  const { startDate } = rangeFrom(days)
  const sql = db()
  type Row = {
    total_cost: string | null
    total_calls: number
    total_seconds: string | null
    total_prompt_tokens: string | null
    total_cached_tokens: string | null
    total_tts_chars: string | null
  }
  const [row] = (await sql`
    SELECT
      SUM(total_cost)                                  AS total_cost,
      COUNT(*)::int                                    AS total_calls,
      SUM(COALESCE(duration_seconds, 0))               AS total_seconds,
      SUM(COALESCE(llm_prompt_tokens, 0))              AS total_prompt_tokens,
      SUM(COALESCE(llm_cached_prompt_tokens, 0))       AS total_cached_tokens,
      SUM(COALESCE(tts_characters, 0))                 AS total_tts_chars
    FROM tz_voice_call_costs
    WHERE started_at >= ${startDate.toISOString()}
  `) as unknown as Row[]

  const totalCost = Number(row?.total_cost ?? 0)
  const totalCalls = Number(row?.total_calls ?? 0)
  const totalMinutes = Number(row?.total_seconds ?? 0) / 60
  const totalPromptTokens = Number(row?.total_prompt_tokens ?? 0)
  const totalCachedTokens = Number(row?.total_cached_tokens ?? 0)
  const totalTtsChars = Number(row?.total_tts_chars ?? 0)

  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0
  const avgCostPerMinute = totalMinutes > 0 ? totalCost / totalMinutes : 0
  const projectedMonthlyCost = days > 0 ? (totalCost / days) * 30 : 0
  const llmCacheRate = totalPromptTokens > 0 ? totalCachedTokens / totalPromptTokens : 0
  // 11labs Creator: ~$22/mo plan + $0.30/1k chars overage. Pro: ~$99/mo + $0.18/1k chars.
  // We just estimate the per-char cost here; plan-fee inclusion is user-side context.
  const estTtsCostCreatorPlan = (totalTtsChars / 1000) * 0.3
  const estTtsCostProPlan = (totalTtsChars / 1000) * 0.18

  return {
    totalCost,
    totalCalls,
    totalMinutes,
    avgCostPerCall,
    avgCostPerMinute,
    projectedMonthlyCost,
    llmCacheRate,
    estTtsCostCreatorPlan,
    estTtsCostProPlan,
    totalTtsCharacters: totalTtsChars,
  }
}

export async function getCostByComponent(days: number): Promise<CostByComponent[]> {
  const { startDate } = rangeFrom(days)
  const sql = db()
  type Row = {
    vapi: string | null
    llm: string | null
    stt: string | null
    tts: string | null
    analysis: string | null
    transport: string | null
    kb: string | null
    total: string | null
  }
  const [row] = (await sql`
    SELECT
      SUM(vapi_cost)           AS vapi,
      SUM(llm_cost)            AS llm,
      SUM(stt_cost)            AS stt,
      SUM(tts_cost)            AS tts,
      SUM(analysis_cost)       AS analysis,
      SUM(transport_cost)      AS transport,
      SUM(knowledge_base_cost) AS kb,
      SUM(total_cost)          AS total
    FROM tz_voice_call_costs
    WHERE started_at >= ${startDate.toISOString()}
  `) as unknown as Row[]

  const total = Number(row?.total ?? 0)
  const rawBuckets: { component: CostByComponent['component']; label: string; cost: number }[] = [
    { component: 'vapi', label: 'Vapi platform fee', cost: Number(row?.vapi ?? 0) },
    { component: 'llm', label: 'LLM (Claude Haiku 4.5)', cost: Number(row?.llm ?? 0) },
    { component: 'analysis', label: 'Post-call analysis', cost: Number(row?.analysis ?? 0) },
    { component: 'stt', label: 'Deepgram transcription', cost: Number(row?.stt ?? 0) },
    { component: 'tts', label: '11labs TTS (BYOK = $0 here)', cost: Number(row?.tts ?? 0) },
    { component: 'kb', label: 'Knowledge base', cost: Number(row?.kb ?? 0) },
    { component: 'transport', label: 'Transport', cost: Number(row?.transport ?? 0) },
  ]
  return rawBuckets
    .map((b) => ({
      component: b.component,
      label: b.label,
      totalCost: b.cost,
      share: total > 0 ? b.cost / total : 0,
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
}

export async function getCostByDay(days: number): Promise<CostByDay[]> {
  const { startDate } = rangeFrom(days)
  const sql = db()
  type Row = {
    day: string
    total_cost: string | null
    call_count: number
    total_seconds: string | null
  }
  const rows = (await sql`
    SELECT
      TO_CHAR(DATE(started_at AT TIME ZONE 'America/New_York'), 'YYYY-MM-DD') AS day,
      SUM(total_cost)                    AS total_cost,
      COUNT(*)::int                      AS call_count,
      SUM(COALESCE(duration_seconds, 0)) AS total_seconds
    FROM tz_voice_call_costs
    WHERE started_at >= ${startDate.toISOString()}
    GROUP BY 1
    ORDER BY 1 ASC
  `) as unknown as Row[]
  return rows.map((r) => ({
    day: r.day,
    totalCost: Number(r.total_cost ?? 0),
    callCount: r.call_count,
    totalMinutes: Number(r.total_seconds ?? 0) / 60,
  }))
}

export async function getMostExpensiveCalls(days: number, limit = 10): Promise<ExpensiveCall[]> {
  const { startDate } = rangeFrom(days)
  const sql = db()
  type Row = {
    vapi_call_id: string
    conversation_id: string | null
    customer_phone: string | null
    started_at: string | null
    duration_seconds: number | null
    total_cost: string
    ended_reason: string | null
    llm_cost: string
    vapi_cost: string
    llm_prompt_tokens: number
    llm_cached_prompt_tokens: number
  }
  const rows = (await sql`
    SELECT vapi_call_id, conversation_id, customer_phone, started_at,
           duration_seconds, total_cost, ended_reason,
           llm_cost, vapi_cost, llm_prompt_tokens, llm_cached_prompt_tokens
    FROM tz_voice_call_costs
    WHERE started_at >= ${startDate.toISOString()}
    ORDER BY total_cost DESC
    LIMIT ${limit}
  `) as unknown as Row[]
  return rows.map((r) => ({
    vapiCallId: r.vapi_call_id,
    conversationId: r.conversation_id,
    customerPhone: r.customer_phone,
    startedAt: r.started_at,
    durationSeconds: r.duration_seconds,
    totalCost: Number(r.total_cost),
    endedReason: r.ended_reason,
    llmCost: Number(r.llm_cost),
    vapiCost: Number(r.vapi_cost),
    promptTokens: r.llm_prompt_tokens,
    cachedPromptTokens: r.llm_cached_prompt_tokens,
  }))
}
