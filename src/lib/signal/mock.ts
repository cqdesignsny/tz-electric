import type {
  ChannelBreakdownEntry,
  DailySessionsEntry,
  HouseCallProLeadSource,
  LandingPageEntry,
  OmnisendCampaignEntry,
  Recommendation,
  SearchDailyPoint,
  SearchQueryEntry,
  SignalRange,
  SignalRecommendations,
  SignalSnapshot,
  SourceEntry,
} from "./types";

// Stable, hand-tuned numbers. Real shape, plausible scale for a regional home-
// services contractor. Replaced by the real Signal payload once Signal pushes a
// live report. Mirrors the v1 contract in ./types.

const TODAY = "2026-05-17";

type Pair = { current: number; prior: number };

const RANGE_NUMBERS: Record<
  SignalRange,
  {
    label: string;
    start: string;
    end: string;
    priorStart: string;
    priorEnd: string;
    sessions: Pair;
    users: Pair;
    bounce_rate: Pair;
    avg_session_duration_sec: Pair;
    daily_points: number;
    quote_leads_current: number;
    quote_leads_prior: number;
    gsc_clicks: Pair;
    gsc_impressions: Pair;
    gsc_position: Pair;
    ads_spend: Pair;
    ads_clicks: Pair;
    ads_impressions: Pair;
    ads_conversions: Pair;
    omni_sends: Pair;
    omni_campaigns: Pair;
    omni_open_rate: Pair;
    omni_click_rate: Pair;
    fb_posts: Pair;
    ig_posts: Pair;
    hcp_jobs: Pair;
    hcp_completed: Pair;
    hcp_revenue: Pair;
  }
