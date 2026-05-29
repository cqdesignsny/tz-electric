# TZ Electric Website Redesign

Full-stack website redesign migrating from Webflow to Next.js. Built for **TZ Electric, Inc.** (Cooling | Heating | Electrical), serving the Hudson Valley, NY.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 |
| UI | React 19.2.4 |
| Language | TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.2.1 (using `@theme` directive) |
| Animations | Framer Motion 12.35.2 |
| Bundler | Turbopack (default) |
| CMS | Sanity.io (planned) |
| Deployment | Vercel, **[tzelectricinc.com](https://tzelectricinc.com)** (production) |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Dev server runs at [http://localhost:3000](http://localhost:3000).

## Project Structure

The app uses Next.js route groups to keep the public site and the TZ Switchboard cleanly separated. Public chrome (Header, Footer, FloatingCTA, ScrollToTop) and public-site analytics are scoped to `(public)/` and never render on the dashboard.

```
src/
├── middleware.ts                  # Gates /switchboard/* routes (session cookie)
├── app/
│   ├── layout.tsx                 # Root: html, body, fonts, globals only
│   ├── globals.css                # Design system via Tailwind @theme + dark variant
│   ├── robots.ts                  # /robots.txt
│   ├── sitemap.ts                 # /sitemap.xml (50+ URLs)
│   ├── claire/                    # /claire — Web Chat Claire (top-level segment, own minimal layout)
│   │   ├── layout.tsx             # Public Header + PublicAnalytics; no Footer / CTA / FloatingCTA
│   │   └── page.tsx               # Mounts ClaireChat with breadcrumb JSON-LD + theme init script
│   ├── (public)/                  # Public site route group
│   │   ├── layout.tsx             # Public chrome + PublicAnalytics + LocalBusiness JSON-LD
│   │   ├── page.tsx               # Homepage
│   │   ├── (services)/[slug]/     # 7 dynamic service pages
│   │   ├── mitsubishi/            # Mitsubishi Electric landing
│   │   ├── signature-plans/       # Maintenance plan pricing
│   │   ├── maintenance/           # Generator maintenance plans
│   │   ├── about-us/, contact-us/, reviews/, financing/, gallery/,
│   │   │   promotions/, careers/, services/, service-areas/,
│   │   │   privacy-policy/, terms-condition/, cookies/,
│   │   │   accessibility-statement/, refund-cancellation-policy/,
│   │   │   thank-you/, test-signup/
│   │   └── careers/[slug]/        # 6 individual job listing pages (SSG)
│   ├── switchboard/               # TZ Switchboard internal control center
│   │   ├── layout.tsx             # Bare wrapper, page-title template, noindex
│   │   ├── login/                 # Public login form (no chrome)
│   │   │   ├── page.tsx
│   │   │   └── LoginForm.tsx
│   │   └── (dashboard)/           # Auth-gated dashboard with sidebar + persistent right-side Claire panel
│   │       ├── layout.tsx         # Theme init script + DashboardShell
│   │       ├── page.tsx           # Dashboard home (Things to do + module cards)
│   │       ├── agent-training/    # "Talk to Claire" — admin chat + daily-reports browser (live)
│   │       │   └── page.tsx       # Server-rendered last-14 reports + AdminClaireChat client component
│   │       ├── call-logs/         # Voice call transcripts + recordings (master-detail, mobile-friendly)
│   │       ├── web-chat/          # Claire web chat conversations (takeover + reply)
│   │       ├── knowledge-base/    # Editable KB viewer (overrides win; audit + history per section)
│   │       ├── lead-pipeline/     # All captured leads + HCP Won/Lost status sync
│   │       ├── reports/           # Analytics dashboard (lead volume, channel mix, conversation health)
│   │       ├── users/             # Owner-only user management (invite + promote/demote + disable)
│   │       └── <module pages>/    # sms-conversations, employee-training, email-assistant,
│   │                              # office-operations, warehouse-inventory, sales-outbound
│   └── api/
│       ├── agents/
│       │   ├── admin-chat/stream/ # POST: admin Claire streaming (Opus 4.7, owner+admin only)
│       │   ├── web-chat/
│       │   │   ├── stream/        # POST: streaming chat endpoint (AI Gateway, prompt cached, abuse-guarded)
│       │   │   └── conversations/ # POST: takeover / release / close / office_reply
│       │   ├── voice/server/      # POST: Vapi single dispatch (assistant-request, tool-calls, end-of-call-report)
│       │   └── sms/
│       │       ├── webhook/       # Twilio inbound (scaffolded, awaiting A2P 10DLC clearance)
│       │       └── conversations/ # Office actions on SMS threads
│       ├── cron/
│       │   ├── daily-digest/             # 12 UTC: lead + conversation summary email
│       │   ├── dispatch-escalation/      # */5 min: walks open after-hours dispatches, escalates per SOP
│       │   └── claire-daily-analysis/    # 6 UTC: nightly self-improvement learning report (Opus 4.7)
│       ├── leads/submit/          # Form + agent shared lead-routing pipeline (HCP customer + estimate + Job Inbox + tz_leads)
│       ├── switchboard/
│       │   ├── users/invite/      # Owner-only invite endpoint (sends Resend welcome email)
│       │   ├── users/<actions>/   # Promote / demote / disable / permissions
│       │   ├── knowledge-base/override/  # KB override write (audit-logged, history-tracked)
│       │   └── auth/              # /login + /logout cookie session
├── components/
│   ├── ui/                        # Button, Badge, Card, SectionHeader, StarRating, TrustIndexWidget
│   ├── layout/                    # Header (sticky, dropdowns), Footer (4-col + Admin link, slim CTA)
│   ├── analytics/                 # PublicAnalytics (GTM + GA4 + Google Ads + Meta Pixel + Hotjar) — used by (public)/ and claire/
│   ├── chat/                      # ClaireChat, ChatThemeProvider, ChatThemeToggle (used on /claire)
│   ├── switchboard/               # DashboardShell (3-col layout, mounts SwitchboardClairePanel),
│   │                              # Sidebar, TopBar, ThemeProvider, ThemeToggle,
│   │                              # ModuleInfoPage, nav-config, SmsConversationsClient,
│   │                              # WebChatConversationsClient, CallLogsClient (mobile master-detail),
│   │                              # LeadPipelineClient, RecentLeadsCard, KnowledgeBaseNav,
│   │                              # AdminClaireChat (full-page chat at /agent-training),
│   │                              # DailyReportsBrowser (collapsible cards),
│   │                              # SwitchboardClairePanel (always-open right column on lg+ / bubble on <lg)
│   ├── sections/                  # HeroSection, TrustBar, ServicesGrid, WhyChooseUs,
│   │                              # ReviewsSection, ServiceAreaSection, CTASection,
│   │                              # ServicePageTemplate, CertificationSlider
│   ├── forms/                     # LeadForm, lead-form-config, ConversionTracker
│   └── effects/                   # ElectricCursor (canvas particle system), ScrollToTop
└── lib/
    ├── constants.ts               # Company data, nav, services, analytics IDs
    ├── metadata.ts                # SEO utilities, JSON-LD schema generators
    ├── services-data.ts           # 7 service pages data (features, FAQs, content)
    ├── service-areas-data.ts      # 7 cities + 5 counties
    ├── mitsubishi-data.ts         # Mitsubishi landing page content
    ├── signature-plans-data.ts    # Maintenance plan tiers and pricing
    ├── maintenance-data.ts        # Generator maintenance plans
    ├── careers-data.ts            # 6 job listings with full content
    ├── team-data.ts               # Team members
    ├── housecall-pro.ts           # HCP API client (customer search, create, tag)
    ├── switchboard-auth.ts        # HMAC session token for /switchboard/* (legacy, transition fallback)
    ├── auth-config.ts             # NextAuth.js v5 setup (Google OAuth, role allowlists, domain restriction)
    ├── current-user.ts            # requireModuleAccess() and signed-in user helpers
    ├── modules.ts                 # ModuleSlug union, default role-based access policy
    ├── agent-prompt.ts            # buildSystemPrompt — KB + persona + voice + security + mission + per-channel framing
    ├── agent-tools.ts             # buildAgentTools — update_visitor_contact, find_existing_customer,
    │                              # create_lead_with_estimate, lookup_business_hours, flag_for_office_review,
    │                              # escalate_emergency, dispatch_after_hours_emergency. Shared by web chat, voice, SMS.
    ├── after-hours-dispatch.ts    # dispatchAfterHoursEmergencyImpl (the Claire tool body) + runEscalationTick
    │                              # (cron worker). Real Twilio cascade per Tyler's SOP: T+0 / T+15 / T+30 add
    │                              # supervisor / T+60 final / T+65 customer "team tied up" callback.
    ├── on-call.ts                 # getOnCall(role, at) + getSupervisorChain() — reads tz_on_call_schedule
    ├── twilio-outbound.ts         # sendSms + placeCall via Twilio REST (no SDK dep)
    ├── agent-conversations.ts     # tz_agent_conversations + tz_agent_messages helpers (find/start, append, takeover, etc.)
    ├── agent-knowledge-base.ts    # Loads + merges base KB (markdown) with tz_kb_overrides (Tyler-edited)
    ├── leads-store.ts             # tz_leads insert + HCP linkage helpers
    ├── attribution.ts             # deriveChannel(), leadValueCents(), attribution snapshot helpers
    ├── lead-tracking.ts           # Client-side first/last-touch tracking (gclid, utm_*, referrer)
    ├── db.ts                      # Neon HTTP client (singleton)
    ├── housecall-pro.ts           # HCP API client + empirical findings docs
    ├── twilio-signature.ts        # Twilio inbound webhook signature verification
    ├── email-templates.ts         # Branded HTML email layout + per-email functions
    └── utils.ts                   # cn(), formatPhone()
```

## TZ Switchboard (Internal Control Center)

The TZ Switchboard at `/switchboard` is the operational backend for TZ Electric. Auth-gated via single-password admin login. HMAC-signed cookie session, 30-day TTL. Public footer has a discreet "Admin" link in the bottom bar.

**Persistent right-side Claire panel (LIVE 2026-05-27, owner + admin only):** every Switchboard page renders a permanent right column on lg+ (1024px+) with Claire (Opus 4.7) always open. Layout is true 3-column: left nav (256px) + main content (flex-1) + Claire (320/380/420px scaled to screen). Mobile (<lg) gets a floating bubble + full-screen modal. Mounted inside `DashboardShell` so it survives in-app navigation; conversation messages persist via localStorage. Backend is `/api/agents/admin-chat/stream`. Page-context awareness was tried in three rounds and removed (see HANDOFF session 24) — Claire answers generically about capabilities and asks "which one?" when the user references "this X". Cleaner than promising context she can't reliably read.

**Live modules:**
- **Talk to Claire** (`/switchboard/agent-training`) **— LIVE 2026-05-27.** Rebuilt from the old discovery questionnaire into a chat interface where Tyler / Terry / Cesar can read + edit the KB conversationally. Top of the page shows the last 14 nightly self-improvement reports as expandable cards. Below: full-page admin chat with Claire (Opus 4.7). KB edits go through a propose-then-approve flow (`propose_kb_edit` shows the diff, user says yes, `apply_kb_edit` writes to `tz_kb_overrides`). Owner + admin only. Original questionnaire was submitted by Tyler 2026-04-26; the canonical KB content lives at [`docs/agent-training-answers.md`](docs/agent-training-answers.md). A graphify structure analysis snapshot lives at [`docs/kb-analysis/`](docs/kb-analysis/) — 127 nodes, 10 communities, 5 named multi-section flows.
- **Knowledge Base** (`/switchboard/knowledge-base`), structured browseable view of the agent training answers doc with sticky section nav, scroll-spy, and full markdown styling. Owners + admins see Edit / Revert per section. Tyler-authored overrides land in `tz_kb_overrides` (Neon) and **always win on render and in agent prompts**, even if CQ later updates the base markdown. `tz_kb_override_history` keeps every revision; `tz_audit_log` stamps every edit.
- **Lead Pipeline** (`/switchboard/lead-pipeline`), reads from `tz_leads` (Neon). Filters (search, service, channel, status). Two-way HCP Won/Lost sync. Channel chip + paid/organic/referral/direct stat cards. Deep-link to HCP estimate.
- **Web Chat** (`/switchboard/web-chat`) **— LIVE 2026-05-01.** Office-side viewer for `/claire` conversations. Thread list with visitor name + phone + attribution channel + "Lead captured" badge. Active thread shows full transcript including collapsible tool-call rows, first-touch attribution strip with lead deep-link, takeover/release/close, office reply composer. Channel-agnostic actions API at `/api/agents/web-chat/conversations`.
- **Call Logs** (`/switchboard/call-logs`) **— LIVE 2026-05-13.** Read-only viewer for Voice Claire (`+15186786153`) inbound calls. Two-pane layout, status filter pills, inline audio playback of the Vapi recording, two-sided transcript (customer + Claire) with collapsible tool-call rows, Vapi call-id debug pill, deep link to any lead Claire booked.
- **SMS Conversations** (`/switchboard/sms-conversations`), live SMS thread viewer with takeover. Same shape as Web Chat. Twilio number + webhooks wired; awaits A2P 10DLC carrier review (1-2 weeks) before real-customer SMS delivers reliably.
- **Reports** (`/switchboard/reports`) **— LIVE 2026-05-08.** Lead volume by day stacked by channel, channel breakdown with pipeline value, service mix, Claire conversation health, "Conversations to review" with reason badges. CSV export. Daily digest email at 8 AM ET to ownership via Vercel Cron + Resend.
- **Users** (`/switchboard/users`), owner-only. Invite, role grant / revoke, disable, login_count + last sign-in tracking, per-user module access overrides. Invite emails now fire via Resend on every new user-add (2026-05-27 fix; old invites only created a DB row).

**Claire's nightly self-improvement loop (LIVE 2026-05-27):** every day at 2 AM ET (6 UTC), `/api/cron/claire-daily-analysis` pulls all prior-day voice + web chat + SMS + lead-form activity, runs a structured Opus 4.7 pass (Zod schema via `generateObject`) over the transcripts, produces proposals (wins, failure patterns with severity + N affected, KB gaps with paste-ready additions, proposed prompt rules with rationale, calls worth listening to, questions for the team), persists everything to the new `tz_claire_daily_analysis` table (migration 011), and emails Tyler + Cesar a daily learning report. Phase 1 is observation only — Tyler approves changes via the Talk to Claire chat. Cost: ~$0.50/day. Cron-secret-gated via `CRON_SECRET` env var; manual-fire backfills any past day via `?date=YYYY-MM-DD`.

**Coming Soon and Planned modules:** every sidebar item is clickable and opens a dedicated info page describing what we'll build there. Shared `ModuleInfoPage` template reads from `nav-config.ts`:
- Employee Training (Trainual)
- Email Assistant, Office Operations, Warehouse & Inventory, Sales & Outbound

**Theme:** Light / Dark / System segmented toggle in the topbar, prominent on every screen size. Defaults to System (follows OS preference). The `dark` variant is scoped to `[data-theme="dark"]` so it only applies inside the TZ Switchboard. Public site stays light only.

**Required environment variables (Production + Development):**
- `SWITCHBOARD_PASSWORD`, admin login password
- `SWITCHBOARD_SESSION_SECRET`, HMAC secret for signing session cookies (≥16 chars, random)
- `RESEND_API_KEY`, Resend API key (account under `tzelectricoffice@gmail.com`, domain `tzelectricinc.com` verified)

**Optional environment variables:**
- `AGENT_TRAINING_FROM_EMAIL`, default `TZ Switchboard <notifications@tzelectricinc.com>`
- `AGENT_TRAINING_TO_EMAIL`, default `cesar@creativequalitymarketing.com`
- `AGENT_TRAINING_REPLY_TO`, default `service@tzelectricinc.com`

If `RESEND_API_KEY` is missing, submissions are accepted but not emailed (graceful degradation).
If `SWITCHBOARD_SESSION_SECRET` is missing, login throws a 503 with a clear message.

## Email System

All outbound email goes through Resend on a verified `tzelectricinc.com` domain. Templates live in `src/lib/email-templates.ts` (shared shell + customer-facing templates), `src/lib/digest-email.ts` (daily digest), and `src/lib/agent-notifications.ts` (Claire's per-tool office notifications):

- `renderEmailLayout()` — the shared branded shell. Top gradient strip, TZ logo on white header, eyebrow, heading, intro, optional stats row, body block, optional CTA pill button, branded footer. Inline-styled, table-based for cross-client compatibility (Apple Mail, Gmail, Outlook, Yahoo). Mobile-responsive.
- `renderQuestionnaireSubmissionEmail()` — questionnaire submission email.
- `renderLeadFormSubmissionEmail()` — fired on every web form submission.
- `renderDailyDigestEmail()` (in `digest-email.ts`) — daily 8 AM ET summary of yesterday's lead + Claire conversation activity. Triggered by Vercel Cron at `/api/cron/daily-digest`.
- `sendOfficeFlagEmail()` (in `agent-notifications.ts`) — fires when Claire calls `flag_for_office_review`. Priority badge + customer info + reason + Switchboard CTA.
- `sendEmergencyEscalationEmail()` (in `agent-notifications.ts`) — fires when Claire calls `escalate_emergency`. Red banner + tap-to-call link to the customer's phone.
- `sendClaireLeadCapturedEmail()` (in `agent-notifications.ts`) — fires when Claire calls `create_lead_with_estimate`. Lead summary + qualification + HCP estimate link.

Recipients default to the office team (Tyler/Terry/service@/Cesar); override per-feature via `LEAD_FORM_TO_EMAILS` (operational alerts) or `DIGEST_TO_EMAILS` (daily digest).

## Pages

The public site has 50+ static and dynamic routes including the homepage, 7 service pages, sub-service pages, the Mitsubishi landing, signature plans, maintenance plans, about, contact, reviews, financing, gallery, promotions, careers (with 6 individual job pages), 7 city pages, 5 county pages, 5 legal pages, the lead form at `/quote`, the hidden `/thank-you` page, and **`/claire`** (full-page web chat surface, top-level segment with its own minimal layout).

Two campaign-specific landings:
- **`/stay-cool`** — billboard QR target for the summer mini-split campaign. `noIndex`, UTM-trackable.
- **`/hvac-maintenance`** — modular per-component maintenance pricing from Tyler's 2026-05-07 doc. Tables for per-component pricing, common-system pricing, deep-clean policy, FAQs.

The TZ Switchboard adds 14+ more (login, dashboard home, agent training, knowledge base, lead pipeline, web chat conversations, SMS conversations, users, **reports** with daily digest cron, plus the remaining module info pages).

## Design System

Defined in `globals.css` using Tailwind CSS 4 `@theme`:

- **Colors:** Navy (`#0F1C3F`), Blue (`#1E40AF`), Blue Light (`#2563EB`), Gold (`#C9A84C`), Accent Orange (`#F97316`), Success (`#059669`), Warning (`#D97706`), Danger (`#DC2626`)
- **Typography:** Montserrat (headings), Manrope (body)
- **Spacing:** `section-padding`, `container-site` utility classes
- **Components:** Cards with hover shadows, gradient hero overlays, blue-branded accordions
- **Dark mode:** scoped via `@custom-variant dark (&:where([data-theme="dark"], …))`, only inside TZ Switchboard

## Key Features

- **Hero Image Slider**, 6 cycling photos with navy gradient overlay
- **Electric Cursor Effect**, canvas-based particle system on all page heroes
- **Certification Slider**, infinite-scrolling logo carousel with grayscale to color hover
- **Luxury Design**, rounded-full buttons, scale hover, deep navy palette
- **County Landing Pages**, 5 county-level SEO pages with towns grid
- **Trust Index Integration**, live Google reviews widget on reviews page + homepage
- **Social Media Integration**, Facebook, Instagram, YouTube, Google, Nextdoor
- **SEO**, custom meta per page, LocalBusiness + BreadcrumbList JSON-LD, county-level targeting
- **Responsive**, mobile-first, sticky header, mobile menu, touch-friendly
- **TZ Switchboard**, internal admin dashboard with theme toggle, gated routes, branded emails

## Analytics & Tracking

All scripts loaded directly in `(public)/layout.tsx` so they only fire on the public site (not on the TZ Switchboard, which would otherwise pollute analytics with admin sessions).

| Script | ID | Method |
|---|---|---|
| GA4 | `G-X55X1YSD10` | gtag.js (direct) |
| Google Ads | `AW-16641031492` | gtag.js (direct) |
| GTM | `GTM-WV326JN8` | GTM script (direct) |
| Facebook Pixel | `489773923452243` | fbevents.js (direct) |
| Hotjar | `5144458` | Hotjar snippet (direct) |

## Business Info

- **Company:** TZ Electric, Inc. (Cooling | Heating | Electrical)
- **Phone:** (518) 678-1230
- **Email:** service@tzelectricinc.com
- **Address:** 5079 NY-32, Catskill, NY 12414
- **Service Area:** Hudson Valley, NY (Greene, Columbia, Ulster, Dutchess, Albany, Delaware counties)
- **Certifications:** Mitsubishi Diamond Elite Contractor, Generac Authorized Dealer, BBB Accredited
- **Awards:** Chronogrammies #1 Electrician Hudson Valley 2025 + 2026 (#2 in 2023), Nextdoor #1 Electrician two years running
- **Local Copy:** `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site`

## SEO & Infrastructure

- **Domain:** `tzelectricinc.com` (Cloudflare DNS to Vercel)
- **robots.txt:** `src/app/robots.ts`, allows all, blocks `/api/`, `/switchboard/`, `/test-signup`, `/thank-you`
- **sitemap.xml:** `src/app/sitemap.ts`, dynamic, 50+ URLs
- **Favicon:** `src/app/favicon.ico` + `src/app/icon.png` + `src/app/apple-icon.png`
- **OG Image:** `public/images/og-default.jpg` (1200x630, white logo on navy)
- **Google Search Console:** verified, sitemap submitted
- **JSON-LD:** LocalBusiness + BreadcrumbList + FAQ schemas
- **www redirect:** configured via Vercel
- **Blog:** hidden from nav until content migrated (code ready at `/blog`)

## Integrations

| Service | Status | Details |
|---|---|---|
| Stripe | Live | Payment processing for maintenance plan signups |
| Housecall Pro | Live | Customer find-or-create + estimate creation + Job Inbox lead. Same routing for the website form and every agent. |
| Resend | Live | Outbound email, account under `tzelectricoffice@gmail.com`, domain `tzelectricinc.com` verified (SPF + DKIM) |
| Trust Index | Live | Google reviews widget on homepage + reviews page |
| Neon Postgres (`tz-db`) | Live | Vercel Marketplace integration. `tz_leads` + `tz_agent_conversations` + `tz_agent_messages` + `tz_kb_overrides` + `tz_users`. Migrations in `migrations/`, run with `npm run migrate`. |
| Native lead form | Live | `/quote`, replaces the old Typeform popup. Posts to HCP `/leads` and `tz_leads`. GCLID + UTM capture, branded email via Resend. |
| Vercel AI Gateway | Live | Powers Web Chat Claire via OIDC auth (no API key on Vercel). Anthropic Sonnet 4.6 with ephemeral prompt caching. Per-visitor rate-limit ceilings configurable in dashboard. |
| Anthropic (via Gateway) | Live | Sonnet 4.6 behind Web Chat Claire. ~90% input cost reduction on cache hits. |
| Anthropic (direct, via Vapi) | Live | Claude Haiku 4.5 behind Voice Claire. Sub-second latency vs Sonnet, model fees billed by Vapi. |
| Vapi (voice agent platform) | Live | Inbound voice at `+15186786153`. Dynamic server-URL pattern — Vapi POSTs `assistant-request` to `/api/agents/voice/server` for the dynamic assistant config per call, plus `tool-calls`, `end-of-call-report`, `status-update`. BYON Twilio number, BYOK 11labs voice. |
| Twilio (voice + SMS) | Live (voice) / awaiting A2P 10DLC (SMS) | Tyler's own account (`tyler@tzelectricinc.com`). One number `+15186786153` doing double duty: voice via Vapi BYON, SMS via our webhook once A2P clears. |
| ElevenLabs (TTS) | Live (BYOK) | TZ's own 11labs subscription connected via Vapi credential. Custom-cloned voice "Eryn" plays as Claire on the phone. Speech eats Tyler's 11labs character quota; Vapi just orchestrates. |
| Deepgram (transcription) | Live (via Vapi) | nova-3 model, 100ms latency, phone-audio tuned. |
| NextAuth.js v5 (Google OAuth) | Live | TZ Switchboard sign-in. Domain-restricted to `tzelectricinc.com` + `creativequalitymarketing.com`. Per-user roles + module access overrides. |
| Typeform (job app) | Active | `ghfs29y37tj.typeform.com/to/hsBm2HUf`, to be replaced with native form (Phase later) |

## Career Pages

6 individual job listing pages at `/careers/[slug]` with SSG:
- Lead Electrician, HVAC Project Manager, HVAC Installer, Estimator, Apprentice, Office Assistant
- Each has overview, responsibilities, qualifications, benefits, schedule, JobPosting JSON-LD
- Apply buttons currently link to Typeform (will be replaced with native form)
- Data source: `src/lib/careers-data.ts`

## What's shipped

The persona for all customer-facing agents is **Claire** (warm / neighborly / professional, identifies as a "smart assistant" in the opener — never "AI assistant" in customer-facing copy; internal HCP tag stays as `TZ AI AGENT`). Source of truth for behavior: [`docs/agent-training-answers.md`](docs/agent-training-answers.md), with Tyler-authored overrides on top via the in-app editor at `/switchboard/knowledge-base`.

- ✓ **Native lead form** at `/quote`. Three-step (service → qualification → contact). Replaces every Typeform CTA. Renter detection + landlord-info branch. Branded Resend email. Multi-channel attribution (gclid, gbraid, wbraid, fbclid, msclkid, ttclid, li_fat_id, lsa_id + UTMs + referrer + first-touch / last-touch cookies). Conversion firing on `/thank-you` (GTM dataLayer + GA4 `generate_lead` + Meta Pixel `Lead`, value tiered by service).
- ✓ **HCP routing rewritten** as a triple-write per submission: find-or-create customer (matched by phone OR email OR full name), create unscheduled estimate with `work_status: needs scheduling` and lead details in option-internal notes, drop a Job Inbox card via `/leads` with top-level `customer_id`. Customer profile notes stay reserved for persistent customer info, never job specifics. All three records mirror back to `tz_leads` on Neon.
- ✓ **Lead Pipeline** at `/switchboard/lead-pipeline`. Reads from `tz_leads`. Two-way Won/Lost status sync (server polls HCP `option.approval_status`, throttled 5 min, manual Refresh bypasses). Channel chip + filter, paid/organic/referral/direct stat cards, deep-link to HCP estimate.
- ✓ **Knowledge Base** at `/switchboard/knowledge-base`. Owners + admins click Edit on any section to write a per-section override into `tz_kb_overrides` (Neon). Tyler-authored overrides always win on render and in agent prompts even if CQ later updates the base markdown. Every edit stamps `tz_kb_override_history` + `tz_audit_log`.
- ✓ **Switchboard auth.** Google OAuth via NextAuth.js v5, domain-restricted to `tzelectricinc.com` + `creativequalitymarketing.com`. Per-user roles (`owner` / `admin` / `office` / `viewer` / `disabled`). Owner-only `/switchboard/users` page with invite, role grant/revoke, disable, login_count + last sign-in tracking, **per-user module access overrides** ("Customize access" button gives a checkbox panel per user). Sidebar filters modules by access; each protected page calls `requireModuleAccess(slug)` and bounces denied visitors. Sidebar shows the signed-in user's avatar + name + role. Dashboard home greets by first name with time-aware salutation + sign-in count.
- ✓ **Account handoff to TZ team.** Vercel project + domain transferred to `tzelectricoffice@gmail.com` (Pro plan). Neon migrated from CQ Marketplace to TZ-DB Marketplace via `pg_dump 17` → `psql` restore. Old CQ Neon deleted. Stripe + HCP secrets converted to Vercel `sensitive` type. Every paid resource for tz-electric is on Tyler's billing.
- ✓ **Web Chat Claire (LIVE).** Full-page immersive chat at `/claire`. AI SDK v6 + Vercel AI Gateway with OIDC auth (model `anthropic/claude-sonnet-4.6`). Anthropic ephemeral prompt caching enabled (~90% input cost reduction on cache hits). Helpful-first qualification flow: answers questions using KB ranges, captures name + phone via `update_visitor_contact` within 2-3 turns, weaves in per-service qualification questions from KB section 6, offers free estimate, books via `create_lead_with_estimate` (same backend as the website form). Server-side guardrails: 2000-char per-message cap, 50 user-messages per-conversation cap, 1200 max output tokens, 8 max tool steps, AI Gateway per-user attribution via `sha256(visitorIP)`. Prompt-side guardrails: stay-in-role, refuse prompt injection, never reveal sensitive data, detect spam/solicitors/bots. UX: full-viewport iMessage-style layout, fixed composer above iOS keyboard, smart auto-scroll that respects scroll-up intent, light/dark labeled toggle, Start Over button, Claire portrait next to messages, contrasting bubbles. **Live at https://tzelectricinc.com/claire.**
- ✓ **TZ Switchboard Web Chat module (LIVE).** Office-side viewer at `/switchboard/web-chat`. Thread list with visitor name + phone, attribution channel, "Lead captured" badge, takeover state. Active thread shows transcript with collapsible tool-call rows, first-touch attribution strip, lead deep-link to Lead Pipeline. Takeover / release / close actions; office reply composer (saves to transcript, customer-side delivery is a small follow-up).
- ✓ **SMS Claire scaffolding.** Webhook signature verification, conversation persistence (`tz_agent_conversations` + `tz_agent_messages`), takeover UI at `/switchboard/sms-conversations`, system prompt assembler with channel-aware framing (sms / voice / web_chat), AI SDK v6 tool surface (`update_visitor_contact`, `find_existing_customer`, `create_lead_with_estimate`, `lookup_business_hours`, `flag_for_office_review`, `escalate_emergency`, `dispatch_after_hours_emergency`). Just needs the model call + Twilio creds to go live; mirror the web-chat route's shape for prompt caching, abuse guardrails, and gateway user attribution.
- ✓ **Voice Claire (LIVE — fully wired 2026-05-27).** Inbound voice at `+15186786153` on Tyler's Twilio account, routed through HCP Phone Pro's new "Claire Flow" (press menu Press 1-5 for Molly/Sam/Ty/Terry/Tyler during open hours with Claire fallback after ~25s; direct to Claire during closed hours). Vapi-managed assistant with Claude Haiku 4.5 model + 11labs Eryn voice + Deepgram nova-3 transcriber. Full KB + tool surface injected per call via dynamic server-URL pattern at `/api/agents/voice/server`. Transcript + recording playback in `/switchboard/call-logs`. **Tool-calling end-to-end works as of commit `e95fe2d`** — Vapi sends tool calls in OpenAI's nested function-tool format (`call.function.name` + JSON-stringified `call.function.arguments`); `extractVapiCall()` in `src/lib/vapi-tools.ts` unwraps both shapes safely. Voice channel framing in `agent-prompt.ts` enforces: natural number reading (BTUs/dollars/ranges spoken as words; digit-by-digit only for phone numbers + emails), **brevity** (match reply length to question size, 15-sec speech ceiling, no reciting hours/office number unprompted, no summarizing what the caller just said), **voicemail intent** (caller asks to leave a message → Claire invites + stays silent for the Vapi recording + fires `flag_for_office_review` so office gets email + can play back audio), **voicemail hang-up cue** ("Once you're finished, you can hang up and the office will get back to you"), **one-piece-at-a-time intake** (never bundle "name and phone"), **name confirmation** (always repeat the name back; ask to spell only on ambiguous/multi-syllable/foreign-origin names), and **no fake transfers** (no warm-transfer wired, so Claire takes the message + `flag_for_office_review` instead of promising "please hold while I transfer you"). ~$0.12/min steady state.
- ✓ **After-hours emergency dispatch cascade (LIVE 2026-05-18, safety-net hotfix 2026-05-27).** Implements Tyler's `TZ_Electric_After_Hours_SOP.md` end-to-end. New `dispatch_after_hours_emergency` Claire tool, real Twilio SMS + voice outbound (no SDK dep). Two windows: Standard after-hours (4 PM – 10 PM, 5 AM – 7:30 AM) fires T+0 / T+15 / T+30+supervisor / T+60 / T+65 customer-callback cascade; Overnight (10 PM – 5 AM) sends one text each to tech + supervisor with no follow-ups. Privacy rule: never reads tech's number to customer. On-call rotation in `tz_on_call_schedule` (seeded from KB calendar section 3). Cron worker at `/api/cron/dispatch-escalation` every 5 minutes. **Safety-net auto-redirect (commit `035830d`):** Claire's mission prompt now mandates `lookup_business_hours` as the first action on any emergency, then branches to `escalate_emergency` (business hours, email only) vs `dispatch_after_hours_emergency` (after-hours, full Twilio cascade). If Claire still picks `escalate_emergency` by mistake after-hours, the tool detects the window via `classifyWindow()` and automatically also triggers `dispatchAfterHoursEmergencyImpl` with mapped args (`customer_acknowledged_fees: true` forced — life-safety overrides the fee gate). Both fire belt-and-suspenders.
- ✓ **Pre-launch Claire voice + content fixes (2026-05-18 + 2026-05-27).** Round 1 (May 18): natural number reading rule, mini-split single-zone install range ($5,500-$9,000), small-repair fee disclosure rule, same-day priority dispatch ($275) branch, business hours canonicalized to 7:30 AM – 4:00 PM, hiring inquiry redirect to `/careers`, "accept I don't know" rule, overhead/underground form simplified. Round 2 (May 27): brevity rule, voicemail intent handler, voicemail hang-up cue, one-piece intake rule, name confirmation with conditional spelling, no-fake-transfers policy, emergency routing time-of-day branch in mission section.
- ✓ **After-hours dispatch visibility + real delivery tracking (LIVE 2026-05-29, commit `2eb45d1`).** Dispatch attempts used to record "sent" (Twilio-accepted) even when the carrier later rejected them (e.g. SMS 30034) — and there was no view into any of it. Now `sendSms`/`placeCall` pass a Twilio `StatusCallback` (send behavior unchanged) and a new `/api/webhooks/twilio-delivery` route (X-Twilio-Signature validated) writes the real final status + `error_code` back to `tz_dispatch_attempts` (migration 015). New owner/admin-gated **`/switchboard/after-hours`** page shows each `tz_emergency_dispatches` emergency with its full T+0/T+15/T+30/T+60 attempt ladder and per-attempt delivery status (green delivered / red failed + code). Surfaces the SMS carrier rejections that were previously invisible; flips to delivered once A2P clears.
- ✓ **Voice Claire message/voicemail reliability fix (2026-05-29, commit `3020a34`).** After Tyler flagged a call where Claire promised to pass a message to a named staffer + invited a voicemail but fired **zero tools** (office notified of nothing) and invented "everyone's busy," `agent-prompt.ts` gained a NON-NEGOTIABLE rule block: any "I'll pass the message / leave a voicemail" MUST fire `notify_team_member` or `flag_for_office_review` in the same turn; never invent staff availability; use the inbound caller-ID number if the caller won't give one; a named person + message routes via `notify_team_member` even for suspected solicitors. The 3-turn hard cap now applies to any person/message/voicemail/transfer request (was keyed only on the word "agent").
- ✓ **End-of-day follow-up recap (LIVE 2026-05-29, commit `3cceb5f`).** Claire's flag emails get lost when field staff are out, so a new cron `/api/cron/end-of-day-flags` (fires 6 PM Eastern year-round, DST-proof) sends a daily wrap. **Per-person:** each employee Claire flagged a callback to (`notify_team_member`) gets their own email with only their items — name→email resolved via the staff-directory matcher + active users (handles Ty vs Tyler). **Master recap:** one email of every flagged item to `service@tzelectricinc.com` (override via `EOD_RECAP_TO`), grouped person → general office → emergencies. Each item deep-links to its exact call/chat card via `?id=`. Read-only + additive (no migration, no change to Claire or existing flag emails); skip-if-empty; `CRON_SECRET`-gated; `?dryRun=1` for safe testing. `src/lib/eod-recap.ts`.
- ✓ **HCP customer name recognition (LIVE 2026-05-29, commit `8824b86`).** New `tz_hcp_customers` table (migration 014) mirrors Housecall Pro's customer list. Nightly cron `/api/cron/hcp-customer-sync` (3 AM ET, after the analyzer) paginates HCP `GET /customers` and batch-upserts ~3.6k customers via `sql.transaction` per page. **Read-only on HCP (GET only) — a one-way copy into Neon; no HCP record or setting is ever written.** The voice route looks up the inbound caller by normalized 10-digit phone (`lookupHcpCustomerByPhone` in `src/lib/hcp-customers.ts`) and attaches `customer_name` + `hcp_customer_id` to the conversation row, so returning callers show by name in `/switchboard/call-logs` instead of a bare number. **Silent by design** — the matched name is NOT fed into the system prompt, so Claire does not greet by name (avoids creepiness + wrong-name-on-shared-line). Phase 2 (deferred, routes through Cesar): let Claire use known details to skip re-collecting info; same lookup on the web/SMS entry points. Note: `CRON_SECRET` is now set on Vercel Production (session 26) — all cron endpoints reject anonymous hits with 401; Vercel Cron sends the Bearer automatically.

## What's next (in build order)

Voice Claire is now fully live end-to-end as of session 22 (2026-05-27) — HCP Phone Pro routing flipped, Vapi tool-call parser bug fixed (every tool call since launch had been failing silently), brevity/voicemail/intake/transfer prompt rules added, after-hours emergency routing safety net deployed. Next priorities:

1. **Verify session-22 hotfixes on Tyler's next test call.** Three things to confirm once the deploy lands: (a) `dispatch_after_hours_emergency` actually fires after-hours and pages Jimmy Neville (this week's on-call) — verify via `tz_emergency_dispatches` row and `/switchboard/call-logs` tool-call rows; (b) Claire's replies are noticeably shorter (brevity rule), not reciting hours/office number unprompted; (c) voicemail intent works end-to-end (caller says "leave a message" → Claire invites + stays silent + `flag_for_office_review` afterward).
2. **Manual office callback to 6 stranded callers** from the parser-bug window (12:59 PM – 1:30 PM ET on 2026-05-27). Names + phones in HANDOFF.md session 22 deliverables; full transcripts in `/switchboard/call-logs`.
3. **Switchboard team rollout.** `/switchboard/users` is verified working in production (Tyler personally used it on 2026-05-17 + 2026-05-27). Waiting on Cesar to send the list of remaining team members (names + `@tzelectricinc.com` emails + roles). Most office staff → `office`; supervisors → `admin`. Domain restriction: `@tzelectricinc.com` + `@creativequalitymarketing.com` only.
4. **Terry's role promotion** (office → owner) — quick DB or UI update. He's in OWNER_EMAILS but his row stayed at "office" from when he was first invited.
5. **Mike + Ty Stein invite nudge** — they have pending invites from 2026-05-17 and haven't signed in at `/switchboard/login` yet.
6. **Cesar Vercel team migration.** Cesar's CLI is still on the pre-handoff `cq-marketings-projects` team (empty shell). Tyler needs to invite `cqdesignsny@gmail.com` to TZ Electric's Vercel team so `vercel link` + `vercel env pull` work locally. Workaround until then: SSD copy's `.env.local`.
7. **AI Gateway credit hardening** (session 21 outage follow-up). Friendlier failure UI on web chat when gateway 402s, hourly health-monitor cron, enable AI Gateway low-credit email alert in dashboard.
8. **In-app Claire (the major arc).** Refactor `agent-prompt.ts` from per-channel branching to layered `buildPrompt({ surface, role, user, context })`. Build tool registry abstraction with role-gating + destructive-action confirmation. Ship right-side slide-out chat panel in the TZ Switchboard. Wire admin chat surface first (`update_kb_section`, `set_on_call_today` are the two starter tools — Tyler is the bottleneck). Office chat surface second. Tech SMS third. Training mode fourth. Multimodal fifth. QC auditor sixth. MCP wrapper seventh. See HANDOFF.md "Claire as TZ AI (architecture direction)" for the full plan.
9. **SMS Claire model wire-up + flip `TWILIO_SMS_ENABLED`.** All outbound SMS (after-hours dispatch texts, `notify_team_member` paging) and inbound SMS Claire are blocked until the A2P 10DLC **campaign** clears carrier review. Status as of 2026-05-29: the campaign failed its first review (errors 30896 opt-in / 30882 terms URL), was **resubmitted via the Twilio API** with corrected message-flow + `/terms-condition` URL, and is now `IN_PROGRESS`. The moment it shows `REGISTERED`/`APPROVED`: (a) set `TWILIO_SMS_ENABLED=true` on Vercel — `sendSms` reads it at runtime, re-enabling dispatch + paging with no code change; (b) replace the TODO block in `src/app/api/agents/sms/webhook/route.ts` with a `generateText({...})` call (~30 min). Re-check status with the curl in HANDOFF.md.
10. **Tech response acknowledgment + Vapi `<Dial>` bridge.** Post-launch polish on the after-hours cascade once it sees real traffic. Inbound SMS "ON IT" reply stops escalation; `<Dial>` bridge for privacy-preserving direct tech-customer call.
11. **Blogs back on the site.** Code is ready, nav was hidden during the agent push.
12. **Phase R2 HCP Won/Lost integration.** Close rate by channel, average time-to-won, won lead value. Needs `total_amount` sync from HCP estimates.
13. **Phase R3 ad-cost integration.** Google Ads + Meta Marketing API → CPL, CPA, ROAS by campaign. Daily cron pulls cost into `tz_ad_spend`.
14. **Phase 7 self-improving learning loop.** Office flags transcripts in the agent conversation views; flagged items become proposed KB overrides; owners approve and they merge into `tz_kb_overrides` via the existing override mechanism. Reports module gains agent KPIs: handoff rate, false-escalation count, sentiment proxy, top failure modes.

### Two dashboard toggles to enable for production rate-limiting (no code change, just clicks)

1. **Vercel team → AI Gateway → Rate Limits.** Suggested 20 RPM / 50K tokens-per-day / 3 concurrent per visitor. The web-chat route already passes `user` (sha256 of visitor IP) and `tags` so per-visitor ceilings work the moment a value is set.
2. **Vercel team → AI Gateway → Budget Alerts.** Suggested $100 alert / $500 hard cap so a real attack triggers a warning + degradation instead of a surprise bill.

### Backlog
- [ ] Blog content migration from old Webflow site
- [ ] Sanity.io CMS setup
- [ ] Google Maps embeds (placeholders in contact & service-areas)
- [ ] Interactive gallery filtering (client component)
- [ ] Performance optimization & Lighthouse testing
- [ ] Bing Webmaster Tools setup
- [ ] Google Search Console verification meta tag

## Sync Architecture

This codebase exists in three places (GitHub, SSD, Dropbox). Auto-sync post-commit hooks keep all three in sync. See [HANDOFF.md](HANDOFF.md) for the full sync workflow and operational notes.
