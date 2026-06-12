// Contract types for what TZ Switchboard consumes from CQ Signal.
// Source of truth: CQ Signal's `src/lib/api/v1/snapshot-shape.ts` (the frozen v1
// contract). Last synced 2026-06-12 against Signal's snapshot (added google_lsa).
//
// Signal owns the connectors. TZ only reads. Every block always arrives
// with a `status`; data fields are optional and absent for "empty"/"manual"
// states, so the renderer falls back gracefully.

export type SignalRange = "7d" | "30d" | "90d" | "1y";

export type IntegrationStatus = "live" | "manual" | "empty";

export type Delta = {
  current: number;
  prior: number;
  delta_pct: number;
};

/** Two-point metric where a percent delta isn't meaningful (rates, positions). */
export type CurrentPrior = {
  current: number;
  prior: number;
};

export type SignalBusinessMeta = {
  slug: string;
  name: string;
  short_name?: string | null;
  vertical?: string | null;
  brand_color?: string | null;
  logo_url?: string | null;
};

export type SignalRangeMeta = {
  key: SignalRange;
  label: string;
  start: string;
  end: string;
};

export type SignalMeta = {
  business: SignalBusinessMeta;
  range: SignalRangeMeta;
  prior_range: { start: string; end: string };
  generated_at: string;
  integrations: string[];
  pii_included: boolean;
};

// --- Manual-overlay fields (shared by manual channels + live blocks' fallback) ---

export type ManualMetric = {
  label: string;
  value: string;
  delta?: string;
  note?: string;
};

export type ManualChannelBlock = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- GA4 ---

export type ChannelBreakdownEntry = {
  channel: string;
  sessions: number;
  pct: number;
};

export type SourceEntry = {
  source: string;
  sessions: number;
};

export type LandingPageEntry = {
  path: string;
  sessions: number;
};

export type DailySessionsEntry = {
  date: string;
  sessions: number;
};

export type GA4Snapshot = {
  status: IntegrationStatus;
  sessions?: Delta;
  users?: Delta;
  avg_session_duration_sec?: Delta;
  bounce_rate?: CurrentPrior;
  channel_breakdown?: ChannelBreakdownEntry[];
  top_sources?: SourceEntry[];
  top_landing_pages?: LandingPageEntry[];
  daily_sessions?: DailySessionsEntry[];
};

// --- Search Console ---

export type SearchQueryEntry = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchDailyPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

export type SearchConsoleSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  site_url?: string;
  totals?: {
    clicks: Delta;
    impressions: Delta;
    ctr: CurrentPrior;
    position: CurrentPrior;
  };
  top_queries?: SearchQueryEntry[];
  daily_series?: SearchDailyPoint[];
};

// --- Typeform ---

export type TypeformLeadEntry = {
  id: string;
  submitted_at: string;
  /** Redacted to null when the caller lacks read:leads. */
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
};

export type TypeformSnapshot = {
  status: IntegrationStatus;
  total_leads?: Delta;
  leads?: TypeformLeadEntry[];
};

// --- Google Ads ---

export type GoogleAdsCampaignEntry = {
  id: string;
  name: string;
  status: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cost_per_conv: number;
};

export type GoogleAdsSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  totals?: {
    spend: Delta;
    clicks: Delta;
    impressions: Delta;
    conversions: Delta;
    ctr: CurrentPrior;
    cpc: CurrentPrior;
    cost_per_conv: CurrentPrior;
  };
  /** Sorted by spend desc, max 10. */
  top_campaigns?: GoogleAdsCampaignEntry[];
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Meta Ads ---

export type MetaAdsCampaignEntry = {
  id: string;
  name: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cost_per_conv: number;
};

export type MetaAdsSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  totals?: {
    spend: Delta;
    clicks: Delta;
    impressions: Delta;
    conversions: Delta;
    reach: Delta;
    ctr: CurrentPrior;
    cpc: CurrentPrior;
    cost_per_conv: CurrentPrior;
  };
  /** Sorted by spend desc, max 10. */
  top_campaigns?: MetaAdsCampaignEntry[];
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Google LSA (Local Services Ads — pay-per-lead) ---
// Lead-based, not spend-based: the story is lead volume, charge rate, and cost
// per lead. Mirrors CQ Signal's V1GoogleLsaBlock.

export type GoogleLsaLeadType = {
  type: string;
  label: string;
  leads: number;
};

export type GoogleLsaCategory = {
  category: string;
  label: string;
  leads: number;
};

export type GoogleLsaSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  totals?: {
    leads: Delta;
    charged_leads: Delta;
    credited_leads: Delta;
    cost: Delta;
    cost_per_lead: CurrentPrior;
  };
  /** Current-window lead mix by contact type, desc by leads. */
  by_type?: GoogleLsaLeadType[];
  /** Current-window lead mix by service category, desc by leads. */
  by_category?: GoogleLsaCategory[];
};

// --- Omnisend ---

export type OmnisendCampaignEntry = {
  id: string;
  name: string;
  subject: string;
  sent_date: string;
  sends: number;
  opens: number;
  clicks: number;
  open_rate: number;
  click_rate: number;
};

export type OmnisendSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  totals?: {
    sends: Delta;
    opens: Delta;
    clicks: Delta;
    open_rate: CurrentPrior;
    click_rate: CurrentPrior;
    campaigns: CurrentPrior;
  };
  campaigns?: OmnisendCampaignEntry[];
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Facebook (organic Page) ---

