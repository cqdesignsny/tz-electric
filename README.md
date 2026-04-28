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
│   ├── (public)/                  # Public site route group
│   │   ├── layout.tsx             # Public chrome + analytics + LocalBusiness JSON-LD
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
│       └── switchboard/auth/      # /login + /logout cookie session
├── components/
│   ├── ui/                        # Button, Badge, Card, SectionHeader, StarRating, TrustIndexWidget
│   ├── layout/                    # Header (sticky, dropdowns), Footer (4-col + Admin link)
│   ├── switchboard/               # DashboardShell, Sidebar, TopBar, ThemeProvider,
│   │                              # ThemeToggle, ModuleInfoPage, nav-config
│   ├── sections/                  # HeroSection, TrustBar, ServicesGrid, WhyChooseUs,
│   │                              # ReviewsSection, ServiceAreaSection, CTASection,
│   │                              # ServicePageTemplate, CertificationSlider
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
    ├── switchboard-auth.ts        # HMAC session token for /switchboard/*
    ├── email-templates.ts         # Branded HTML email layout + per-email functions
    └── utils.ts                   # cn(), formatPhone()
```

## TZ Switchboard (Internal Control Center)

The TZ Switchboard at `/switchboard` is the operational backend for TZ Electric. Auth-gated via single-password admin login. HMAC-signed cookie session, 30-day TTL. Public footer has a discreet "Admin" link in the bottom bar.

**Live modules:**
- **Agent Training** (`/switchboard/agent-training`), multi-step discovery questionnaire (~70 questions across 9 sections) that feeds the AI agent knowledge base. Auto-saves to localStorage. Submit posts to `/api/agent-training/submit`, which sends a branded HTML email to the recipient configured in `AGENT_TRAINING_TO_EMAIL` (default `cesar@creativequalitymarketing.com`). **Tyler submitted on 2026-04-26.** His answers (plus follow-up gap answers) live at [`docs/agent-training-answers.md`](docs/agent-training-answers.md), which is the canonical knowledge base the SMS, voice, and web chat agents will load as their system prompt context.

**Coming Soon and Planned modules:** every sidebar item is clickable and opens a dedicated info page describing what we'll build there. All 11 share a single `ModuleInfoPage` template that reads from `nav-config.ts`:
- Lead Pipeline, Reports, Employee Training (Trainual)
- Knowledge Base, Call Logs, SMS Conversations, Web Chat
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

All outbound email goes through Resend on a verified `tzelectricinc.com` domain. Templates live in `src/lib/email-templates.ts`:

- `renderEmailLayout()`, the shared branded shell. Top gradient strip, TZ logo on white header, eyebrow, heading, intro, optional stats row, body block, optional CTA pill button, branded footer. Inline-styled, table-based for cross-client compatibility (Apple Mail, Gmail, Outlook, Yahoo). Mobile-responsive with a small media query block.
- `renderQuestionnaireSubmissionEmail()`, the questionnaire submission email. Stats row (filled by, completed, percentage), full markdown answers in a navy code block, CTA to open the TZ Switchboard.

Future email types (lead form notifications, booking confirms, agent replies) reuse `renderEmailLayout()` to stay on-brand.

## Pages

The public site has 50+ static and dynamic routes including the homepage, 7 service pages, sub-service pages, the Mitsubishi landing, signature plans, maintenance plans, about, contact, reviews, financing, gallery, promotions, careers (with 6 individual job pages), 7 city pages, 5 county pages, 5 legal pages, and the hidden /thank-you page.

The TZ Switchboard adds 13 more (login, dashboard home, agent training, plus 11 module info pages).

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
| Housecall Pro | Live | Customer creation, lead capture (`/leads`), and tagging via API |
| Resend | Live | Outbound email, account under `tzelectricoffice@gmail.com`, domain `tzelectricinc.com` verified (SPF + DKIM) |
| Trust Index | Live | Google reviews widget on homepage + reviews page |
| Neon Postgres (`tz-db`) | Live | Vercel Marketplace integration. `tz_leads` write-through on every form submission. Migrations in `migrations/`, run with `npm run migrate`. |
| Native lead form | Live | `/quote`, replaces the old Typeform popup. Posts to HCP `/leads` and `tz_leads`. GCLID + UTM capture, branded email via Resend. |
| Typeform (job app) | Active | `ghfs29y37tj.typeform.com/to/hsBm2HUf`, to be replaced with native form (Phase later) |

## Career Pages

6 individual job listing pages at `/careers/[slug]` with SSG:
- Lead Electrician, HVAC Project Manager, HVAC Installer, Estimator, Apprentice, Office Assistant
- Each has overview, responsibilities, qualifications, benefits, schedule, JobPosting JSON-LD
- Apply buttons currently link to Typeform (will be replaced with native form)
- Data source: `src/lib/careers-data.ts`

## Remaining Work

### Priority
- [ ] **Native forms to replace Typeform.** Multi-step lead capture + job application forms directly on the site. Wire to Housecall Pro CRM for instant lead delivery. Include GCLID tracking (Google Click ID) for Smart Bidding optimization. Eliminates Typeform subscription and improves ad conversion tracking. Reuses `renderEmailLayout()` for the lead notification.

### AI Agent Buildout Roadmap

The voice persona for all customer-facing agents is **Claire** (female voice, warm/neighborly, identifies as AI in the opener). Source of truth for behavior: [`docs/agent-training-answers.md`](docs/agent-training-answers.md). Operational gaps Tyler couldn't fill have v1 best-practice defaults in section 10 of that doc.

The buildout runs in seven phases. Each phase is small enough to ship in 1–2 sessions, and each builds on the prior.

**Phase 1: Native Lead Form (active)**
- `/quote` page replaces the Typeform popup. Multi-step: service type → quick qualification → contact + address.
- Posts to HCP `POST /leads`, lands in Job Inbox > "API Leads" channel.
- Captures GCLID (30-day cookie) and UTM source/medium/campaign for Google Ads Smart Bidding attribution.
- Sends a branded HTML email via Resend (reuses `renderEmailLayout()`).
- Replaces every `TYPEFORM_URL` CTA site-wide. Header, hero, service pages, area pages, financing, contact, footer, FloatingCTA.
- Renter detection branch: soft-blocks the auto-book, collects landlord info, tags the lead, routes to office.

**Phase 2: Lead Pipeline (live) + Knowledge Base v1 (live)**
- **Lead Pipeline (`/switchboard/lead-pipeline`):** live data view reading `GET /leads` from HCP. Filters (search, service, status), pagination at 15 per page, expand-on-click detail with parsed qualification answers, customer notes, property, and attribution. Recent leads card on the dashboard home. HCP-side deletions auto-reflect because the page is `force-dynamic`.
- **Knowledge Base v1 (`/switchboard/knowledge-base`):** server-rendered view of `docs/agent-training-answers.md` with sticky section nav, scroll-spy active state, and full markdown styling. Read-only.
- **Neon Postgres (`tz-db`) provisioned and wired.** Marketplace integration on the Vercel project. Initial schema (`tz_leads`) applied via `migrations/001_init.sql` and the `npm run migrate` runner. Form submissions write-through to both HCP and `tz_leads` going forward. The TZ Switchboard still reads leads from HCP for now; Phase 4 onward, reads switch to Neon with HCP as a downstream sync target.

**Phase 3: Knowledge Base v2 (edit-in-place)**
- Authenticated WYSIWYG editor over each section.
- Save commits the change directly to `docs/agent-training-answers.md` via the GitHub API and triggers a Vercel redeploy.
- Version history view = `git log` on that file. Diff view between any two versions.
- Edits flow through the same git history as code, so the agents always load whatever's in the deployed file.

**Phase 4: SMS Agent (Claire)**
- Twilio inbound webhook → Vercel function → Anthropic API streaming reply.
- System prompt assembled at request time from `docs/agent-training-answers.md`.
- Conversation history persisted in Vercel storage (Postgres or KV from the Marketplace).
- Takeover button in `/switchboard/sms-conversations`: any office staff can pause Claire mid-thread and respond as themselves; Claire resumes when they release the thread.
- Tools: `lookupCustomer`, `createLead`, `bookField Assessment`, `escalateEmergency` (calls the dispatch SOP), `transferToHuman`.
- 24/7 coverage. Confirmation text after key actions per Tyler's wording.

**Phase 5: Web Chat Agent (Claire)**
- Persistent chat widget on all public pages. Proactive popup after ~15 seconds (Tyler's spec).
- Same system prompt as SMS, same tool surface, same conversation store, same takeover UX.
- Built on the AI SDK for streaming.
- Replaces the gap left by the Podium webchat removal.

**Phase 6: Voice Agent (Claire)**
- Vapi assistant with the Claire voice profile, configured against `/api/vapi/*` tool endpoints (same tools as SMS / chat).
- 15-minute max call duration before forced handoff per Tyler's spec.
- Inbound on a dedicated Twilio number.
- Strictly follows the after-hours emergency dispatch SOP (15-minute retry loop, escalation to Ty Stein → Tyler Zitz, 7 AM / 7:30 AM morning follow-ups). The dispatch logic is durable workflow material so it survives function restarts.

**Phase 7: Self-Improving Learning Loop**
- Every conversation transcript logged to durable storage with metadata (channel, duration, outcome, handoff y/n, tools called).
- Office staff flag transcripts in `/switchboard/sms-conversations` and the analogous voice / chat views: "Claire got this wrong" or "this answer should be in the KB."
- Flagged items queue in `/switchboard/knowledge-base` as suggested edits with the relevant section pre-selected.
- Cesar / Tyler approve or reject. Approved edits flow through the Phase 3 editor → commit → redeploy.
- `/switchboard/reports` shows per-agent KPIs: handoff rate, false-escalation count, customer satisfaction proxy (sentiment + booking conversion), top failure modes.
- This is the full audit-and-improve loop. Architecture decisions in Phases 4-6 set us up for it (transcript capture, tool-call logging, conversation IDs).

### Module status (per `nav-config.ts`)
- Lead Pipeline (live view of all captured leads from Phase 1 onward)
- Reports (calls, leads, conversions, revenue per channel; populated as agents go live)
- Email Assistant for Tyler's inbox (later phase, not in the seven above)
- Office Operations agent (later phase)
- Warehouse & Inventory agent (later phase)
- Sales & Outbound agent (later phase)
- Trainual integration for human staff training (deep-link only, depends on Tyler setting up Trainual)

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
