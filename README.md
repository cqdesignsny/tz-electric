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
- **Agent Training** (`/switchboard/agent-training`), multi-step discovery questionnaire (~70 questions across 9 sections) that feeds the AI agent knowledge base. Auto-saves to localStorage. Submit posts to `/api/agent-training/submit`, which sends a branded HTML email to the recipient configured in `AGENT_TRAINING_TO_EMAIL` (default `cesar@creativequalitymarketing.com`).

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
- **Certifications:** Mitsubishi Diamond Elite Contractor, Generac Authorized Dealer, BBB Accredited, Voted Best Electrician Hudson Valley
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
| Housecall Pro | Live | Customer creation and tagging on plan signup via API |
| Resend | Live | Outbound email, account under `tzelectricoffice@gmail.com`, domain `tzelectricinc.com` verified (SPF + DKIM) |
| Trust Index | Live | Google reviews widget on homepage + reviews page |
| Typeform (lead form) | Active | `ghfs29y37tj.typeform.com/to/HDLXmnob`, to be replaced with native form |
| Typeform (job app) | Active | `ghfs29y37tj.typeform.com/to/hsBm2HUf`, to be replaced with native form |

## Career Pages

6 individual job listing pages at `/careers/[slug]` with SSG:
- Lead Electrician, HVAC Project Manager, HVAC Installer, Estimator, Apprentice, Office Assistant
- Each has overview, responsibilities, qualifications, benefits, schedule, JobPosting JSON-LD
- Apply buttons currently link to Typeform (will be replaced with native form)
- Data source: `src/lib/careers-data.ts`

## Remaining Work

### Priority
- [ ] **Native forms to replace Typeform.** Multi-step lead capture + job application forms directly on the site. Wire to Housecall Pro CRM for instant lead delivery. Include GCLID tracking (Google Click ID) for Smart Bidding optimization. Eliminates Typeform subscription and improves ad conversion tracking. Reuses `renderEmailLayout()` for the lead notification.

### AI Agent Buildout (per agent training answers)
- [ ] Knowledge Base module (live editor, version history, search)
- [ ] SMS agent (Twilio + Anthropic Claude, threaded conversations, takeover button)
- [ ] Web chat agent (replaces Podium, integrated with knowledge base)
- [ ] Voice agent (Vapi + Twilio, books jobs, handles emergencies)
- [ ] Lead Pipeline (live view of all captured leads)
- [ ] Reports (calls, leads, conversions, revenue per channel)
- [ ] Email Assistant for Tyler's inbox
- [ ] Office Operations agent
- [ ] Warehouse & Inventory agent
- [ ] Sales & Outbound agent
- [ ] Trainual integration for human staff training

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
