-- Local mirror of Housecall Pro customers for call-time name recognition.
--
-- Why: when a known customer calls, we want the call log to show their NAME
-- instead of a bare phone number, and (later) let Claire skip re-collecting
-- details we already have. Hitting the HCP API live during an inbound call is
-- too slow + rate-limit-risky inside Vapi's ~7.5s assistant-request deadline,
-- so a nightly cron (/api/cron/hcp-customer-sync) snapshots HCP /customers
-- into this table and the voice route does a single indexed Neon lookup.
--
-- Design note (locked, session 25): recognition is SILENT. We attach the name
-- + hcp_customer_id to the conversation row, but Claire does NOT greet by name
-- (avoids creepiness + wrong-name-on-shared-line). See the voice route.
--
-- mobile_phone is stored NORMALIZED to a 10-digit US string (no country code,
-- no punctuation) so it joins directly against the voice route's
-- normalizePhone() output. See normalizeMobile10() in src/lib/hcp-customers.ts.

CREATE TABLE IF NOT EXISTS tz_hcp_customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hcp_customer_id  TEXT NOT NULL UNIQUE,         -- HCP's customer id (cus_...)
  first_name       TEXT,
  last_name        TEXT,
  mobile_phone     TEXT,                         -- normalized 10-digit, nullable
  email            TEXT,
  street           TEXT,
  city             TEXT,
  state            TEXT,
  zip              TEXT,
  last_synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary access path: look up a returning caller by their normalized number.
CREATE INDEX IF NOT EXISTS idx_hcp_customers_mobile_phone
  ON tz_hcp_customers (mobile_phone) WHERE mobile_phone IS NOT NULL;
