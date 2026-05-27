-- Migration 011: Claire's daily self-improvement analysis log.
--
-- One row per day, populated by /api/cron/claire-daily-analysis (fires at
-- 2 AM ET). Stores baseline metrics + the LLM-generated structured
-- proposals so we can render the daily report email AND track patterns
-- over time for Phase 2 (approval UI) and Phase 3 (selective auto-apply).
--
-- Idempotent: analysis_date is unique. Re-running the cron for the same
-- day overwrites the previous row via ON CONFLICT.

CREATE TABLE IF NOT EXISTS tz_claire_daily_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The date being analyzed (the local NY day whose calls we read).
  -- Unique so re-runs upsert.
  analysis_date DATE NOT NULL UNIQUE,

  -- Baseline metrics computed from raw DB queries (no LLM).
  -- All counts are scoped to analysis_date in America/New_York.
  voice_count INTEGER NOT NULL DEFAULT 0,
  web_chat_count INTEGER NOT NULL DEFAULT 0,
  sms_count INTEGER NOT NULL DEFAULT 0,
  lead_form_count INTEGER NOT NULL DEFAULT 0,
  total_leads INTEGER NOT NULL DEFAULT 0,
  escalation_count INTEGER NOT NULL DEFAULT 0,
  emergency_dispatch_count INTEGER NOT NULL DEFAULT 0,
  silence_timeout_count INTEGER NOT NULL DEFAULT 0,

  -- Free-form metrics blob for anything else we add later without a
  -- migration (avg call duration, tool-call frequency, etc.).
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- LLM-generated structured output. Schema:
  --   {
  --     summary: string,
  --     wins: [{ description, evidence_conversation_ids[] }],
  --     failure_patterns: [{ pattern, severity, n_calls_affected, evidence_conversation_ids[] }],
  --     kb_gaps: [{ question_asked, claire_response, proposed_addition, evidence_conversation_ids[] }],
  --     proposed_prompt_rules: [{ rule, rationale, evidence_conversation_ids[] }],
  --     calls_worth_listening_to: [{ conversation_id, why }],
  --     questions_for_tyler: [{ question, context }]
  --   }
  proposals JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Pre-rendered email artifacts so Phase 2 UI can replay them.
  report_html TEXT,
  report_text TEXT,

  -- Send tracking
  email_sent_at TIMESTAMPTZ,
  email_recipients TEXT[],
  email_error TEXT,

  -- LLM call accounting (tokens × $ rate goes in metrics or per-row cost).
  llm_input_tokens INTEGER DEFAULT 0,
  llm_output_tokens INTEGER DEFAULT 0,
  llm_model TEXT,
  llm_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claire_daily_analysis_date
  ON tz_claire_daily_analysis (analysis_date DESC);
