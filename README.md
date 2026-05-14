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
│   │   └── (dashboard)/           # Auth-gated dashboard with sidebar
│   │       ├── layout.tsx         # Theme init script + DashboardShell
│   │       ├── page.tsx           # Dashboard home (Things to do + module cards)
│   │       ├── agent-training/    # Agent training questionnaire
│   │       │   ├── page.tsx
│   │       │   ├── QuestionnaireForm.tsx
│   │       │   └── questions.ts
│   │       └── <11 info pages>/   # lead-pipeline, reports, employee-training,
│   │                              # knowledge-base, call-logs, sms-conversations,
│   │                              # web-chat, email-assistant, office-operations,
│   │                              # warehouse-inventory, sales-outbound
│   └── api/
│       ├── agent-training/submit/ # Branded HTML email via Resend
│       ├── agents/
│       │   ├── web-chat/
│       │   │   ├── stream/        # POST: streaming chat endpoint (AI Gateway, prompt cached, abuse-guarded)
│       │   │   └── conversations/ # POST: takeover / release / close / office_reply
│       │   └── sms/
│       │       ├── webhook/       # Twilio inbound (scaffolded, awaiting model wire-up)
│       │       └── conversations/ # Office actions on SMS threads
│       ├── leads/submit/          # Form + agent shared lead-routing pipeline (HCP customer + estimate + Job Inbox + tz_leads)
│       └── switchboard/auth/      # /login + /logout cookie session
├── components/
│   ├── ui/                        # Button, Badge, Card, SectionHeader, StarRating, TrustIndexWidget
│   ├── layout/                    # Header (sticky, dropdowns), Footer (4-col + Admin link, slim CTA)
│   ├── analytics/                 # PublicAnalytics (GTM + GA4 + Google Ads + Meta Pixel + Hotjar) — used by (public)/ and claire/
│   ├── chat/                      # ClaireChat, ChatThemeProvider, ChatThemeToggle (used on /claire)
│   ├── switchboard/               # DashboardShell, Sidebar, TopBar, ThemeProvider, ThemeToggle,
│   │                              # ModuleInfoPage, nav-config, SmsConversationsClient,
│   │                              # WebChatConversationsClient, LeadPipelineClient, RecentLeadsCard,
│   │                              # KnowledgeBaseNav
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
    │                              # escalate_emergency. Shared by web chat, voice, SMS.
    ├── agent-conversations.ts     # tz_agent_conversations + tz_agent_messages helpers (find/start, append, takeover, etc.)
    ├── agent-knowledge-base.ts    # Loads + merges base KB (markdown) with tz_kb_overrides (Tyler-edited)
    ├── leads-store.ts             # tz_leads insert + HCP linkage helpers
    ├── attribution.ts             # deriveChannel(), leadValueCents(), attribution snapshot helpers
    ├── lead-tracking.ts           # Client-side first/last-touch tracking (gclid, utm_*, referrer)
    ├── db.ts                      # Neon HTTP client (singleton)
    ├── housecall-pro.ts           # HCP API client + empirical findings docs
    ├── twilio-signature.ts        # Twilio webhook signature verification
    ├── email-templates.ts         # Branded HTML email layout + per-email functions
    └── utils.ts                   # cn(), formatPhone()
