-- Per-call cost persistence from Vapi's end-of-call-report.
--
-- Why: Vapi's plan retains only 14 days of call history. Without our own
-- record, we can't answer "what did Claire cost this month?" or do any
-- trend analysis. Worse, the cost data Vapi has is the GROUND TRUTH —
-- once it ages out, it's gone forever.
--
-- Populated by handleEndOfCallReport in
-- src/app/api/agents/voice/server/route.ts. UPSERT on vapi_call_id so
-- Vapi retries of the same report don't double-write.

CREATE TABLE IF NOT EXISTS tz_voice_call_costs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vapi_call_id             TEXT NOT NULL UNIQUE, -- Vapi's call.id
  conversation_id          UUID REFERENCES tz_agent_conversations(id) ON DELETE SET NULL,
  customer_phone           TEXT,
  started_at               TIMESTAMPTZ,
  ended_at                 TIMESTAMPTZ,
  duration_seconds         INTEGER, -- ended_at - started_at
  ended_reason             TEXT,

  -- Top-line cost (matches Vapi's cost field, USD).
  total_cost               NUMERIC(10, 4) NOT NULL DEFAULT 0,

  -- Bucketed cost (matches Vapi's costBreakdown fields, USD each).
  vapi_cost                NUMERIC(10, 4) NOT NULL DEFAULT 0,
  llm_cost                 NUMERIC(10, 4) NOT NULL DEFAULT 0,
  stt_cost                 NUMERIC(10, 4) NOT NULL DEFAULT 0,
  tts_cost                 NUMERIC(10, 4) NOT NULL DEFAULT 0, -- 0 when 11labs is BYOK
  analysis_cost            NUMERIC(10, 4) NOT NULL DEFAULT 0, -- sum of summary + structuredData + structuredOutput + successEval
  transport_cost           NUMERIC(10, 4) NOT NULL DEFAULT 0,
  knowledge_base_cost      NUMERIC(10, 4) NOT NULL DEFAULT 0,

  -- LLM token telemetry (helps us spot when prompt-caching kicks in if we
  -- ever add it, and detect prompt bloat).
  llm_prompt_tokens        INTEGER NOT NULL DEFAULT 0,
  llm_cached_prompt_tokens INTEGER NOT NULL DEFAULT 0,
  llm_completion_tokens    INTEGER NOT NULL DEFAULT 0,

  -- TTS volume (drives 11labs BYOK billing on Cesar's account).
  tts_characters           INTEGER NOT NULL DEFAULT 0,

  -- Model + provider snapshots for retrospective audits.
  model_provider           TEXT,
  model_name               TEXT,
  transcriber_provider     TEXT,
  transcriber_model        TEXT,
  voice_provider           TEXT,
  voice_id                 TEXT,

  -- Raw costBreakdown JSON so we can re-derive new metrics later without
  -- a re-fetch from Vapi (which only retains 14d).
  raw_cost_breakdown       JSONB,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_call_costs_started_at
  ON tz_voice_call_costs (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_call_costs_conversation
  ON tz_voice_call_costs (conversation_id);

CREATE INDEX IF NOT EXISTS idx_voice_call_costs_day
  ON tz_voice_call_costs (DATE(started_at AT TIME ZONE 'America/New_York'));