> = {
  "7d": {
    label: "Last 7 days",
    start: "2026-05-11",
    end: "2026-05-17",
    priorStart: "2026-05-04",
    priorEnd: "2026-05-10",
    sessions: { current: 3120, prior: 2754 },
    users: { current: 2245, prior: 1990 },
    bounce_rate: { current: 0.41, prior: 0.44 },
    avg_session_duration_sec: { current: 142, prior: 128 },
    daily_points: 7,
    quote_leads_current: 11,
    quote_leads_prior: 8,
    gsc_clicks: { current: 78, prior: 71 },
    gsc_impressions: { current: 2210, prior: 2040 },
    gsc_position: { current: 21.4, prior: 22.9 },
    ads_spend: { current: 184, prior: 162 },
    ads_clicks: { current: 54, prior: 47 },
    ads_impressions: { current: 2980, prior: 2710 },
    ads_conversions: { current: 1, prior: 1 },
    omni_sends: { current: 4900, prior: 0 },
    omni_campaigns: { current: 1, prior: 0 },
    omni_open_rate: { current: 0.131, prior: 0 },
    omni_click_rate: { current: 0.036, prior: 0 },
    fb_posts: { current: 3, prior: 2 },
    ig_posts: { current: 2, prior: 3 },
    hcp_jobs: { current: 24, prior: 19 },
    hcp_completed: { current: 18, prior: 15 },
    hcp_revenue: { current: 41200, prior: 33800 },
  },
  "30d": {
    label: "Last 30 days",
    start: "2026-04-18",
    end: "2026-05-17",
    priorStart: "2026-03-19",
    priorEnd: "2026-04-17",
    sessions: { current: 12482, prior: 10930 },
    users: { current: 9210, prior: 8077 },
    bounce_rate: { current: 0.43, prior: 0.46 },
    avg_session_duration_sec: { current: 138, prior: 121 },
    daily_points: 30,
    quote_leads_current: 38,
    quote_leads_prior: 27,
    gsc_clicks: { current: 318, prior: 286 },
    gsc_impressions: { current: 9436, prior: 8120 },
    gsc_position: { current: 22.8, prior: 24.1 },
    ads_spend: { current: 798, prior: 712 },
    ads_clicks: { current: 228, prior: 205 },
    ads_impressions: { current: 12850, prior: 11960 },
    ads_conversions: { current: 4, prior: 3 },
    omni_sends: { current: 14070, prior: 9102 },
    omni_campaigns: { current: 3, prior: 2 },
    omni_open_rate: { current: 0.127, prior: 0.123 },
    omni_click_rate: { current: 0.035, prior: 0.03 },
    fb_posts: { current: 9, prior: 7 },
    ig_posts: { current: 8, prior: 6 },
    hcp_jobs: { current: 96, prior: 78 },
    hcp_completed: { current: 81, prior: 66 },
    hcp_revenue: { current: 168400, prior: 139500 },
  },
  "90d": {
    label: "Last 90 days",
    start: "2026-02-17",
    end: "2026-05-17",
    priorStart: "2025-11-19",
    priorEnd: "2026-02-16",
    sessions: { current: 36420, prior: 32108 },
    users: { current: 25910, prior: 23044 },
    bounce_rate: { current: 0.44, prior: 0.47 },
    avg_session_duration_sec: { current: 134, prior: 119 },
    daily_points: 90,
    quote_leads_current: 112,
    quote_leads_prior: 88,
    gsc_clicks: { current: 942, prior: 868 },
    gsc_impressions: { current: 27840, prior: 25210 },
    gsc_position: { current: 23.6, prior: 25.0 },
    ads_spend: { current: 2310, prior: 2040 },
    ads_clicks: { current: 671, prior: 598 },
    ads_impressions: { current: 38200, prior: 35100 },
    ads_conversions: { current: 11, prior: 8 },
    omni_sends: { current: 41200, prior: 33600 },
    omni_campaigns: { current: 9, prior: 7 },
    omni_open_rate: { current: 0.124, prior: 0.121 },
    omni_click_rate: { current: 0.033, prior: 0.031 },
    fb_posts: { current: 26, prior: 22 },
    ig_posts: { current: 23, prior: 19 },
    hcp_jobs: { current: 284, prior: 241 },
    hcp_completed: { current: 248, prior: 209 },
    hcp_revenue: { current: 512800, prior: 438200 },
  },
  "1y": {
    label: "Last 12 months",
    start: "2025-05-18",
    end: "2026-05-17",
    priorStart: "2024-05-18",
    priorEnd: "2025-05-17",
    sessions: { current: 145200, prior: 127400 },
    users: { current: 102300, prior: 89500 },
    bounce_rate: { current: 0.45, prior: 0.48 },
    avg_session_duration_sec: { current: 131, prior: 116 },
    daily_points: 52,
    quote_leads_current: 415,
    quote_leads_prior: 348,
    gsc_clicks: { current: 3980, prior: 3520 },
    gsc_impressions: { current: 118400, prior: 104900 },
    gsc_position: { current: 24.2, prior: 26.3 },
    ads_spend: { current: 8909, prior: 7640 },
    ads_clicks: { current: 2668, prior: 2310 },
    ads_impressions: { current: 154200, prior: 138900 },
    ads_conversions: { current: 39, prior: 31 },
    omni_sends: { current: 168400, prior: 142200 },
    omni_campaigns: { current: 37, prior: 31 },
    omni_open_rate: { current: 0.125, prior: 0.119 },
    omni_click_rate: { current: 0.034, prior: 0.03 },
    fb_posts: { current: 104, prior: 92 },
    ig_posts: { current: 92, prior: 78 },
    hcp_jobs: { current: 1124, prior: 968 },
    hcp_completed: { current: 1008, prior: 872 },
    hcp_revenue: { current: 2184000, prior: 1842000 },
  },
};

function deltaPct(current: number, prior: number): number {
  if (prior === 0) return current === 0 ? 0 : 100;
  return ((current - prior) / prior) * 100;
}

function delta(p: Pair) {
  return { current: p.current, prior: p.prior, delta_pct: deltaPct(p.current, p.prior) };
}

