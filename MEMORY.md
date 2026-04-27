# TZ Electric Inc - Website Redesign Project Memory

## Project Summary
Redesigning tzelectricinc.com from Webflow to Next.js 15. Live production site - build in parallel, switch when ready.

## Key Business Info
- **Company:** TZ Electric, Inc. (Plumbing | Heating | Cooling)
- **Phone:** (518) 678-1230 | **Email:** service@tzelectricinc.com
- **Address:** 5079 NY-32, Catskill, NY 12414
- **Service Area:** Hudson Valley NY - Dutchess, Ulster, Albany, Columbia, Greene, Delaware counties (Delaware confirmed by Tyler 2026-04-26; service-areas page still needs updating)
- **Certifications:** Mitsubishi Diamond Elite, Generac Authorized Dealer, BBB Accredited
- **Awards:** Chronogrammies #1 Electrician Hudson Valley 2025 + 2026 (#2 in 2023), Nextdoor #1 Electrician two years running
- **Reviews:** 330+ Google 5-star reviews

## Webflow Site Details
- **Site ID:** 67ac70b9e25b6a62ed436918
- **Domains:** tzelectricinc.com, www.tzelectricinc.com
- **Pages:** 43 total (core, service, career, legal, CMS templates)
- **CMS Collections:** 9 (Services, Blog Posts, Locations, Electricals, Generators, Mini Splits, HVACs, Reference Locations, Hot Water Heaters)
- **Components:** 25 (Header, Navbar, Footer, various section types, spacing utilities)

## Analytics & Tracking IDs (ALL DIRECT IN layout.tsx)
- GA4: G-X55X1YSD10 (gtag.js direct)
- Google Ads: AW-16641031492 (gtag.js direct)
- GTM: GTM-WV326JN8 (direct — corrected from old GTM-MGWW87JT on 2026-04-12)
- Facebook Pixel: 489773923452243 (fbevents.js direct)
- Hotjar: 5144458 (direct snippet)

## Current Integrations
- Typeform for lead capture (ghfs29y37tj.typeform.com/to/HDLXmnob)
- Trust Index for Google reviews widget
- Wisetack & Synchrony financing
- Stripe for maintenance plan subscriptions
- HousecallPro for customer tagging

## Design Specs
- Fonts: Montserrat (headings), Manrope (body)
- Colors: Navy/Dark Blue primary, White backgrounds, Blue CTAs
- Full-width section layout, card-based services

## Active Tech Stack (In Progress)
- Next.js 16.1.6 + React 19.2.4 + TypeScript 5.9.3
- Tailwind CSS 4.2.1 (using @theme directive, NOT tailwind.config)
- Framer Motion 12.35.2
- Node.js v24.11.0 / npm 11.6.1
- Turbopack (default bundler)
- Sanity.io CMS (planned, not yet set up)
- Vercel deployment (planned)

## Planned Integrations
- Housecall Pro API (scheduling)
- Native form handling (replace Typeform)
- Sanity.io CMS (blog, dynamic content)

## Removed Integrations
- Podium webchat widget (removed 2026-04-12 — no longer in use)

## SEO Critical Notes
- All 43 pages have custom SEO titles/descriptions - MUST preserve
- All URLs must be maintained or 301 redirected
- LocalBusiness + BreadcrumbList JSON-LD schemas in place
- NAP consistency critical for local SEO

## Critical SEO Gaps Found
- NO plumbing page (despite "Plumbing" in tagline) — CRITICAL
- NO emergency services page — CRITICAL
- NO EV charger, boiler, furnace, indoor air quality pages
- /services page still in draft (unpublished 1+ year)
- 13 CMS items in draft (11 previously published = broken links)
- 6 duplicate blog post pairs (generic + localized variant)

## Bloat to Cut in Migration
- 194 service+location CMS entries → replace with dynamic route generation
- 6 static job listing pages → CMS-driven
- /contact-us-mailer duplicate page → remove
- /career + /careers duplicate → consolidate
- 3 breadcrumb scripts (2 unused) → build into components
- 6 padding utility components → CSS classes

