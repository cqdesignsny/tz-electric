-- Delivery-status feedback for after-hours dispatch attempts.
--
-- Why: tz_dispatch_attempts already has twilio_sid, delivered_at, and a status
-- that allows 'delivered'/'failed' — but nothing ever updated them, because no
-- Twilio StatusCallback was wired. An attempt recorded "sent" (Twilio accepted)
-- even when the carrier later rejected it (e.g. SMS error 30034 during the A2P
-- blackout). The new /api/webhooks/twilio-delivery route now receives Twilio's
-- final status and writes it back. This migration adds the one missing field —
-- the carrier/Twilio error code — so the dispatch visibility page can show WHY
-- an attempt failed (30034 = unregistered A2P number, etc.).
--
-- Additive only: a single nullable column. No existing column or data altered.

ALTER TABLE tz_dispatch_attempts ADD COLUMN IF NOT EXISTS error_code TEXT;