function generateDaily(
  endIso: string,
  points: number,
  totalSessions: number,
  granularity: "day" | "week" = "day",
): DailySessionsEntry[] {
  const result: DailySessionsEntry[] = [];
  const end = new Date(endIso + "T00:00:00Z");
  const baseAvg = totalSessions / points;
  const stepDays = granularity === "week" ? 7 : 1;

  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i * stepDays);
    const dow = d.getUTCDay();
    // Home services skews lighter on weekends. Only apply for daily granularity.
    const weekendFactor =
      granularity === "day" && (dow === 0 || dow === 6) ? 0.55 : 1.0;
    // Stable pseudo-noise from date so the chart is deterministic.
    const seed = d.getUTCFullYear() * 366 + (d.getUTCMonth() + 1) * 31 + d.getUTCDate();
    const noise = Math.sin(seed * 0.78) * 0.18 + Math.cos(seed * 1.33) * 0.11;
    const value = Math.max(1, Math.round(baseAvg * weekendFactor * (1 + noise)));
    result.push({ date: d.toISOString().slice(0, 10), sessions: value });
  }
  return result;
}

function generateDailyClicks(
  endIso: string,
  points: number,
  totalClicks: number,
  totalImpressions: number,
  granularity: "day" | "week" = "day",
): SearchDailyPoint[] {
  const base = generateDaily(endIso, points, totalClicks, granularity);
  const ratio = totalClicks > 0 ? totalImpressions / totalClicks : 0;
  return base.map((d) => ({
    date: d.date,
    clicks: d.sessions,
    impressions: Math.round(d.sessions * ratio),
  }));
}

const CHANNEL_BREAKDOWN: ChannelBreakdownEntry[] = [
  { channel: "Organic Search", sessions: 0, pct: 45 },
  { channel: "Direct", sessions: 0, pct: 22 },
  { channel: "Referral", sessions: 0, pct: 14 },
  { channel: "Organic Social", sessions: 0, pct: 8 },
  { channel: "Paid Search", sessions: 0, pct: 6 },
  { channel: "Email", sessions: 0, pct: 3 },
  { channel: "Other", sessions: 0, pct: 2 },
];

const TOP_SOURCES_BASE: { source: string; share: number }[] = [
  { source: "google", share: 0.43 },
  { source: "(direct) / (none)", share: 0.22 },
  { source: "bing", share: 0.05 },
  { source: "facebook.com", share: 0.045 },
  { source: "instagram.com", share: 0.04 },
  { source: "nextdoor.com", share: 0.035 },
  { source: "yelp.com", share: 0.03 },
  { source: "angi.com", share: 0.02 },
];

const TOP_LANDING_BASE: { path: string; share: number }[] = [
  { path: "/", share: 0.18 },
  { path: "/electrical", share: 0.12 },
  { path: "/hvac", share: 0.085 },
  { path: "/generator", share: 0.075 },
  { path: "/hot-water-heaters", share: 0.06 },
  { path: "/about", share: 0.045 },
  { path: "/service-areas", share: 0.04 },
  { path: "/contact", share: 0.035 },
  { path: "/reviews", share: 0.03 },
  { path: "/financing", share: 0.028 },
];

// Search Console top queries, as shares of total clicks for the range.
const TOP_QUERIES_BASE: { query: string; clickShare: number; imprShare: number; position: number }[] = [
  { query: "tz electric", clickShare: 0.47, imprShare: 0.11, position: 3.1 },
  { query: "electrician near me", clickShare: 0.12, imprShare: 0.18, position: 9.2 },
  { query: "generator installation", clickShare: 0.08, imprShare: 0.05, position: 6.4 },
  { query: "mini split installation", clickShare: 0.05, imprShare: 0.09, position: 11.5 },
  { query: "hvac repair", clickShare: 0.04, imprShare: 0.06, position: 14.8 },
  { query: "panel upgrade cost", clickShare: 0.03, imprShare: 0.04, position: 8.4 },
  { query: "ev charger installer", clickShare: 0.02, imprShare: 0.05, position: 12.1 },
];

const HCP_LEAD_SOURCES: HouseCallProLeadSource[] = [
  { source: "Google Organic", jobs: 31, revenue: 64200 },
  { source: "Google Ads", jobs: 18, revenue: 39800 },
  { source: "Referral", jobs: 14, revenue: 28100 },
  { source: "Repeat customer", jobs: 21, revenue: 22400 },
  { source: "Nextdoor", jobs: 7, revenue: 9300 },
  { source: "Yelp", jobs: 5, revenue: 4600 },
];

