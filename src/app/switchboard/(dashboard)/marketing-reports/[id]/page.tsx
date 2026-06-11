import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText, Sparkles } from "lucide-react";
import { getRangeReport } from "@/lib/signal/report-source";
import {
  isSignalRange,
  type HouseCallProSnapshot,
  type SignalBrief,
  type SignalRange,
  type SignalRecommendations,
} from "@/lib/signal/types";
import { BriefMarkdown } from "@/components/switchboard/signal-report/brief-markdown";
import { CHANNEL_COLORS, ChannelDonut, paletteFor } from "@/components/switchboard/signal-report/channel-donut";
import { DeltaPill } from "@/components/switchboard/signal-report/delta-pill";
import { MetricTile } from "@/components/switchboard/signal-report/metric-tile";
import { MockBanner } from "@/components/switchboard/signal-report/mock-banner";
import { RangeTabs } from "@/components/switchboard/signal-report/range-tabs";
import { RecommendationsList } from "@/components/switchboard/signal-report/recommendations-list";
import { SectionCard } from "@/components/switchboard/signal-report/section-card";
import { StatusPill } from "@/components/switchboard/signal-report/status-pill";
import { TrendChart } from "@/components/switchboard/signal-report/trend-chart";

export const metadata = { title: "Report" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_RANGE: SignalRange = "30d";

// TZ is Eastern; render clock times + the pushed-date headline in their tz
// (auto EDT/EST per DST). Date-only values (range start/end) stay UTC so they
// don't shift a calendar day.
const EASTERN_TZ = "America/New_York";

function resolveRange(value: unknown): SignalRange {
  if (isSignalRange(value)) return value;
  return DEFAULT_RANGE;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
}

function formatPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  }).format(n);
}

// Whole-dollar USD, e.g. $542,851 — for booked revenue figures.
function formatUsdWhole(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// Percent change between two points, for rates/positions the API gives as
// current/prior without a precomputed delta.
function cpDelta(cp: { current: number; prior: number }): number {
  if (cp.prior === 0) return cp.current === 0 ? 0 : 100;
  return ((cp.current - cp.prior) / cp.prior) * 100;
}

const VITAL_COLOR: Record<string, string> = {
  good: "#16a34a",
  "needs-improvement": "#d97706",
  poor: "#dc2626",
  na: "currentColor",
};

function ratingLabel(rating: string): string {
  switch (rating) {
    case "good":
      return "Good";
    case "needs-improvement":
      return "Needs work";
    case "poor":
      return "Poor";
    default:
      return "No data";
  }
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "—";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: EASTERN_TZ,
    timeZoneName: "short",
  });
}

// The report's date headline — the instant it was pushed, in Eastern.
function formatPushedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: EASTERN_TZ,
  });
}

function formTypeLabel(t: string | null): string {
  switch (t) {
    case "main-lead":
      return "Booking requests";
    case "contact":
      return "Contact form";
    case "quote":
      return "Quote requests";
    default:
      return t ?? "Lead";
  }
}

function BackLink() {
  return (
    <Link
      href="/switchboard/marketing-reports"
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
    >
      <ArrowLeft className="size-3.5" />
      All reports
    </Link>
  );
}

