/**
 * Two-way HCP estimate status sync. The office flips estimates Won/Lost
 * inside Housecall Pro; this module reads those statuses back into
 * tz_leads so the TZ Switchboard Lead Pipeline can show + filter by them.
 *
 * Runs in three places:
 *
 *   1. Inline on every Lead Pipeline page load (throttled to 5 min stale
 *      threshold so frequent refreshes don't hammer the HCP API).
 *   2. Manually via POST /api/leads/sync-status (Refresh button in the
 *      Lead Pipeline header).
 *   3. (Future) A Vercel cron job hitting the same endpoint every 10 min.
 *
 * Sequential fetches keep us comfortably under HCP's ~5 req/sec ceiling
 * without explicit rate limiting.
 */

import {
  categorizeEstimateStatus,
  getEstimate,
  rawEstimateStatus,
  type EstimateStatusCategory,
} from './housecall-pro'
import {
  listLeadsNeedingStatusSync,
  markStatusSyncAttempted,
  setEstimateStatus,
} from './leads-store'

export type SyncOptions = {
  staleThresholdMs?: number
  limit?: number
}

export type SyncResult = {
  attempted: number
  updated: number
  unchanged: number
  errors: number
  durationMs: number
}

const DEFAULT_STALE_MS = 5 * 60 * 1000
const DEFAULT_LIMIT = 30

export async function syncEstimateStatuses(
  opts: SyncOptions = {},
): Promise<SyncResult> {
  const start = Date.now()
  const staleThresholdMs = opts.staleThresholdMs ?? DEFAULT_STALE_MS
  const limit = opts.limit ?? DEFAULT_LIMIT

  const targets = await listLeadsNeedingStatusSync(staleThresholdMs, limit)

  let updated = 0
  let unchanged = 0
  let errors = 0

  for (const target of targets) {
    try {
      const estimate = await getEstimate(target.hcp_estimate_id)
      if (!estimate) {
        await markStatusSyncAttempted(target.id)
        errors += 1
        continue
      }

      const rawStatus = rawEstimateStatus(estimate)
      const next = formatStatus(rawStatus, categorizeEstimateStatus(rawStatus, estimate))

      if (next === target.estimate_status) {
        await markStatusSyncAttempted(target.id)
        unchanged += 1
      } else {
        await setEstimateStatus(target.id, next)
        updated += 1
      }
    } catch (e) {
      console.error('[lead-status-sync] failed for', target.id, e)
      try {
        await markStatusSyncAttempted(target.id)
      } catch {
        // ignore cascade failures
      }
      errors += 1
    }
  }

  return {
    attempted: targets.length,
    updated,
    unchanged,
    errors,
    durationMs: Date.now() - start,
  }
}

/**
 * Compose the stored status string in a `category|raw` shape so the UI can
 * render "Won — accepted" while filtering by the reduced category. Strips
 * to category-only when the raw status is missing or matches the category.
 */
function formatStatus(
  raw: string | null,
  category: EstimateStatusCategory,
): string {
  const r = (raw || '').trim()
  if (!r || r.toLowerCase() === category) return category
  return `${category}|${r}`
}

export function parseStoredStatus(
  stored: string | null,
): { category: EstimateStatusCategory; raw: string | null } {
  if (!stored) return { category: 'open', raw: null }
  const [cat, raw] = stored.split('|', 2)
  if (cat === 'won' || cat === 'lost' || cat === 'open') {
    return { category: cat, raw: raw || null }
  }
  return { category: 'open', raw: stored }
}
