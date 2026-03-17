# TZ Electric Inc - Website Redesign Project Memory

## Project Summary
Redesigning tzelectricinc.com from Webflow to Next.js 15. Live production site - build in parallel, switch when ready.

## Key Business Info
- **Company:** TZ Electric, Inc. (Plumbing | Heating | Cooling)
- **Phone:** (518) 678-1230 | **Email:** service@tzelectricinc.com
- **Address:** 5079 NY-32, Catskill, NY 12414
- **Service Area:** Hudson Valley NY - Dutchess, Ulster, Albany, Columbia, Greene counties
- **Certifications:** Mitsubishi Diamond Elite, Generac Authorized Dealer, BBB Accredited
- **Reviews:** 330+ Google 5-star reviews

## Webflow Site Details
- **Site ID:** 67ac70b9e25b6a62ed436918
- **Domains:** tzelectricinc.com, www.tzelectricinc.com
- **Pages:** 43 total (core, service, career, legal, CMS templates)
- **CMS Collections:** 9 (Services, Blog Posts, Locations, Electricals, Generators, Mini Splits, HVACs, Reference Locations, Hot Water Heaters)
- **Components:** 25 (Header, Navbar, Footer, various section types, spacing utilities)

## Analytics & Tracking IDs (MUST PRESERVE)
- GA4: G-X55X1YSD10
- Google Ads: AW-16641031492
- GTM: GTM-MGWW87JT
- Facebook Pixel: 489773923452243
- Hotjar: 5144458

## Current Integrations
- Typeform for lead capture (ghfs29y37tj.typeform.com/to/HDLXmnob)
- Trust Index for Google reviews widget
- Swiper.js for carousels
- Google Maps embed
- Wisetack & Synchrony financing

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
- Podium (messaging/reviews)
- Native form handling (replace Typeform)

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
- MEMORY.md - Project memory (also in repo root)
- webflow-data.md - CMS collection schemas
- STRATEGY.md - Comprehensive redesign strategy
- [feedback_tailwind4_layers.md](feedback_tailwind4_layers.md) - Tailwind CSS 4 @layer base gotcha
- [feedback_github_sync.md](feedback_github_sync.md) - Always keep GitHub repo in sync with local

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
- **Vercel deployment:** https://tz-electric.vercel.app/

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
- [ ] Blog system (listing + individual posts)
- [ ] Individual career/job posting pages
- [ ] Download & integrate high-res images from Webflow
- [ ] Sanity.io CMS setup
- [ ] Google Maps embeds (placeholders in contact & service-areas)
- [ ] Interactive gallery filtering
- [ ] Housecall Pro API integration (future)
- [ ] Replace Typeform with native forms (future)
- [ ] Performance optimization & testing

## Session Log
- **2026-03-12 (Session 1):** Research — analyzed live site, Webflow backend, extracted tracking IDs, documented SEO, mapped site structure. Created README.md and MEMORY.md.
- **2026-03-12 (Session 2):** Strategy — bloat audit, competitive analysis, keyword gaps, world-class research. Created STRATEGY.md.
- **2026-03-12 (Session 3):** Build started — Next.js project setup, design system, root layout, Header, Footer, Homepage (7 sections), all UI components, 7 service pages with reusable template. Build verified successful (10 static pages).
- **2026-03-12 (Session 4):** All content pages built — About Us, Contact, Reviews, Financing, Gallery, Promotions, Careers, Services landing, 5 legal pages, service areas (main + 7 city SSG pages), service-areas-data.ts module. Build verified: 31 static pages.
- **2026-03-12 (Session 5):** Visual review & CSS fix — previewed site on port 3007, found invisible button text and missing h1 on about-us. Root cause: Tailwind CSS 4 cascade layer issue — base element styles (`a`, `h1-h6` color rules) were unlayered in globals.css, overriding Tailwind utility classes like `text-white`. Fixed by wrapping all base styles in `@layer base {}`. Verified fix across 8+ pages/sections (homepage, about, contact, electrical, reviews, careers, service areas, footer). No regressions.
- **2026-03-12 (Session 6):** Design polish & new features — Built ElectricCursor canvas particle effect (electric sparks on mouse hover) and added to ALL hero sections across every page. Created CertificationSlider infinite-scroll logo bar (Mitsubishi Diamond Elite, Generac, BBB, Nextdoor, Chronogrammy) and added below homepage hero. Built dedicated Mitsubishi Electric landing page with Diamond Elite content, benefits grid, system models, FAQ. Added hero background images with gradient overlays to all 7 service pages via ServicePageTemplate. Fixed Signature Plans: redesigned prepaid pricing as legible card-style rows, restyled Terms accordion with blue-branded icons/chevrons/hover effects. Fixed FAQ styling across service pages with same blue-branded treatment. Fixed plumbing image bug (was showing outlet photo in both constants.ts and services-data.ts). Added Mitsubishi Electric to nav dropdown. Increased certification logo sizing across the site: slider logos from 72px to 96px, about-us logos from 80px to 112px for better readability. Created README.md with full project documentation. Build verified: 33 static pages.
- **2026-03-16 (Session 7):** Luxury redesign & expansion — GitHub repo initialized and pushed (3 commits). Vercel deployment connected at tz-electric.vercel.app. Major luxury redesign: rounded-full buttons with scale hover, deeper navy/royal blue color palette, hero image slider with 6 cycling photos and navy gradient overlay. Added official Diamond Contractor + Mitsubishi Electric SVG logos throughout site (hero, Mitsubishi page, footer, certification slider, about page). Certification slider 2x faster with grayscale→color hover. Footer refined with navy gradient CTA and certification logo bar. Built 5 county landing pages (Greene, Columbia, Ulster, Dutchess, Albany) with SSG, towns grid, services, and county-level SEO meta. Added social media (YouTube) to constants, header top bar social icons, and footer "Follow Us" section. Fixed plumbing image, about page team photo, Tyler crop. Added Mitsubishi to mega menu. Build: 38 static pages.
- **2026-03-17 (Session 8):** Trust Index integration & visual polish — Integrated Trust Index premium Google reviews widget on reviews page and homepage (replacing static review cards). Created TrustIndexWidget.tsx with useRef+useEffect script injection pattern (Trust Index scripts must be inline in DOM). Added Trust Index Badge to homepage hero and all service page heroes (replaced static "330+ 5-Star Reviews" pill). Updated plumbing image to real copper parts/tools photo (plumbing.jpg). Fixed Tyler Zitz founder card sizing on about page (6+ iterations to match leadership card proportions: max-w-4xl, grid-cols-[2fr_3fr], aspect-[3/4]). Reduced homepage hero height from 700/750px to 500/550px. Redesigned services page: 2-column grid with blue outline cards, real service images, hover effects (border, shadow, translate-y, scale, gradient overlay, accent bar), 95% viewport width. Build: 38 static pages.