export type FacebookPostEntry = {
  id: string;
  created_time: string;
  message: string;
  permalink: string | null;
  reactions: number;
  comments: number;
  shares: number;
  engagement: number;
};

export type FacebookSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  followers?: number;
  page_url?: string | null;
  totals?: {
    posts: Delta;
    reactions: Delta;
    comments: Delta;
    shares: Delta;
    engagement: Delta;
  };
  posts?: FacebookPostEntry[];
  top_post?: FacebookPostEntry | null;
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Instagram (Business) ---

export type InstagramMediaEntry = {
  id: string;
  timestamp: string;
  media_type: string;
  permalink: string | null;
  caption: string;
  likes: number;
  comments: number;
  engagement: number;
};

export type InstagramSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  username?: string;
  followers?: number;
  media_count?: number;
  totals?: {
    posts: Delta;
    likes: Delta;
    comments: Delta;
    engagement: Delta;
  };
  posts?: InstagramMediaEntry[];
  top_post?: InstagramMediaEntry | null;
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Core Web Vitals (PageSpeed Insights) ---

export type VitalRating = "good" | "needs-improvement" | "poor" | "na";

export type Vital = {
  /** Raw value. Milliseconds for LCP / INP / FCP; unitless for CLS. Null when no data. */
  value: number | null;
  /** Pre-formatted for display: "2.1 s", "180 ms", "0.05". */
  display_value: string;
  rating: VitalRating;
};

export type CoreWebVitalsSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  url?: string;
  strategy?: "mobile" | "desktop";
  /** "field" = real-user CrUX; "lab" = Lighthouse simulation; "none" = neither. */
  data_source?: "field" | "lab" | "none";
  /** Lighthouse performance score 0 to 100. Null when only field data was used. */
  performance_score?: number | null;
  performance_rating?: VitalRating;
  metrics?: {
    lcp: Vital;
    inp: Vital;
    cls: Vital;
    fcp: Vital;
  };
};

// --- HouseCall Pro (jobs + booked revenue by marketing lead source) ---
// TZ's pushed snapshot includes this operational block. Mirrors CQ Signal's
// V1HouseCallProBlock / V1HouseCallProLeadSource.

export type HouseCallProLeadSource = {
  source: string;
  jobs: number;
  revenue: number;
};

export type HouseCallProSnapshot = {
  status: IntegrationStatus;
  source?: string;
  source_description?: string;
  /** Present when status === "live". */
  totals?: {
    jobs: Delta;
    revenue: Delta;
    completed_jobs: Delta;
    avg_ticket: CurrentPrior;
  };
  /** Booked revenue by marketing lead source, desc by revenue. Present when live. */
  top_lead_sources?: HouseCallProLeadSource[];
  // Manual-overlay fallback (status === "manual").
  primary?: ManualMetric;
  secondary?: ManualMetric[];
  notes?: string;
};

// --- Native leads (the admin's own form pipeline, surfaced back through Signal) ---

export type NativeLeadByType = {
  form_type: string;
  count: number;
};

export type NativeLeadRecent = {
  submitted_at: string;
  form_type: string | null;
  /** Redacted/limited when the caller lacks read:leads. */
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
};

export type LeadsNativeSnapshot = {
  status: IntegrationStatus;
  source?: string;
  total?: Delta;
  by_form_type?: NativeLeadByType[];
  recent?: NativeLeadRecent[];
};

// --- The snapshot: every block always present with a status. ---

export type SignalSnapshot = {
  meta: SignalMeta;
  ga4: GA4Snapshot;
  search_console: SearchConsoleSnapshot;
  typeform: TypeformSnapshot;
  google_ads: GoogleAdsSnapshot;
  meta_ads: MetaAdsSnapshot;
  // Optional: payloads pushed before LSA shipped (2026-06-12) lack this block,
  // so guard with `?.` in the renderer rather than assuming it's present.
  google_lsa?: GoogleLsaSnapshot;
  instagram: InstagramSnapshot;
  facebook: FacebookSnapshot;
  linkedin: ManualChannelBlock;
  omnisend: OmnisendSnapshot;
  core_web_vitals: CoreWebVitalsSnapshot;
  housecall_pro: HouseCallProSnapshot;
  leads_native: LeadsNativeSnapshot;
};

// --- Recommendations + brief (separate v1 endpoints) ---

export type RecommendationPriority = "high" | "medium" | "low";

export type Recommendation = {
  id: string;
  priority: RecommendationPriority;
  title: string;
  body: string;
  source: string;
  metric_refs?: string[];
};

export type SignalRecommendations = {
  items: Recommendation[];
  generated_at: string;
  model?: string;
};

export type SignalBrief = {
  markdown: string;
  generated_at: string;
};

export const RANGE_OPTIONS: { key: SignalRange; label: string; shortLabel: string }[] = [
  { key: "7d", label: "Last 7 days", shortLabel: "7d" },
  { key: "30d", label: "Last 30 days", shortLabel: "30d" },
  { key: "90d", label: "Last 90 days", shortLabel: "90d" },
  { key: "1y", label: "Last 12 months", shortLabel: "1y" },
];

export function isSignalRange(value: unknown): value is SignalRange {
  return (
    typeof value === "string" &&
    RANGE_OPTIONS.some((r) => r.key === value)
  );
}
