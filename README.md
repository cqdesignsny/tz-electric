# TZ Electric, Inc. — Website Redesign

Full-stack website redesign migrating from Webflow to Next.js. Built for **TZ Electric, Inc.** (Plumbing | Heating | Cooling), serving the Hudson Valley, NY.

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
| Deployment | Vercel ([tz-electric.vercel.app](https://tz-electric.vercel.app/)) |

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

```
src/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout (fonts, GTM, JSON-LD, Header/Footer)
│   ├── page.tsx                   # Homepage (8 sections)
│   ├── globals.css                # Design system via Tailwind @theme
│   ├── (services)/[slug]/         # 7 dynamic service pages
│   ├── mitsubishi/                # Mitsubishi Electric landing page
│   ├── signature-plans/           # Maintenance plans with pricing
│   ├── about-us/                  # Company story, values, certifications
│   ├── contact-us/                # Contact methods, hours, map
│   ├── reviews/                   # Customer reviews & ratings
│   ├── financing/                 # Wisetack & Synchrony financing
│   ├── gallery/                   # Project photo gallery
│   ├── promotions/                # Current deals & specials
│   ├── careers/                   # Job listings & benefits
│   ├── services/                  # Services landing page
│   ├── service-areas/             # Main listing + 7 city pages + 5 county pages
│   ├── privacy-policy/            # Privacy policy
│   ├── terms-condition/           # Terms & conditions
│   ├── cookies/                   # Cookie policy
│   ├── accessibility-statement/   # WCAG 2.1 AA compliance
│   └── refund-cancellation-policy/# Refund policy
├── components/
│   ├── ui/                        # Button, Badge, Card, SectionHeader, StarRating
│   ├── layout/                    # Header (sticky, dropdowns, mobile), Footer (4-col)
│   ├── sections/                  # HeroSection, TrustBar, ServicesGrid, WhyChooseUs,
│   │                              # ReviewsSection, ServiceAreaSection, CTASection,
│   │                              # ServicePageTemplate, CertificationSlider
│   └── effects/                   # ElectricCursor (canvas particle system)
└── lib/
    ├── constants.ts               # Company data, nav, services, analytics IDs
    ├── metadata.ts                # SEO utilities, JSON-LD schema generators
    ├── services-data.ts           # 7 service pages data (features, FAQs, content)
    ├── service-areas-data.ts      # 7 cities + 5 counties data (slug, county, meta, descriptions)
    ├── mitsubishi-data.ts         # Mitsubishi landing page content
    ├── signature-plans-data.ts    # Maintenance plan tiers & pricing
    └── utils.ts                   # cn(), formatPhone()
```

## Pages (38 Static Routes)

- **Homepage** — Hero image slider (6 cycling photos), trust bar, services grid, why choose us, reviews, service areas, CTA
- **7 Service Pages** — Electrical, HVAC, Mini Splits, Generators, Plumbing, Hot Water Heaters, Emergency
- **Mitsubishi Landing** — Dedicated Mitsubishi Diamond Elite page with official DC + ME logos
- **Signature Plans** — Maintenance plan pricing with branded Terms accordion
- **About Us** — Company story, team photo, values, certifications, service area map
- **Contact Us** — 3 contact methods, business hours, Typeform CTA
- **Reviews** — Customer testimonials with star ratings and stats
- **Financing** — How-it-works flow, Wisetack + Synchrony options, FAQ
- **Gallery** — Category-filtered project photo grid
- **Promotions** — Current deals and special offers
- **Careers** — Benefits list and 6 job openings
- **Services Landing** — All services overview with feature lists
- **Service Areas** — Main listing + 7 individual city pages + 5 county pages (SSG)
- **5 Legal Pages** — Privacy, terms, cookies, accessibility, refund

## Design System

Defined in `globals.css` using Tailwind CSS 4 `@theme`:

- **Colors**: Navy (`#0F1C3F`), Blue (`#1E40AF`), Blue Light (`#2563EB`), Gold (`#C9A84C`), Success (`#059669`), Warning (`#D97706`), Emergency (`#DC2626`)
- **Typography**: Montserrat (headings), Manrope (body)
- **Spacing**: `section-padding`, `container-site` utility classes
- **Components**: Cards with hover shadows, gradient hero overlays, blue-branded accordions

## Key Features

- **Hero Image Slider** — 6 cycling photos with navy gradient overlay and slide indicators
- **Electric Cursor Effect** — Canvas-based particle system on all page heroes (sparks follow mouse)
- **Certification Slider** — Infinite-scrolling logo carousel with grayscale→color hover (Mitsubishi DC, ME, Generac, BBB, Nextdoor, Chronogrammy)
- **Luxury Design** — Rounded-full buttons, scale hover effects, deep navy/royal blue palette, gold accents
- **County Landing Pages** — 5 county-level SEO pages (Greene, Columbia, Ulster, Dutchess, Albany) with towns grid
- **Service Page Template** — Reusable component for consistent service page layouts
- **Social Media Integration** — Facebook, Instagram, YouTube, Google icons in header top bar + footer
- **SEO** — Custom meta per page, LocalBusiness + BreadcrumbList JSON-LD schemas, county-level targeting
- **Responsive** — Mobile-first with sticky header, mobile menu, touch-friendly

## Analytics & Tracking

All preserved from the original Webflow site:

- GA4: `G-X55X1YSD10`
- Google Ads: `AW-16641031492`
- GTM: `GTM-MGWW87JT`
- Facebook Pixel: `489773923452243`
- Hotjar: `5144458`

## Business Info

- **Company**: TZ Electric, Inc. (Plumbing | Heating | Cooling)
- **Phone**: (518) 678-1230
- **Email**: service@tzelectricinc.com
- **Address**: 5079 NY-32, Catskill, NY 12414
- **Service Area**: Hudson Valley, NY (Dutchess, Ulster, Albany, Columbia, Greene counties)
- **Certifications**: Mitsubishi Diamond Elite, Generac Authorized Dealer, BBB Accredited

## Remaining Work

- [ ] Blog system (listing + individual posts)
- [ ] Individual career/job posting pages
- [ ] Download & integrate high-res images from Webflow
- [ ] Sanity.io CMS setup
- [ ] Google Maps embeds (placeholders in contact & service-areas)
- [ ] Real review widget integration (Trust Index)
- [ ] Interactive gallery filtering (client component)
- [ ] Housecall Pro API integration (scheduling)
- [ ] Replace Typeform with native forms
- [ ] Performance optimization & Lighthouse testing