const NATIVE_LEADS_RECENT = [
  { submitted_at: "2026-05-17T15:42:00Z", first_name: "Jennifer", last_name: "L.", company: undefined, form_type: "main-lead" as const },
  { submitted_at: "2026-05-16T11:08:00Z", first_name: "Brian", last_name: "K.", company: undefined, form_type: "main-lead" as const },
  { submitted_at: "2026-05-15T19:21:00Z", first_name: "Priya", last_name: "S.", company: undefined, form_type: "main-lead" as const },
  { submitted_at: "2026-05-15T09:54:00Z", first_name: "Dan", last_name: "O.", company: undefined, form_type: "contact" as const },
  { submitted_at: "2026-05-14T17:32:00Z", first_name: "Marisol", last_name: "R.", company: undefined, form_type: "main-lead" as const },
  { submitted_at: "2026-05-13T13:11:00Z", first_name: "Kevin", last_name: "T.", company: undefined, form_type: "main-lead" as const },
  { submitted_at: "2026-05-12T10:47:00Z", first_name: "Anonymous", last_name: undefined, company: undefined, form_type: "contact" as const },
];

function fillChannelSessions(total: number): ChannelBreakdownEntry[] {
  return CHANNEL_BREAKDOWN.map((c) => ({
    ...c,
    sessions: Math.round(total * (c.pct / 100)),
  }));
}

function fillSources(total: number): SourceEntry[] {
  return TOP_SOURCES_BASE.map((s) => ({
    source: s.source,
    sessions: Math.round(total * s.share),
  }));
}

function fillLandings(total: number): LandingPageEntry[] {
  return TOP_LANDING_BASE.map((l) => ({
    path: l.path,
    sessions: Math.round(total * l.share),
  }));
}

function fillQueries(totalClicks: number, totalImpr: number): SearchQueryEntry[] {
  return TOP_QUERIES_BASE.map((q) => {
    const clicks = Math.round(totalClicks * q.clickShare);
    const impressions = Math.max(clicks, Math.round(totalImpr * q.imprShare));
    return {
      query: q.query,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      position: q.position,
    };
  });
}

function omnisendCampaigns(range: SignalRange): OmnisendCampaignEntry[] {
  const all: OmnisendCampaignEntry[] = [
    { id: "c_may2", name: "Spring AC Tune-Up", subject: "Beat the heat: book your AC tune-up", sent_date: "2026-05-14", sends: 5092, opens: 916, clicks: 260, open_rate: 0.18, click_rate: 0.051 },
    { id: "c_may1", name: "May Booster", subject: "Last chance: $50 off panel upgrades", sent_date: "2026-05-15", sends: 4010, opens: 192, clicks: 6, open_rate: 0.048, click_rate: 0.0014 },
    { id: "c_apr2", name: "April Email 2", subject: "Generator season is coming — get ready", sent_date: "2026-04-14", sends: 4968, opens: 894, clicks: 253, open_rate: 0.18, click_rate: 0.051 },
  ];
  if (range === "7d") return all.slice(0, 1);
  if (range === "30d") return all.slice(0, 3);
  return all;
}