## GitHub Repository
- **Repo:** https://github.com/cqdesignsny/tz-electric.git
- **Branch:** main
- **Rule:** Always commit & push after changes. Keep README.md and MEMORY.md in sync between local and repo.

## Key Files
- README.md - Full project documentation
- HANDOFF.md - Rolling session handoff (read this before starting any session)
- MEMORY.md - Project memory (also in repo root)
- docs/agent-training-answers.md - **Canonical agent knowledge base** (Tyler's questionnaire answers + follow-up gap answers). Loaded by SMS / voice / chat agents as system prompt context. Persona: **Claire**.
- webflow-data.md - CMS collection schemas (parent-level, out-of-repo)
- STRATEGY.md - Comprehensive redesign strategy (parent-level, out-of-repo)

## Project Directory: tz-site/
- `src/app/layout.tsx` — Root layout (fonts, GTM, LocalBusiness schema, Header/Footer)
- `src/app/page.tsx` — Homepage (8 section components including CertificationSlider)
- `src/app/globals.css` — Full design system via Tailwind @theme
- `src/app/(services)/[slug]/page.tsx` — 7 service pages (electrical, hvac, mini-split, generator, plumbing, hot-water-heaters, emergency)
- `src/app/about-us/page.tsx` — About Us (story, values, certifications, service area)
- `src/app/contact-us/page.tsx` — Contact (3 methods, hours, Typeform CTA, map placeholder)
- `src/app/reviews/page.tsx` — Reviews (Trust Index widget, stats bar, star ratings)
- `src/app/financing/page.tsx` — Financing (how-it-works, Wisetack + Synchrony, FAQ)
- `src/app/gallery/page.tsx` — Gallery (category filter, 9 project placeholders)
- `src/app/promotions/page.tsx` — Promotions (4 promo cards)
- `src/app/careers/page.tsx` — Careers (benefits, 6 job listings)
- `src/app/services/page.tsx` — Services landing
- `src/app/service-areas/page.tsx` — Service areas main listing
- `src/app/service-areas/[city]/page.tsx` — Dynamic city pages (SSG, 7 cities)
- `src/app/service-areas/county/[county]/page.tsx` — Dynamic county pages (SSG, 5 counties)
- `src/app/privacy-policy/page.tsx` — Privacy policy (prose layout)
- `src/app/terms-condition/page.tsx` — Terms & conditions
- `src/app/cookies/page.tsx` — Cookie policy
- `src/app/accessibility-statement/page.tsx` — Accessibility (WCAG 2.1 AA)
- `src/app/refund-cancellation-policy/page.tsx` — Refund policy
- `src/lib/constants.ts` — All company data, nav items, services, analytics IDs
- `src/lib/metadata.ts` — SEO utilities (createMetadata, JSON-LD schemas)
- `src/lib/services-data.ts` — All 7 service pages data (titles, features, FAQs)
- `src/lib/service-areas-data.ts` — 7 cities + 5 counties data (slug, county, meta, descriptions)
- `src/app/mitsubishi/page.tsx` — Mitsubishi Electric Diamond Elite landing page
- `src/app/signature-plans/page.tsx` — Signature Plans (pricing cards, comparison table, terms accordion)
- `src/lib/mitsubishi-data.ts` — Mitsubishi landing page data (benefits, models, FAQ)
- `src/lib/signature-plans-data.ts` — 3 plans: Core ($35), Preferred ($45), Elite ($60)
- `src/lib/utils.ts` — cn(), formatPhone()
- `src/components/ui/TrustIndexWidget.tsx` — Trust Index Google Reviews widget + badge (useRef/useEffect script injection)
- `src/components/ui/` — Button, Badge, SectionHeader, Card, StarRating, TrustIndexWidget
- `src/components/layout/` — Header (sticky, dropdowns, mobile menu), Footer (4-col, CTA banner)
- `src/components/effects/ElectricCursor.tsx` — Canvas-based electric spark particle effect for hero sections
- `src/components/sections/CertificationSlider.tsx` — Infinite-scrolling logo slider (Mitsubishi, Generac, BBB, Nextdoor, Chronogrammy)
- `src/components/sections/` — HeroSection, TrustBar, ServicesGrid, WhyChooseUs, ReviewsSection, ServiceAreaSection, CTASection, ServicePageTemplate

## Build Status
- **Last build:** Successful — 38 static pages (homepage, 7 services, mitsubishi, about, contact, reviews, financing, gallery, promotions, careers, services landing, signature-plans, 5 legal pages, service-areas main + 7 city pages + 5 county pages)
- **Build verified:** 2026-03-17 Session 8
- **Production domain:** https://tzelectricinc.com (live as of 2026-04-12, Cloudflare DNS → Vercel)
- **Vercel preview:** https://tz-electric.vercel.app/
- **Local SSD copy:** /Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site

## Completed
- [x] Project setup (Next.js, Tailwind 4, TypeScript, Framer Motion)
- [x] Design system (colors, typography, spacing, shadows, utilities)
- [x] Root layout with GTM, fonts, LocalBusiness schema
- [x] Header component (top bar, sticky nav, dropdowns, mobile menu)
- [x] Footer component (CTA banner, 4-col grid, social links)
- [x] Homepage (7 sections: Hero, TrustBar, Services, WhyChooseUs, Reviews, ServiceAreas, CTA)
- [x] 7 service pages with reusable template
- [x] All UI components (Button, Badge, SectionHeader, Card, StarRating)
- [x] About Us, Contact Us, Reviews, Financing, Gallery, Promotions, Careers, Services landing
- [x] Service areas (main listing + 7 dynamic city pages via SSG)
- [x] 5 legal pages (privacy, terms, cookies, accessibility, refund)
- [x] ElectricCursor canvas spark effect on ALL hero sections (homepage + every content page)
- [x] CertificationSlider infinite-scrolling logo bar on homepage
- [x] Mitsubishi Electric dedicated landing page (/mitsubishi)
- [x] Service page hero images with gradient overlays (text over background images)
- [x] Signature Plans pricing legibility fix (card-style prepaid rows)
- [x] Signature Plans Terms & Conditions blue-branded accordion styling
- [x] Service page FAQ blue-branded accordion with icon badges
- [x] Fixed plumbing service image (was showing outlet photo)
- [x] Added Mitsubishi Electric to nav dropdown
- [x] Luxury redesign: rounded-full buttons, scale hover, deeper navy/royal blue palette
- [x] Hero image slider (6 photos cycling, navy gradient overlay, slide indicators)
- [x] Official Diamond Contractor SVG + Mitsubishi Electric SVG logos added
- [x] Mitsubishi page: large DC logo in hero, ME logo card, redesigned credential section
- [x] Certification slider: new logos, 2x faster (14s), grayscale→color on hover
- [x] Footer: certification logo bar, navy gradient CTA, "Follow Us" social section
- [x] 5 county landing pages (Greene, Columbia, Ulster, Dutchess, Albany) with SEO
- [x] Social media: YouTube added, icons in header top bar + footer
- [x] Plumbing image fixed (was using water-heater.png in both constants + services-data)
- [x] About page: team photo next to Our Story, Tyler photo crop adjusted
- [x] Mitsubishi Electric added to mega menu MEGA_MENU_SERVICES array
- [x] About page certifications updated with new DC + ME logos
- [x] GitHub repo initialized and synced (https://github.com/cqdesignsny/tz-electric.git)
- [x] Vercel deployment live at https://tz-electric.vercel.app/
- [x] Trust Index Google Reviews widget integrated (reviews page + homepage ReviewsSection)
- [x] Trust Index Badge widget on homepage hero + all service page heroes
- [x] Reviews page rewritten with live Trust Index widget (replaced static reviews)
- [x] Homepage ReviewsSection rewritten with live Trust Index widget (replaced static cards)
- [x] Plumbing image updated to real copper parts/tools photo (plumbing.jpg)
- [x] Tyler Zitz founder card resized (max-w-4xl, grid-cols-[2fr_3fr], aspect-[3/4] matching leadership cards)
- [x] Homepage hero height reduced (min-h 700/750→500/550px, padding py-16/20→py-12/16)
- [x] Services page redesigned: 2-column grid, blue outline cards, real images, hover effects, 95% width
- [x] TrustIndexWidget.tsx component created (useRef+useEffect script injection pattern)

## Remaining
- [ ] **Native forms to replace Typeform (active priority)** — Multi-step lead capture form and job application form. Wired to Housecall Pro CRM. GCLID tracking for Google Ads Smart Bidding. Reuses `renderEmailLayout()` for the lead notification email.
- [ ] **Add Delaware County to service-areas data** — Tyler confirmed it's covered; homepage shows it but `src/lib/service-areas-data.ts` and the service-areas page do not. Quick fix.
- [ ] **5 remaining agent blockers** (see section 10 of `docs/agent-training-answers.md`): HCP required fields, renter/landlord workflow, home-warranty decline script, review-already-left detection, Saturday dispatch scope.
- [ ] **SMS agent (Claire)** — Twilio + Anthropic Claude, 24/7, threaded conversations, takeover button. Persona, dispatch SOP, qualification questions, and pricing all sourced from `docs/agent-training-answers.md`.
- [ ] **Web chat agent (Claire)** — replaces Podium gap, proactive popup after 15s, on all pages.
- [ ] **Voice agent (Claire)** — Vapi + Twilio, 15-min max before forced handoff, books jobs, follows after-hours emergency dispatch SOP.
- [ ] Knowledge Base module (`/switchboard/knowledge-base`) becomes live editor over the answers doc.
- [ ] Lead Pipeline, Reports, Email Assistant, Office Ops, Warehouse, Sales/Outbound modules.
- [ ] Blog content migration from old Webflow site (nav hidden, code ready)
- [ ] Sanity.io CMS setup
- [ ] Google Maps embeds (placeholders in contact & service-areas)
- [ ] Interactive gallery filtering
- [ ] Performance optimization & Lighthouse testing
- [ ] Bing Webmaster Tools setup
- [ ] Google Search Console verification meta tag (field empty in layout.tsx)

## Session Log
- **2026-03-12 (Session 1):** Research — analyzed live site, Webflow backend, extracted tracking IDs, documented SEO, mapped site structure. Created README.md and MEMORY.md.
- **2026-03-12 (Session 2):** Strategy — bloat audit, competitive analysis, keyword gaps, world-class research. Created STRATEGY.md.
- **2026-03-12 (Session 3):** Build started — Next.js project setup, design system, root layout, Header, Footer, Homepage (7 sections), all UI components, 7 service pages with reusable template. Build verified successful (10 static pages).
- **2026-03-12 (Session 4):** All content pages built — About Us, Contact, Reviews, Financing, Gallery, Promotions, Careers, Services landing, 5 legal pages, service areas (main + 7 city SSG pages), service-areas-data.ts module. Build verified: 31 static pages.
- **2026-03-12 (Session 5):** Visual review & CSS fix — previewed site on port 3007, found invisible button text and missing h1 on about-us. Root cause: Tailwind CSS 4 cascade layer issue — base element styles (`a`, `h1-h6` color rules) were unlayered in globals.css, overriding Tailwind utility classes like `text-white`. Fixed by wrapping all base styles in `@layer base {}`. Verified fix across 8+ pages/sections (homepage, about, contact, electrical, reviews, careers, service areas, footer). No regressions.
- **2026-03-12 (Session 6):** Design polish & new features — Built ElectricCursor canvas particle effect (electric sparks on mouse hover) and added to ALL hero sections across every page. Created CertificationSlider infinite-scroll logo bar (Mitsubishi Diamond Elite, Generac, BBB, Nextdoor, Chronogrammy) and added below homepage hero. Built dedicated Mitsubishi Electric landing page with Diamond Elite content, benefits grid, system models, FAQ. Added hero background images with gradient overlays to all 7 service pages via ServicePageTemplate. Fixed Signature Plans: redesigned prepaid pricing as legible card-style rows, restyled Terms accordion with blue-branded icons/chevrons/hover effects. Fixed FAQ styling across service pages with same blue-branded treatment. Fixed plumbing image bug (was showing outlet photo in both constants.ts and services-data.ts). Added Mitsubishi Electric to nav dropdown. Increased certification logo sizing across the site: slider logos from 72px to 96px, about-us logos from 80px to 112px for better readability. Created README.md with full project documentation. Build verified: 33 static pages.
- **2026-03-16 (Session 7):** Luxury redesign & expansion — GitHub repo initialized and pushed (3 commits). Vercel deployment connected at tz-electric.vercel.app. Major luxury redesign: rounded-full buttons with scale hover, deeper navy/royal blue color palette, hero image slider with 6 cycling photos and navy gradient overlay. Added official Diamond Contractor + Mitsubishi Electric SVG logos throughout site (hero, Mitsubishi page, footer, certification slider, about page). Certification slider 2x faster with grayscale→color hover. Footer refined with navy gradient CTA and certification logo bar. Built 5 county landing pages (Greene, Columbia, Ulster, Dutchess, Albany) with SSG, towns grid, services, and county-level SEO meta. Added social media (YouTube) to constants, header top bar social icons, and footer "Follow Us" section. Fixed plumbing image, about page team photo, Tyler crop. Added Mitsubishi to mega menu. Build: 38 static pages.
- **2026-03-17 (Session 8):** Trust Index integration & visual polish — Integrated Trust Index premium Google reviews widget on reviews page and homepage (replacing static review cards). Created TrustIndexWidget.tsx with useRef+useEffect script injection pattern (Trust Index scripts must be inline in DOM). Added Trust Index Badge to homepage hero and all service page heroes (replaced static "330+ 5-Star Reviews" pill). Updated plumbing image to real copper parts/tools photo (plumbing.jpg). Fixed Tyler Zitz founder card sizing on about page (6+ iterations to match leadership card proportions: max-w-4xl, grid-cols-[2fr_3fr], aspect-[3/4]). Reduced homepage hero height from 700/750px to 500/550px. Redesigned services page: 2-column grid with blue outline cards, real service images, hover effects (border, shadow, translate-y, scale, gradient overlay, accent bar), 95% viewport width. Build: 38 static pages.
- **2026-04-24 (Session 10 — TZ Switchboard):** Built the internal control center for TZ Electric at `/switchboard`. Full agency-handoff plan for replacing Podium with custom AI agents (Voice via Vapi, SMS via Twilio, Web chat via Next.js + Claude API). Decided to build everything Vercel-native instead of VPS + n8n; Next.js site becomes Tyler's permanent AI operations platform. Built agent training questionnaire (~70 questions, 9 sections) at `/switchboard/agent-training` with localStorage autosave and Submit button that emails Markdown to cesar@creativequalitymarketing.com via Resend. Added native auth: shared password + HMAC-signed HttpOnly cookie session (30-day TTL). Middleware gates `/switchboard/*` except `/switchboard/login`. Login page is full-screen navy with white logo + password form; redirects to `?next=` after login. Built sidebar dashboard chrome: TopBar (navy, white logo, mobile hamburger, page title), Sidebar (Operations / AI Agents / Future Agents nav, status pills, Sign out at bottom), DashboardShell (mobile drawer overlay). Dashboard home shows stats placeholders + Active/Soon/Planned modules pulled from shared nav-config.ts. Footer of public site now has discreet "Admin" link in bottom bar. Created HANDOFF.md at TZ-Site-2026 root for next-session continuity. Required env vars: SWITCHBOARD_PASSWORD, SWITCHBOARD_SESSION_SECRET, RESEND_API_KEY (graceful fallback if Resend missing). Old `/agent-training` redirects to new path. Submit endpoint also auth-gated.
- **2026-04-12 (Session 9):** Domain launch, SEO, analytics, careers, integrations — Site went live on tzelectricinc.com (Cloudflare DNS → Vercel). Created robots.ts and dynamic sitemap.ts (50+ URLs). Added favicon (favicon.ico + icon.png + apple-icon.png) from uploaded Favicon.png. Created OG default image (white logo on navy, 1200x630). Added 2 new team members: Franklin Ruballos (Apprentice) and April Walcott (Office Support) with photos and bios. Replaced all team photos with new Team-2026.jpg across hero slider, About Us, and Careers pages. Fixed Careers page placeholder with actual team photo. Widened team photo container from 4:3 to 16:9 to prevent side cropping. Hidden blog from header nav, footer, and constants (code ready, awaiting content migration). Fixed GTM container ID from GTM-MGWW87JT to correct GTM-WV326JN8. Added GA4, Google Ads, Facebook Pixel, and Hotjar scripts directly to layout.tsx (previously only IDs stored in constants, not loaded). Removed Podium webchat widget (no longer in use). Submitted sitemap to Google Search Console. Confirmed www redirect via Vercel. Built 6 individual career/job listing pages with full content from old Webflow site (responsibilities, qualifications, benefits, schedule, pay ranges, JobPosting JSON-LD schema). Apply buttons link to Typeform application form. Created hidden /thank-you page for Google Ads conversion tracking (noIndex, blocked in robots.txt). Linked Vercel project and added all environment variables (Stripe keys, HCP API key, base URL). Triggered production deployment with env vars. Stripe webhook updated to point to production domain. Cloned repo to local SSD at /Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site. Noted: next priority is native forms to replace Typeform with GCLID tracking for Google Ads Smart Bidding (per Laura's recommendation).
- **2026-04-27 (Session 12 part 2):** v1 best-practice fills locked in + agent buildout roadmap mapped + native lead form started. Tyler doesn't have opinions on the operational gaps (HCP record creation flow, renter / landlord workflow, home warranty decline script, review-already-left detection, Saturday dispatch scope), so CQ Studio made the calls based on industry-standard practice for multi-trade home-services contractors and committed them as section 10 ("v1 Best-Practice Fills") of `docs/agent-training-answers.md`. Tyler can override anything by editing that file. Decision summary: HCP receives leads via `POST /leads` (not `/customers`), drops into Job Inbox > "API Leads" channel; renters get a soft-block at form/AI level with landlord-info collection + office verification before booking; warranty companies get a warm decline pivoting to Wisetack / Synchrony financing; review requests send once at 48 hr / 5–9 PM, no auto-follow-up, optional manual second send via TZ Switchboard; Saturday emergencies follow the existing after-hours dispatch SOP, non-emergencies book for next business day, no estimates. Mapped the seven-phase agent buildout roadmap into README: Phase 1 lead form (active), 2 KB read-only, 3 KB edit-in-place, 4 SMS Claire, 5 web chat Claire, 6 voice Claire (Vapi), 7 self-improving learning loop with transcript flagging and KB merge approval. Started the lead form: `/quote` page, 3-step (service type → qualification → contact), HCP `/leads` endpoint, Resend branded email, GCLID + UTM capture, replaces every `TYPEFORM_URL` CTA site-wide, renter branch tags `Renter - Landlord Verification Needed`. Updated HANDOFF.md, README.md, and this file to reflect.
- **2026-04-27 (Session 12 part 1):** Tri-location sync repair + Tyler's questionnaire answers locked in. Started session on a new machine where the SSD copy had drifted from Dropbox on non-git artifacts. Both repos were already at the same commit (`bdd6be2`); the gaps were in gitignored files (`.env.local`, `.vercel/project.json`) and parent-level out-of-repo docs (`README.md`, `STRATEGY.md`, `webflow-data.md`, `skills-lock.json`, `.agents/skills/` Resend bundles, parent `.claude/`). Synced everything Dropbox → SSD (with one exception: `.vercel/project.json`, where SSD's canonical `tz-electric` link replaced Dropbox's stale `tz-site` link). Fixed the SSD's `.git/hooks/post-commit` `PEER=` path from `/Users/cqmarketing/...` (laptop) to `/Users/cqstudio/Library/CloudStorage/Dropbox/...` (main rig) so SSD-to-Dropbox auto-sync no longer silently no-ops on this machine. Then took delivery of Tyler's full questionnaire answers (submitted via the form on 2026-04-26) plus follow-up answers covering 4 of the 6 gaps Cesar flagged: persona name (**Claire**), AI-disclosure opener wording, SMS first auto-reply wording, hybrid water heater promo Ruud model numbers (PROUH40 / PROUH50 / PROUH80 T2 RU375-30), review request workflow (48 hr after job, 5–9 PM only, 1–2 sends max). Wrote all of this to a new canonical knowledge base at `tz-site/docs/agent-training-answers.md` (~700 lines, structured for direct injection into agent system prompts: pricing tables, dispatch SOPs, full 52-week on-call rotation, qualification questions per service, voice/SMS/chat preferences, customer scripts). Logged 5 remaining blockers in section 10 of that doc (HCP required fields, renter/landlord workflow, home-warranty decline script, review-already-left detection, Saturday dispatch scope). Updated this file, HANDOFF.md, and README.md to reflect the new canonical reference, Claire persona, Delaware county coverage, and Chronogrammies/Nextdoor awards. Confirmed all three locations on `bdd6be2` before commit.
- **2026-04-25 (Session 11):** TZ Switchboard rework, route-group split, Resend live under TZ. Major polish session. Set Vercel env vars (`SWITCHBOARD_PASSWORD=Itsgonnabegreat26!`, `SWITCHBOARD_SESSION_SECRET`, `RESEND_API_KEY`, `AGENT_TRAINING_FROM_EMAIL`). Reworked dashboard home: dropped "Active Modules" framing, added "Things to do" callout pointing at the agent training questionnaire. Made every Coming Soon and Planned sidebar item clickable; built 11 module info pages (lead-pipeline, reports, employee-training, knowledge-base, call-logs, sms-conversations, web-chat, email-assistant, office-operations, warehouse-inventory, sales-outbound) sharing one ModuleInfoPage template. Renamed placeholder "Trainiuly" to actual product (Trainual). Added Light/Dark/System theme toggle in topbar (defaults to System). Centered dashboard content on desktop with responsive padding. Dark-mode pass on questionnaire surfaces. Split public site into `(public)/` route group with its own layout owning Header/Footer/FloatingCTA/ScrollToTop and all analytics scripts (GTM, GA4, Google Ads, Facebook Pixel, Hotjar) and LocalBusiness JSON-LD. Slimmed root layout to html/body/fonts/globals only. Switchboard now renders in clean isolation, no public chrome bleeding through. Renamed every UI reference to always say "TZ Switchboard" (never "Switchboard" alone). Removed em dashes from all UI copy across nav-config, dashboard, info pages, questionnaire, and questions list. Wired up Resend integration: account created under `tzelectricoffice@gmail.com`, domain `tzelectricinc.com` verified (SPF + DKIM via Cloudflare), built `src/lib/email-templates.ts` with reusable `renderEmailLayout()` shell + `renderQuestionnaireSubmissionEmail()`. Email template features: top gradient strip, TZ logo on white header, eyebrow + heading + intro + stats row + body + CTA pill button + branded footer. Inline-styled, table-based, mobile-responsive. Updated submit route to send branded HTML + plain-text fallback with reply-to. Resend already TZ-owned so it skips the Tyler handoff entirely. Cesar sent Tyler the link, password, and full project context message via Slack. Updated HANDOFF.md, README.md, and MEMORY.md to reflect the current state. 5 commits this session: e4f0587 (account handoff plan), ba45634 (clickable modules + theme toggle), 4b6e112 ((public) route group + rename + AI copy scrub), 00b8907 (Resend branded emails), plus this docs commit. All three locations (SSD/GitHub/Dropbox) synced.
