import "server-only";
import {
  getLatestReport,
  getReportById,
  listReports,
  type StoredReport,
} from "./received-report-store";
import { mockBrief, mockRecommendations, mockSnapshot } from "./mock";
import type {
  SignalBrief,
  SignalRange,
  SignalRecommendations,
  SignalSnapshot,
} from "./types";

// The report source for the marketing reports archive under the push model. TZ
// never pulls Signal live; Signal pushes signed, pre-built payloads (all four
// ranges, each with its snapshot + recommendations + brief) and we store every
// one. The index lists them by date; a detail page projects one report's range.
//
// Producer contract: CQ Signal's src/lib/push/contract.ts (ReportPushPayload).
// Snapshot + recommendations already match the v1 types in ./types; the brief
// arrives as raw markdown and we wrap it to SignalBrief here.

const BUSINESS_SLUG = "tz-electric";

const MOCK_ID = "mock";

type ReceivedRangeBlock = {
  snapshot: SignalSnapshot;
  recommendations: SignalRecommendations | null;
  brief: string;
};

type ReceivedPayload = {
  contract_version: number;
  business: { slug: string; name: string };
  default_range: SignalRange;
  ranges: Partial<Record<SignalRange, ReceivedRangeBlock>>;
  pushed_at: string;
};

export type ReportSourceMode = "push" | "mock";

export type RangeReport = {
  mode: ReportSourceMode;
  /** The stored report's id (or "mock" for the local-dev fallback). */
  id: string;
  /** ISO timestamp Signal built + sent this payload; falls back to receivedAt. */
  pushedAt: string;
  snapshot: SignalSnapshot;
  recommendations: SignalRecommendations | null;
  brief: SignalBrief;
};

/** A row for the reports index (one per push), newest first. */
export type ReportSummary = {
  id: string;
  mode: ReportSourceMode;
  pushedAt: string;
  receivedAt: string;
  sessions: number | null;
  isLatest: boolean;
};

function mockReport(range: SignalRange): RangeReport {
  return {
    mode: "mock",
    id: MOCK_ID,
    pushedAt: new Date().toISOString(),
    snapshot: mockSnapshot(range),
    recommendations: mockRecommendations(range),
    brief: { markdown: mockBrief(range), generated_at: new Date().toISOString() },
  };
}

// With a DB configured we're prod-like: a missing report means "nothing pushed
// yet", so the caller shows a waiting / not-found state rather than fake numbers.
// Without one (pure local dev) fall back to mock so the archive stays
// developable offline.
function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function project(stored: StoredReport, range: SignalRange): RangeReport | null {
  const payload = stored.payload as ReceivedPayload | null;
  const block = payload?.ranges?.[range];
  if (!block || !block.snapshot) return null;
  const pushedAt = payload?.pushed_at ?? stored.receivedAt;
  return {
    mode: "push",
    id: stored.id,
    pushedAt,
    snapshot: block.snapshot,
    recommendations: block.recommendations ?? null,
    brief: { markdown: block.brief, generated_at: pushedAt },
  };
}

/**
 * Project one report's requested range. Pass a report id to open a specific
 * archived report; omit it for the latest. Returns null when the report can't
 * be found in a prod-like env (caller shows a waiting / not-found state); falls
 * back to mock locally.
 */
export async function getRangeReport(
  range: SignalRange,
  reportId?: string,
): Promise<RangeReport | null> {
  let stored: StoredReport | null = null;
  if (reportId && reportId !== MOCK_ID) {
    stored = await getReportById(BUSINESS_SLUG, reportId);
  } else if (!reportId) {
    stored = await getLatestReport(BUSINESS_SLUG);
  }

  if (stored) {
    const projected = project(stored, range);
    if (projected) return projected;
  }

  // Not found (or the "mock" id, or a partial payload): mock locally, else null.
  return hasDb() ? null : mockReport(range);
}

/**
 * Recent reports for the index, newest first, latest flagged. Empty in a
 * prod-like env before the first push; a single mock entry locally so the page
 * is developable offline.
 */
export async function listReportSummaries(): Promise<ReportSummary[]> {
  const rows = await listReports(BUSINESS_SLUG);
  if (rows.length === 0) {
    if (hasDb()) return [];
    const now = new Date().toISOString();
    return [
      { id: MOCK_ID, mode: "mock", pushedAt: now, receivedAt: now, sessions: null, isLatest: true },
    ];
  }
  return rows.map((r, i) => ({
    id: r.id,
    mode: "push" as const,
    pushedAt: r.pushedAt,
    receivedAt: r.receivedAt,
    sessions: r.sessions,
    isLatest: i === 0,
  }));
}