const REC_LIBRARY: Recommendation[] = [
  {
    id: "rec_organic_search_climb",
    priority: "high",
    title: "Organic search is up 14% and Electrical is the page pulling it",
    body: "Sessions to `/electrical` climbed faster than the rest of the site this period. Pair the Electrical hero with three priced service anchors above the fold to capture more of that intent into the booking form.",
    source: "ga4",
    metric_refs: ["ga4.channel_breakdown.organic_search", "ga4.top_landing_pages./electrical"],
  },
  {
    id: "rec_generator_landing",
    priority: "high",
    title: "Generator traffic is steady, dedicated landing pages could double conversions",
    body: "`/generator` pulls real volume but the page is a flat list. Build dedicated landing pages for the top brands most-searched alongside `installation` and `cost` modifiers.",
    source: "ga4",
    metric_refs: ["ga4.top_landing_pages./generator"],
  },
  {
    id: "rec_quote_lift",
    priority: "medium",
    title: "Booking requests are up 41%, drag the contact step earlier on mobile",
    body: "On desktop the multi-step form converts fine. On mobile, drop-off concentrates between the service and contact steps. Test consolidating those two into a single screen on viewports under 640px.",
    source: "leads_native",
    metric_refs: ["leads_native.total"],
  },
  {
    id: "rec_mobile_lcp",
    priority: "medium",
    title: "Mobile LCP is in the red, and it's costing you the organic gains",
    body: "Largest Contentful Paint on mobile sits well above the 2.5s threshold. The hero image is the likely culprit. Serve a properly sized, modern-format hero and preload it so the page everyone lands on stops bleeding rank.",
    source: "core_web_vitals",
    metric_refs: ["core_web_vitals.metrics.lcp"],
  },
];

const BRIEF_MARKDOWN_30D = `# TZ Electric performance brief

## Headline
TZ Electric closed the last 30 days at **12,482 sessions** (+14% versus the prior 30), driven by a healthier organic mix and a 41% lift in booking requests.

## What's working
- **Organic Search** is up across the board. \`/electrical\` is the highest-velocity entry point and converts above the site average.
- **Generator** drew steady inbound from organic and referral traffic.
- **Booking form** is converting better since the multi-step rewrite. The new "service first, contact last" order is paying back.

## What's next
Targeted asks for the team:
1. Build brand-specific landing pages for the top generator manufacturers.
2. Run a mobile-only A/B that consolidates the service and contact steps.
3. Fix the mobile hero image to bring LCP back under 2.5 seconds.
`;