```

## TZ Switchboard (Internal Control Center)

The TZ Switchboard at `/switchboard` is the operational backend for TZ Electric. Auth-gated via single-password admin login. HMAC-signed cookie session, 30-day TTL. Public footer has a discreet "Admin" link in the bottom bar.

**Live modules:**
- **Agent Training** (`/switchboard/agent-training`), multi-step discovery questionnaire (~70 questions across 9 sections) that feeds the AI agent knowledge base. Auto-saves to localStorage. Submit posts to `/api/agent-training/submit`, which sends a branded HTML email. **Tyler submitted on 2026-04-26.** His answers (plus follow-up gap answers) live at [`docs/agent-training-answers.md`](docs/agent-training-answers.md), the canonical knowledge base the SMS, voice, and web chat agents load as their system prompt context.
- **Knowledge Base** (`/switchboard/knowledge-base`), structured browseable view of the agent training answers doc with sticky section nav, scroll-spy, and full markdown styling. Owners + admins see Edit / Revert per section. Tyler-authored overrides land in `tz_kb_overrides` (Neon) and **always win on render and in agent prompts**, even if CQ later updates the base markdown. `tz_kb_override_history` keeps every revision; `tz_audit_log` stamps every edit.
- **Lead Pipeline** (`/switchboard/lead-pipeline`), reads from `tz_leads` (Neon). Filters (search, service, channel, status). Two-way HCP Won/Lost sync. Channel chip + paid/organic/referral/direct stat cards. Deep-link to HCP estimate.
- **Web Chat** (`/switchboard/web-chat`) **— LIVE 2026-05-01.** Office-side viewer for `/claire` conversations. Thread list with visitor name + phone + attribution channel + "Lead captured" badge. Active thread shows full transcript including collapsible tool-call rows, first-touch attribution strip with lead deep-link, takeover/release/close, office reply composer. Channel-agnostic actions API at `/api/agents/web-chat/conversations`.
- **Call Logs** (`/switchboard/call-logs`) **— LIVE 2026-05-13.** Read-only viewer for Voice Claire (`+15186786153`) inbound calls. Two-pane layout, status filter pills, inline audio playback of the Vapi recording, two-sided transcript (customer + Claire) with collapsible tool-call rows, Vapi call-id debug pill, deep link to any lead Claire booked.
- **SMS Conversations** (`/switchboard/sms-conversations`), live SMS thread viewer with takeover. Same shape as Web Chat. Twilio number + webhooks wired; awaits A2P 10DLC carrier review (1-2 weeks) before real-customer SMS delivers reliably.
- **Reports** (`/switchboard/reports`) **— LIVE 2026-05-08.** Lead volume by day stacked by channel, channel breakdown with pipeline value, service mix, Claire conversation health, "Conversations to review" with reason badges. CSV export. Daily digest email at 8 AM ET to ownership via Vercel Cron + Resend.
- **Users** (`/switchboard/users`), owner-only. Invite, role grant / revoke, disable, login_count + last sign-in tracking, per-user module access overrides.

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
- ✓ **SMS Claire scaffolding.** Webhook signature verification, conversation persistence (`tz_agent_conversations` + `tz_agent_messages`), takeover UI at `/switchboard/sms-conversations`, system prompt assembler with channel-aware framing (sms / voice / web_chat), AI SDK v6 tool surface (`update_visitor_contact`, `find_existing_customer`, `create_lead_with_estimate`, `lookup_business_hours`, `flag_for_office_review`, `escalate_emergency`). Just needs the model call + Twilio creds to go live; mirror the web-chat route's shape for prompt caching, abuse guardrails, and gateway user attribution.

## What's next (in build order)

Web chat shipped 2026-05-01, voice shipped 2026-05-13, SMS waits on A2P 10DLC carrier review (1-2 weeks). After all three: Phase R2 HCP Won/Lost integration, Phase R3 ad-cost integration, then Phase 7 self-improving learning loop.

1. ~~**Web chat Claire.**~~ **DONE 2026-05-01.** Live at `/claire`.
2. ~~**Voice Claire (Vapi).**~~ **DONE 2026-05-13.** Live at `+15186786153`. Vapi-managed assistant on Tyler's Twilio number; Claude Haiku 4.5 + 11labs Eryn (BYOK); full TZ knowledge base + 6-tool surface injected per call via dynamic server-URL pattern; transcript + recording at `/switchboard/call-logs`. ~$0.12/min.
3. **SMS Claire.** Replace the TODO block in `src/app/api/agents/sms/webhook/route.ts` with a `generateText({...})` call, mirroring the web-chat route's wiring (gateway() wrapper, prompt caching, system prompt as `SystemModelMessage` with Anthropic ephemeral cache, `MAX_OUTPUT_TOKENS` cap, gateway user/tags). Twilio number, creds, and Messaging URL all wired already; only A2P 10DLC carrier review remains. ~30 min of code once A2P clears.
4. **Phase R1 reports** at `/switchboard/reports`. **DONE 2026-05-08.** Charts off `tz_leads`: lead volume over time stacked by channel, channel breakdown pie, service mix, conversation health, "conversations to review" queue. CSV export. Daily 8 AM digest email.
5. **Phase R2 HCP Won/Lost integration.** Close rate by channel, average time-to-won, won lead value. Needs total_amount sync from HCP estimates.
6. **Phase R3 ad-cost integration.** Google Ads + Meta Marketing API → CPL, CPA, ROAS by campaign. Daily cron pulls cost into `tz_ad_spend`.
7. **Phase 7 self-improving learning loop.** Office flags transcripts in the agent conversation views; flagged items become proposed KB overrides; owners approve and they merge into `tz_kb_overrides` via the existing override mechanism. Reports module gains agent KPIs: handoff rate, false-escalation count, sentiment proxy, top failure modes.

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
