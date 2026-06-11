/**
 * Stores the report payloads Signal pushes for a business — one row PER PUSH
 * (history), newest first. The admin lists recent reports and opens any one;
 * the latest is what the index highlights.
 *
 * Postgres-backed via Neon when DATABASE_URL is set, with an in-memory fallback
 * for local dev. Schema is created (and migrated from the older one-row-per-slug
 * shape) lazily on first use. Mirrors the convention in src/lib/leads-store.ts.
 */

import { neon } from "@neondatabase/serverless";

export type StoredReport = {
  id: string;
  businessSlug: string;
  receivedAt: string;
  payload: unknown;
};

/** Lightweight row for the reports index — a few scalars pulled out of the
 *  payload jsonb so listing many reports never ships the full blobs. */
export type StoredReportSummary = {
  id: string;
  businessSlug: string;
  receivedAt: string;
  /** pushed_at from the payload (when Signal built it); falls back to receivedAt. */
  pushedAt: string;
  defaultRange: string | null;
  /** 30-day sessions, for a one-line card summary. Null when GA4 is absent. */
  sessions: number | null;
};

const globalForReports = globalThis as unknown as {
  __signalReports?: Map<string, StoredReport[]>;
};
const memStore: Map<string, StoredReport[]> =
  globalForReports.__signalReports ?? (globalForReports.__signalReports = new Map());

function getDbUrl(): string | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url || url.trim() === "") return null;
  return url;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(dbUrl: string): Promise<void> {
  if (schemaReady) return schemaReady;
  const sql = neon(dbUrl);
  schemaReady = (async () => {
    // Migrate the older one-row-per-slug table (business_slug PRIMARY KEY, no
    // id column) to the history shape. It's a regenerable cache, so on the old
    // shape we drop and recreate — a re-push repopulates it. No-op once migrated.
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'signal_reports'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'signal_reports' AND column_name = 'id'
        ) THEN
          DROP TABLE signal_reports;
        END IF;
      END $$;
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS signal_reports (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        business_slug text NOT NULL,
        received_at timestamptz NOT NULL DEFAULT now(),
        payload jsonb NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS signal_reports_slug_received_idx
        ON signal_reports (business_slug, received_at DESC)
    `;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

function rowToReport(row: Record<string, unknown>): StoredReport {
  return {
    id: String(row.id),
    businessSlug: String(row.business_slug),
    receivedAt:
      row.received_at instanceof Date
        ? row.received_at.toISOString()
        : String(row.received_at),
    payload: row.payload,
  };
}

/** Append a pushed report. Each push is its own dated row (no overwrite). */
export async function saveReceivedReport(
  businessSlug: string,
  payload: unknown,
): Promise<void> {
  const receivedAt = new Date().toISOString();
  const dbUrl = getDbUrl();
  if (dbUrl) {
    try {
      await ensureSchema(dbUrl);
      const sql = neon(dbUrl);
      await sql`
        INSERT INTO signal_reports (business_slug, received_at, payload)
        VALUES (${businessSlug}, ${receivedAt}, ${JSON.stringify(payload)}::jsonb)
      `;
      return;
    } catch (err) {
      console.error(
        "[signal-reports] DB insert failed, falling back to memory",
        err,
      );
    }
  }
  const list = memStore.get(businessSlug) ?? [];
  list.unshift({
    id: `mem-${receivedAt}-${list.length + 1}`,
    businessSlug,
    receivedAt,
    payload,
  });
  memStore.set(businessSlug, list);
}

/** The most recently pushed report for a business, or null. */
export async function getLatestReport(
  businessSlug: string,
): Promise<StoredReport | null> {
  const dbUrl = getDbUrl();
  if (dbUrl) {
    try {
      await ensureSchema(dbUrl);
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT id, business_slug, received_at, payload
        FROM signal_reports
        WHERE business_slug = ${businessSlug}
        ORDER BY received_at DESC
        LIMIT 1
      `;
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToReport(row) : null;
    } catch (err) {
      console.error("[signal-reports] DB read failed, falling back to memory", err);
    }
  }
  return memStore.get(businessSlug)?.[0] ?? null;
}

/** A specific report by id, scoped to the business. */
export async function getReportById(
  businessSlug: string,
  id: string,
): Promise<StoredReport | null> {
  const dbUrl = getDbUrl();
  if (dbUrl) {
    try {
      await ensureSchema(dbUrl);
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT id, business_slug, received_at, payload
        FROM signal_reports
        WHERE id = ${id} AND business_slug = ${businessSlug}
        LIMIT 1
      `;
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToReport(row) : null;
    } catch (err) {
      // A malformed (non-uuid) id throws on the cast; treat as not found.
      console.error("[signal-reports] DB read-by-id failed", err);
    }
  }
  return memStore.get(businessSlug)?.find((r) => r.id === id) ?? null;
}

/** Recent reports for the index, newest first. Payload-light (summary scalars). */
export async function listReports(
  businessSlug: string,
  limit = 24,
): Promise<StoredReportSummary[]> {
  const dbUrl = getDbUrl();
  if (dbUrl) {
    try {
      await ensureSchema(dbUrl);
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT
          id,
          business_slug,
          received_at,
          payload->>'pushed_at' AS pushed_at,
          payload->>'default_range' AS default_range,
          (payload #>> '{ranges,30d,snapshot,ga4,sessions,current}')::float8 AS sessions
        FROM signal_reports
        WHERE business_slug = ${businessSlug}
        ORDER BY received_at DESC
        LIMIT ${limit}
      `;
      return (rows as Record<string, unknown>[]).map((row) => {
        const receivedAt =
          row.received_at instanceof Date
            ? row.received_at.toISOString()
            : String(row.received_at);
        return {
          id: String(row.id),
          businessSlug: String(row.business_slug),
          receivedAt,
          pushedAt: row.pushed_at ? String(row.pushed_at) : receivedAt,
          defaultRange: row.default_range ? String(row.default_range) : null,
          sessions: row.sessions == null ? null : Number(row.sessions),
        };
      });
    } catch (err) {
      console.error("[signal-reports] DB list failed, falling back to memory", err);
    }
  }
  return (memStore.get(businessSlug) ?? []).slice(0, limit).map((r) => {
    const p = (r.payload ?? {}) as {
      pushed_at?: string;
      default_range?: string;
      ranges?: { "30d"?: { snapshot?: { ga4?: { sessions?: { current?: number } } } } };
    };
    return {
      id: r.id,
      businessSlug: r.businessSlug,
      receivedAt: r.receivedAt,
      pushedAt: p.pushed_at ?? r.receivedAt,
      defaultRange: p.default_range ?? null,
      sessions: p.ranges?.["30d"]?.snapshot?.ga4?.sessions?.current ?? null,
    };
  });
}