export function mockSnapshot(range: SignalRange): SignalSnapshot {
  const r = RANGE_NUMBERS[range];
  const weekly = range === "1y";
  const dailySessions = generateDaily(
    r.end,
    r.daily_points,
    r.sessions.current,
    weekly ? "week" : "day",
  );
  const gscDaily = generateDailyClicks(
    r.end,
    r.daily_points,
    r.gsc_clicks.current,
    r.gsc_impressions.current,
    weekly ? "week" : "day",
  );

  const adsCtr = r.ads_clicks.current / Math.max(1, r.ads_impressions.current);
  const adsCpc = r.ads_spend.current / Math.max(1, r.ads_clicks.current);
  const adsCostPerConv = r.ads_spend.current / Math.max(1, r.ads_conversions.current);
  const omniOpens = Math.round(r.omni_sends.current * r.omni_open_rate.current);
  const omniClicks = Math.round(r.omni_sends.current * r.omni_click_rate.current);
  const omniOpensPrior = Math.round(r.omni_sends.prior * r.omni_open_rate.prior);
  const omniClicksPrior = Math.round(r.omni_sends.prior * r.omni_click_rate.prior);
  const fbEngagement = r.fb_posts.current * 4;
  const igEngagement = r.ig_posts.current * 3;
  const hcpAvgTicket = r.hcp_revenue.current / Math.max(1, r.hcp_jobs.current);
  const hcpAvgTicketPrior = r.hcp_revenue.prior / Math.max(1, r.hcp_jobs.prior);

  return {
    meta: {
      business: {
        slug: "tz-electric",
        name: "TZ Electric",
        short_name: "TZ Electric",
        vertical: "Home services",
        brand_color: "#1E40AF",
        logo_url: "https://tzelectricinc.com/logo.svg",
      },
      range: { key: range, label: r.label, start: r.start, end: r.end },
      prior_range: { start: r.priorStart, end: r.priorEnd },
      generated_at: `${TODAY}T21:00:00Z`,
      integrations: [
        "ga4",
        "search_console",
        "google_ads",
        "omnisend",
        "facebook",
        "instagram",
        "core_web_vitals",
        "housecall_pro",
        "leads_native",
      ],
      pii_included: true,
    },
    ga4: {
      status: "live",
      sessions: delta(r.sessions),
      users: delta(r.users),
      avg_session_duration_sec: delta(r.avg_session_duration_sec),
      bounce_rate: { current: r.bounce_rate.current, prior: r.bounce_rate.prior },
      channel_breakdown: fillChannelSessions(r.sessions.current),
      top_sources: fillSources(r.sessions.current),
      top_landing_pages: fillLandings(r.sessions.current),
      daily_sessions: dailySessions,
    },
    search_console: {
      status: "live",
      site_url: "https://tzelectricinc.com/",
      totals: {
        clicks: delta(r.gsc_clicks),
        impressions: delta(r.gsc_impressions),
        ctr: {
          current: r.gsc_clicks.current / Math.max(1, r.gsc_impressions.current),
          prior: r.gsc_clicks.prior / Math.max(1, r.gsc_impressions.prior),
        },
        position: { current: r.gsc_position.current, prior: r.gsc_position.prior },
      },
      top_queries: fillQueries(r.gsc_clicks.current, r.gsc_impressions.current),
      daily_series: gscDaily,
    },
    typeform: { status: "empty" },
    google_ads: {
      status: "live",
      totals: {
        spend: delta(r.ads_spend),
        clicks: delta(r.ads_clicks),
        impressions: delta(r.ads_impressions),
        conversions: delta(r.ads_conversions),
        ctr: {
          current: adsCtr,
          prior: r.ads_clicks.prior / Math.max(1, r.ads_impressions.prior),
        },
        cpc: { current: adsCpc, prior: r.ads_spend.prior / Math.max(1, r.ads_clicks.prior) },
        cost_per_conv: {
          current: adsCostPerConv,
          prior: r.ads_spend.prior / Math.max(1, r.ads_conversions.prior),
        },
      },
      top_campaigns: [
        {
          id: "camp_leadgen_2025",
          name: "Electrical Services — Search",
          status: "ENABLED",
          spend: r.ads_spend.current,
          clicks: r.ads_clicks.current,
          impressions: r.ads_impressions.current,
          conversions: r.ads_conversions.current,
          ctr: adsCtr,
          cpc: adsCpc,
          cost_per_conv: adsCostPerConv,
        },
      ],
    },
    meta_ads: {
      status: "manual",
      source: "Meta Ads",
      source_description: "Facebook + Instagram paid ads",
      primary: { label: "Ad spend this period", value: "$0", note: "Not running paid ads" },
      secondary: [
        { label: "Leads from ads", value: "0" },
        { label: "Cost per lead", value: "—" },
      ],
      notes:
        "TZ Electric is not currently running Meta paid ads. When that changes, Signal wires the live Meta Ads feed and this card flips to live.",
    },
    instagram: {
      status: "live",
      username: "tzelectricinc",
      followers: 295,
      media_count: 133,
      totals: {
        posts: delta(r.ig_posts),
        likes: delta({ current: r.ig_posts.current * 3, prior: r.ig_posts.prior * 3 }),
        comments: delta({ current: Math.round(r.ig_posts.current * 0.4), prior: Math.round(r.ig_posts.prior * 0.4) }),
        engagement: delta({ current: igEngagement, prior: r.ig_posts.prior * 3 }),
      },
      top_post: {
        id: "ig_top",
        timestamp: "2026-05-09T16:20:00Z",
        media_type: "VIDEO",
        permalink: "https://www.instagram.com/p/tz-panel-upgrade/",
        caption: "Panel upgrade, start to finish in 60 seconds",
        likes: 18,
        comments: 2,
        engagement: 20,
      },
    },
    facebook: {
      status: "live",
      followers: 462,
      page_url: "https://www.facebook.com/tzelectricinc",
      totals: {
        posts: delta(r.fb_posts),
        reactions: delta({ current: r.fb_posts.current * 3, prior: r.fb_posts.prior * 3 }),
        comments: delta({ current: Math.round(r.fb_posts.current * 0.3), prior: Math.round(r.fb_posts.prior * 0.3) }),
        shares: delta({ current: Math.round(r.fb_posts.current * 0.4), prior: Math.round(r.fb_posts.prior * 0.4) }),
        engagement: delta({ current: fbEngagement, prior: r.fb_posts.prior * 4 }),
      },
      top_post: {
        id: "fb_top",
        created_time: "2026-05-06T14:00:00Z",
        message: "Standby generator season is here — schedule your install before fall.",
        permalink: "https://www.facebook.com/tzelectricinc/posts/generator",
        reactions: 11,
        comments: 1,
        shares: 2,
        engagement: 14,
      },
    },
    linkedin: {
      status: "manual",
      source: "LinkedIn",
      source_description: "Organic company page",
      primary: { label: "Page followers", value: "51" },
      secondary: [
        { label: "Post impressions (7d)", value: "6", delta: "-40" },
        { label: "Page visitors (7d)", value: "4", delta: "300" },
        { label: "New followers (7d)", value: "0" },
      ],
      notes:
        "LinkedIn is still manual. The page accrues small organic visibility without active posting. Live wiring lands once TZ builds out a LinkedIn cadence.",
    },
    omnisend: {
      status: "live",
      totals: {
        sends: delta(r.omni_sends),
        opens: { current: omniOpens, prior: omniOpensPrior, delta_pct: deltaPct(omniOpens, omniOpensPrior) },
        clicks: { current: omniClicks, prior: omniClicksPrior, delta_pct: deltaPct(omniClicks, omniClicksPrior) },
        open_rate: { current: r.omni_open_rate.current, prior: r.omni_open_rate.prior },
        click_rate: { current: r.omni_click_rate.current, prior: r.omni_click_rate.prior },
        campaigns: { current: r.omni_campaigns.current, prior: r.omni_campaigns.prior },
      },
      campaigns: omnisendCampaigns(range),
    },
    core_web_vitals: {
      status: "live",
      url: "https://tzelectricinc.com/",
      strategy: "mobile",
      data_source: "lab",
      performance_score: 60,
      performance_rating: "needs-improvement",
      metrics: {
        lcp: { value: 5200, display_value: "5.2 s", rating: "poor" },
        inp: { value: 180, display_value: "180 ms", rating: "needs-improvement" },
        cls: { value: 0.12, display_value: "0.12", rating: "needs-improvement" },
        fcp: { value: 3100, display_value: "3.1 s", rating: "poor" },
      },
    },
    housecall_pro: {
      status: "live",
      source: "Housecall Pro",
      source_description: "Jobs + booked revenue by marketing lead source",
      totals: {
        jobs: delta(r.hcp_jobs),
        revenue: delta(r.hcp_revenue),
        completed_jobs: delta(r.hcp_completed),
        avg_ticket: { current: hcpAvgTicket, prior: hcpAvgTicketPrior },
      },
      top_lead_sources: HCP_LEAD_SOURCES,
    },
    leads_native: {
      status: "live",
      source: "tz-switchboard",
      total: {
        current: r.quote_leads_current,
        prior: r.quote_leads_prior,
        delta_pct: deltaPct(r.quote_leads_current, r.quote_leads_prior),
      },
      by_form_type: [
        { form_type: "main-lead", count: Math.round(r.quote_leads_current * 0.85) },
        { form_type: "contact", count: Math.round(r.quote_leads_current * 0.15) },
      ],
      recent: NATIVE_LEADS_RECENT.slice(0, range === "7d" ? 4 : 7),
    },
  };
}

export function mockRecommendations(range: SignalRange): SignalRecommendations {
  // For 7d, surface fewer recs since the window is small. For 1y, all of them.
  const items =
    range === "7d"
      ? REC_LIBRARY.slice(0, 2)
      : range === "30d"
        ? REC_LIBRARY.slice(0, 3)
        : REC_LIBRARY;
  return {
    items,
    generated_at: `${TODAY}T21:00:00Z`,
    model: "mock",
  };
}

export function mockBrief(range: SignalRange): string {
  // For the mock we keep one brief and label it. Real Signal generates per-range.
  if (range === "30d") return BRIEF_MARKDOWN_30D;
  return BRIEF_MARKDOWN_30D.replace(
    "the last 30 days",
    range === "7d"
      ? "the last 7 days"
      : range === "90d"
        ? "the last 90 days"
        : "the last 12 months",
  );
}
