-- Issue 2 (2026-06-03, David Kloss call): persist the inbound caller ID — the
-- number the call actually came in on — separately from customer_phone.
--
-- Today the voice route writes the caller ID into customer_phone at call start,
-- but then update_visitor_contact OVERWRITES customer_phone with whatever
-- callback number the caller dictates (and Claire transcribes). If she mishears
-- it, the office has no way back to the real line. Keeping both means office
-- notifications + the HCP job note can show the dictated callback number AND the
-- number they're actually calling from.
--
-- Voice-only in practice: web chat has no caller ID; on SMS the inbound number
-- IS the caller. Additive, nullable — old rows and non-voice channels stay NULL
-- and the notification layer collapses to a single number when this is unset.
ALTER TABLE tz_agent_conversations
  ADD COLUMN IF NOT EXISTS inbound_caller_phone TEXT;