export default async function ReportDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const range = resolveRange(sp.range);

  // One local lookup: the whole report (all four ranges + recs + brief) was
  // pushed and stored, so we project the requested range and render it at once.
  const report = await getRangeReport(range, id);

  if (!report) {
    return (
      <div className="px-4 py-8 md:px-10 md:py-12 lg:px-14">
        <BackLink />
        <section className="mt-10 rounded-2xl border border-dashed border-gray-200 dark:border-navy-light/40 p-10 text-center md:p-14">
          <h1 className="font-semibold text-2xl tracking-tight text-gray-900 dark:text-white">
            Report not found
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            This report isn&apos;t available. It may not have been pushed yet, or
            the link is out of date.
          </p>
        </section>
      </div>
    );
  }

  const { snapshot, recommendations, brief, mode, pushedAt } = report;

  const ga4 = snapshot.ga4;
  const leadsNative = snapshot.leads_native;
  const sc = snapshot.search_console;
  const ads = snapshot.google_ads;
  const topAd = ads.top_campaigns?.[0];
  const omni = snapshot.omnisend;
  const fb = snapshot.facebook;
  const fbTop = fb.top_post;
  const ig = snapshot.instagram;
  const igTop = ig.top_post;
  const cwv = snapshot.core_web_vitals;
  const cwvMetrics = cwv.metrics;
  const hcp = snapshot.housecall_pro;
  const dailySeries = (ga4?.daily_sessions ?? []).map((d) => d.sessions);
  const channelSegments = (ga4?.channel_breakdown ?? []).slice(0, 7).map((c, i) => ({
    label: c.channel,
    pct: c.pct,
    color: CHANNEL_COLORS[c.channel] ?? paletteFor(i),
  }));

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 lg:px-14">
      {/* Header — date-forward. This is a report from a point in time (when
          Signal pushed it), not a live feed, so it leads with the date. */}
      <header className="space-y-4">
        <BackLink />
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Performance · {snapshot.meta.business.short_name ?? snapshot.meta.business.name}
          </p>
          {mode === "mock" ? <StatusPill status="mock" /> : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-semibold text-4xl leading-tight tracking-tight md:text-5xl text-gray-900 dark:text-white">
              {formatPushedDate(pushedAt)}
            </h1>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Report · pushed {formatTimestamp(pushedAt)}
            </p>
          </div>
          <RangeTabs active={range} basePath={`/switchboard/marketing-reports/${id}`} />
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {snapshot.meta.range.label}, {formatLongDate(snapshot.meta.range.start)} to{" "}
          {formatLongDate(snapshot.meta.range.end)}.{" "}
          <span className="text-gray-500 dark:text-gray-400">
            Compared against {formatLongDate(snapshot.meta.prior_range.start)} to{" "}
            {formatLongDate(snapshot.meta.prior_range.end)}.
          </span>
        </p>
      </header>

      {/* Active CQ build — set expectations that some sections are still being wired. */}
      <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
        <span className="font-semibold">Build in progress.</span> CQ is still
        connecting TZ&apos;s marketing channels. Sections without data yet will
        populate as each integration goes live.
      </div>

      {mode === "mock" ? (
        <div className="mt-6">
          <MockBanner />
        </div>
      ) : null}

      {/* Hero traffic */}
      {ga4?.status === "live" && ga4.sessions ? (
        <section className="mt-10 rounded-2xl border-2 p-6 md:p-9 bg-white dark:bg-[#0A1128]" style={{ borderColor: "#1E40AF" }}>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              Find out how your audience is growing
            </p>
            <h2 className="mt-2 font-semibold text-2xl tracking-tight md:text-3xl text-gray-900 dark:text-white">
              Traffic over the last {snapshot.meta.range.label.replace(/^Last /, "").toLowerCase()}
            </h2>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_240px] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <p className="font-semibold text-5xl leading-none tracking-tight md:text-6xl text-gray-900 dark:text-white">
                  {formatCompact(ga4.sessions.current)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sessions</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <DeltaPill deltaPct={ga4.sessions.delta_pct} withSuffix />
                <span className="text-gray-500 dark:text-gray-400">
                  {formatNumber(ga4.sessions.prior)} prior period
                </span>
              </div>
              {dailySeries.length > 1 ? (
                <div className="mt-5 overflow-hidden">
                  <TrendChart data={dailySeries} height={160} />
                </div>
              ) : null}
            </div>

            {channelSegments.length > 0 ? (
              <div className="lg:flex lg:justify-end">
                <ChannelDonut segments={channelSegments} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* KPI tiles */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <MetricTile
          label="Sessions"
          value={ga4?.sessions ? formatNumber(ga4.sessions.current) : "—"}
          deltaPct={ga4?.sessions?.delta_pct}
        />
        <MetricTile
          label="Users"
          value={ga4?.users ? formatNumber(ga4.users.current) : "—"}
          deltaPct={ga4?.users?.delta_pct}
        />
        <MetricTile
          label="Bounce rate"
          value={ga4?.bounce_rate ? formatPct(ga4.bounce_rate.current) : "—"}
          deltaPct={ga4?.bounce_rate ? cpDelta(ga4.bounce_rate) : undefined}
          invertSign
        />
        <MetricTile
          label="Leads"
          value={leadsNative?.total ? formatNumber(leadsNative.total.current) : "—"}
          deltaPct={leadsNative?.total?.delta_pct}
          highlight
        />
      </section>

      {/* Channels in detail */}
      {ga4?.channel_breakdown && ga4.channel_breakdown.length > 0 ? (
        <div className="mt-10">
          <SectionCard
            eyebrow="Traffic"
            title="Channels in detail"
            action={
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Avg session {formatDuration(ga4.avg_session_duration_sec?.current)}
              </p>
            }
          >
            <ul className="space-y-3">
              {ga4.channel_breakdown.map((c, i) => {
                const color = CHANNEL_COLORS[c.channel] ?? paletteFor(i);
                return (
                  <li key={c.channel} className="grid grid-cols-[180px_1fr_auto] items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{c.channel}</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-gray-50 dark:bg-white/5">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${c.pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="text-right font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                      {formatNumber(c.sessions)}
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{c.pct.toFixed(1)}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      ) : null}

      {/* Top sources + landing pages */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Where they come from" title="Top sources">
          <ul className="divide-y divide-gray-200 dark:divide-navy-light/40">
            {(ga4?.top_sources ?? []).slice(0, 8).map((s) => (
              <li key={s.source} className="flex items-center justify-between py-2.5 text-sm text-gray-900 dark:text-white">
                <span className="truncate">{s.source}</span>
                <span className="font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                  {formatNumber(s.sessions)}
                </span>
              </li>
            ))}
            {(ga4?.top_sources ?? []).length === 0 ? (
              <li className="py-2.5 text-sm text-gray-500 dark:text-gray-400">No source data for this range yet.</li>
            ) : null}
          </ul>
        </SectionCard>
        <SectionCard eyebrow="Where they land" title="Top landing pages">
          <ul className="divide-y divide-gray-200 dark:divide-navy-light/40">
            {(ga4?.top_landing_pages ?? []).slice(0, 8).map((l) => (
              <li key={l.path} className="flex items-center justify-between gap-3 py-2.5 text-sm text-gray-900 dark:text-white">
                <span className="truncate font-mono text-[13px]">{l.path}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                  {formatNumber(l.sessions)}
                </span>
              </li>
            ))}
            {(ga4?.top_landing_pages ?? []).length === 0 ? (
              <li className="py-2.5 text-sm text-gray-500 dark:text-gray-400">No landing page data yet.</li>
            ) : null}
          </ul>
        </SectionCard>
      </div>

      {/* Search performance */}
      {sc.status === "live" && sc.totals ? (
        <div className="mt-6">
          <SectionCard eyebrow="Search · Google" title="Search performance">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricTile
                label="Clicks"
                value={formatNumber(sc.totals.clicks.current)}
                deltaPct={sc.totals.clicks.delta_pct}
              />
              <MetricTile
                label="Impressions"
                value={formatCompact(sc.totals.impressions.current)}
                deltaPct={sc.totals.impressions.delta_pct}
              />
              <MetricTile
                label="CTR"
                value={formatPct(sc.totals.ctr.current)}
                deltaPct={cpDelta(sc.totals.ctr)}
              />
              <MetricTile
                label="Avg position"
                value={sc.totals.position.current.toFixed(1)}
                deltaPct={cpDelta(sc.totals.position)}
                invertSign
              />
            </div>
            {(sc.top_queries ?? []).length > 0 ? (
              <div className="mt-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Top queries
                </p>
                <ul className="mt-3 divide-y divide-gray-200 dark:divide-navy-light/40">
                  {(sc.top_queries ?? []).slice(0, 8).map((q) => (
                    <li
                      key={q.query}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2.5 text-sm text-gray-900 dark:text-white"
                    >
                      <span className="truncate">{q.query}</span>
                      <span className="font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                        {formatNumber(q.clicks)} clicks
                      </span>
                      <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        #{q.position.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </SectionCard>
        </div>
      ) : null}

      {/* Paid search */}
      {ads.status === "live" && ads.totals ? (
        <div className="mt-6">
          <SectionCard eyebrow="Paid · Google Ads" title="Paid search">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricTile
                label="Spend"
                value={formatCurrency(ads.totals.spend.current)}
                deltaPct={ads.totals.spend.delta_pct}
              />
              <MetricTile
                label="Clicks"
                value={formatNumber(ads.totals.clicks.current)}
                deltaPct={ads.totals.clicks.delta_pct}
              />
              <MetricTile
                label="Cost / click"
                value={formatCurrency(ads.totals.cpc.current)}
                deltaPct={cpDelta(ads.totals.cpc)}
                invertSign
              />
              <MetricTile
                label="Conversions"
                value={formatNumber(ads.totals.conversions.current)}
                deltaPct={ads.totals.conversions.delta_pct}
              />
            </div>
            {topAd ? (
              <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">
                Top campaign by spend:{" "}
                <span className="text-gray-900 dark:text-white">{topAd.name}</span> ·{" "}
                {formatCurrency(topAd.spend)} · {formatNumber(topAd.clicks)} clicks
              </p>
            ) : null}
          </SectionCard>
        </div>
      ) : null}

      {/* Email marketing */}
      {omni.status === "live" && omni.totals ? (
        <div className="mt-6">
          <SectionCard eyebrow="Email · Omnisend" title="Email marketing">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricTile
                label="Open rate"
                value={formatPct(omni.totals.open_rate.current)}
                deltaPct={cpDelta(omni.totals.open_rate)}
              />
              <MetricTile
                label="Click rate"
                value={formatPct(omni.totals.click_rate.current)}
                deltaPct={cpDelta(omni.totals.click_rate)}
              />
              <MetricTile
                label="Emails sent"
                value={formatCompact(omni.totals.sends.current)}
                deltaPct={omni.totals.sends.delta_pct}
              />
              <MetricTile
                label="Campaigns"
                value={formatNumber(omni.totals.campaigns.current)}
              />
            </div>
            {(omni.campaigns ?? []).length > 0 ? (
              <ul className="mt-6 divide-y divide-gray-200 dark:divide-navy-light/40">
                {(omni.campaigns ?? []).slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate">{c.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        {formatLongDate(c.sent_date)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                      {formatPct(c.open_rate)} open · {formatPct(c.click_rate)} click
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </SectionCard>
        </div>
      ) : null}

      {/* Organic social */}
      {(fb.status === "live" && fb.totals) || (ig.status === "live" && ig.totals) ? (
        <div className="mt-6">
          <SectionCard eyebrow="Organic social" title="Facebook + Instagram">
            <div className="grid gap-6 lg:grid-cols-2">
              {fb.status === "live" && fb.totals ? (
                <div className="rounded-xl border border-gray-200 dark:border-navy-light/40 p-5">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                    Facebook
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-semibold text-3xl tracking-tight text-gray-900 dark:text-white">
                      {formatNumber(fb.followers ?? 0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">followers</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <span>{formatNumber(fb.totals.posts.current)} posts</span>
                    <span>{formatNumber(fb.totals.engagement.current)} engagement</span>
                  </div>
                  {fbTop ? (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Top post: {fbTop.message.slice(0, 80)} ({fbTop.engagement} eng.)
                    </p>
                  ) : null}
                </div>
              ) : null}
              {ig.status === "live" && ig.totals ? (
                <div className="rounded-xl border border-gray-200 dark:border-navy-light/40 p-5">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                    Instagram
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-semibold text-3xl tracking-tight text-gray-900 dark:text-white">
                      {formatNumber(ig.followers ?? 0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      followers{ig.username ? ` @${ig.username}` : ""}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <span>{formatNumber(ig.totals.posts.current)} posts</span>
                    <span>{formatNumber(ig.totals.likes.current)} likes</span>
                  </div>
                  {igTop ? (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Top post: {(igTop.caption || "Untitled").slice(0, 80)} ({igTop.engagement} eng.)
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      ) : null}

      {/* Core Web Vitals */}
      {cwv.status === "live" && cwvMetrics ? (
        <div className="mt-6">
          <SectionCard
            eyebrow={`Core Web Vitals · ${cwv.data_source === "field" ? "Field data" : "Lab data"}`}
            title="Site speed"
          >
            <div className="grid grid-cols-3 gap-4">
              {(["lcp", "inp", "cls"] as const).map((k) => {
                const m = cwvMetrics[k];
                return (
                  <div key={k} className="rounded-2xl border border-gray-200 dark:border-navy-light/40 p-5">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      {k.toUpperCase()}
                    </p>
                    <p
                      className="mt-2 font-semibold text-3xl tracking-tight text-gray-900 dark:text-white"
                      style={{ color: VITAL_COLOR[m.rating] }}
                    >
                      {m.display_value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{ratingLabel(m.rating)}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {cwv.strategy === "mobile" ? "Mobile" : "Desktop"} Lighthouse performance score:{" "}
              <span className="text-gray-900 dark:text-white">{cwv.performance_score ?? "—"}/100</span>.
            </p>
          </SectionCard>
        </div>
      ) : null}

      {/* Native lead pipeline */}
      {leadsNative?.status === "live" ? (
        <div className="mt-6">
          <SectionCard
            eyebrow="Lead pipeline · TZ Switchboard"
            title="Native form submissions"
            action={
              <a
                href="/switchboard/lead-pipeline"
                className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Open pipeline
                <ArrowUpRight className="size-3.5" />
              </a>
            }
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  By form type
                </p>
                <ul className="mt-3 space-y-2.5">
                  {(leadsNative.by_form_type ?? []).map((b) => (
                    <li
                      key={b.form_type}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-navy-light/40 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    >
                      <span>{formTypeLabel(b.form_type)}</span>
                      <span className="font-mono text-xs font-semibold tabular-nums">{b.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Most recent
                </p>
                <ul className="mt-3 divide-y divide-gray-200 dark:divide-navy-light/40">
                  {(leadsNative.recent ?? []).map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm text-gray-900 dark:text-white">
                      <div className="min-w-0">
                        <p className="truncate">
                          {[r.first_name, r.last_name].filter(Boolean).join(" ") || "Anonymous"}
                          {r.company ? (
                            <span className="text-gray-500 dark:text-gray-400"> · {r.company}</span>
                          ) : null}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                          {formTypeLabel(r.form_type)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-gray-500 dark:text-gray-400">
                        {new Date(r.submitted_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          timeZone: EASTERN_TZ,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {/* Recommendations + brief — already in the pushed payload. */}
      <div className="mt-6">
        <RecommendationsSection recs={recommendations} />
      </div>
      <div className="mt-6">
        <BriefSection brief={brief} />
      </div>

      {/* Jobs & Revenue — Housecall Pro operational data. Comes after all the
          marketing sections; only rendered when the block is live. */}
      {hcp?.status === "live" && hcp.totals ? (
        <div className="mt-6">
          <JobsRevenueSection hcp={hcp} />
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-navy-light/40 pt-6 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-mono uppercase tracking-[0.14em]">
          Data from CQ Signal · Pushed {formatTimestamp(pushedAt)}
        </p>
        <p className="font-mono uppercase tracking-[0.14em]">
          Range · {snapshot.meta.range.key}
        </p>
      </div>
    </div>
  );
}

// --- Below-the-fold sections -------------------------------------------------

function RecommendationsSection({
  recs,
}: {
  recs: SignalRecommendations | null;
}) {
  const hasRecs = Boolean(recs && recs.items.length > 0);
  return (
    <SectionCard
      eyebrow="Signal recommendations"
      title="What to do next"
      action={
        hasRecs && recs ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <Sparkles className="size-3.5" />
            Generated {formatTimestamp(recs.generated_at)}
          </span>
        ) : null
      }
    >
      {hasRecs && recs ? (
        <RecommendationsList items={recs.items} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No recommendations in this report.
        </p>
      )}
    </SectionCard>
  );
}

function BriefSection({ brief }: { brief: SignalBrief }) {
  return (
    <SectionCard
      eyebrow="The brief"
      title="What happened, in plain English"
      action={
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          <FileText className="size-3.5" />
          Markdown
        </span>
      }
    >
      {brief.markdown.trim() ? (
        <BriefMarkdown markdown={brief.markdown} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No brief in this report.</p>
      )}
    </SectionCard>
  );
}

function JobsRevenueSection({ hcp }: { hcp: HouseCallProSnapshot }) {
  const totals = hcp.totals;
  if (!totals) return null;
  const sources = hcp.top_lead_sources ?? [];
  return (
    <SectionCard eyebrow="Operations · Housecall Pro" title="Jobs & Revenue">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <MetricTile
          label="Jobs booked"
          value={formatNumber(totals.jobs.current)}
          deltaPct={totals.jobs.delta_pct}
        />
        <MetricTile
          label="Revenue booked"
          value={formatUsdWhole(totals.revenue.current)}
          deltaPct={totals.revenue.delta_pct}
        />
        <MetricTile
          label="Completed jobs"
          value={formatNumber(totals.completed_jobs.current)}
          deltaPct={totals.completed_jobs.delta_pct}
        />
        <MetricTile
          label="Avg ticket"
          value={formatUsdWhole(totals.avg_ticket.current)}
          deltaPct={cpDelta(totals.avg_ticket)}
        />
      </div>

      {sources.length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Booked revenue by lead source
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-navy-light/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-light/40 text-left">
                  <th className="px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Lead source
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Jobs
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-navy-light/40">
                {sources.map((s) => (
                  <tr key={s.source}>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white">{s.source}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-gray-600 dark:text-gray-300">
                      {formatNumber(s.jobs)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-gray-600 dark:text-gray-300">
                      {formatUsdWhole(s.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
