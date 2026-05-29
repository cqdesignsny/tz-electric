-- Follow-Ups hub: record the OUTCOME of a callback, not just that it was closed.
-- Lets the office prove the callback actually happened and what came of it
-- (booked / declined / no answer / left message / wrong number / other).
--
-- Additive: one nullable column on the existing resolutions table.

ALTER TABLE tz_followup_resolutions ADD COLUMN IF NOT EXISTS outcome TEXT;
