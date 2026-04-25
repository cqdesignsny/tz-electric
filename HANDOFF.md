# TZ Switchboard Handoff

This is the rolling handoff doc. Last verified state, what's done, what's next, what's deferred. If anything below conflicts with code, trust the code. Keep this updated after every working session.

**Last verified:** 2026-04-25, end of session 11. All three locations (GitHub / SSD / Dropbox) synced. Run the sanity check at the bottom of this doc to confirm before you start.

## Sync architecture (read this first)

Three copies of this codebase exist. They must always match.

| Location | Path | Role |
|---|---|---|
| **GitHub** | `https://github.com/cqdesignsny/tz-electric.git` | **Source of truth.** Vercel deploys from here. |
| **SSD** | `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site` | **Local dev location.** Run `npm run dev` here (Turbopack hates Dropbox). |
| **Dropbox** | `/Users/cqmarketing/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site` | **Cloud backup mirror.** Editable, but prefer SSD for active work. |

**Hierarchy if anything ever drifts:** GitHub > SSD > Dropbox.

### Auto-sync (already wired up)

Both SSD and Dropbox have a `.git/hooks/post-commit` hook. After every commit on either side, the hook:
1. Pushes the commit to GitHub
2. Fast-forwards the other mirror via `git fetch` + `git merge --ff-only`

So a normal commit on the SSD propagates everywhere automatically. No manual `git push` needed. If the hook prints a WARNING (network error, non-fast-forward), resolve manually before continuing.

### Files always kept in sync (alongside the code)

- `tz-site/README.md`, public-facing project overview
- `tz-site/MEMORY.md`, Claude memory snapshot for session continuity
- `tz-site/HANDOFF.md`, this file
- `tz-site/STRATEGY.md` (if present), strategy and design rationale

All four live inside the repo and ride the auto-sync. Update them at the end of every working session along with the code changes.

### Manual sync sanity check (one-liner)

```bash
git -C "/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site" rev-parse HEAD
git -C "/Users/cqmarketing/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD
git ls-remote https://github.com/cqdesignsny/tz-electric.git refs/heads/main
```
All three should print the same SHA.

---

## Current state

The TZ Switchboard is live and fully functional at `tzelectricinc.com/switchboard`. Tyler has the link and password. The agent training questionnaire is the open task. When he submits, the answers route to `cesar@creativequalitymarketing.com` as a branded HTML email.

### What's live in production

- **Public site:** https://tzelectricinc.com (Cloudflare DNS, Vercel hosting)
- **TZ Switchboard:** https://tzelectricinc.com/switchboard (gated)
- **Login:** https://tzelectricinc.com/switchboard/login
- **Password:** `Itsgonnabegreat26!` (stored in Vercel env as `SWITCHBOARD_PASSWORD`)
- **Questionnaire:** https://tzelectricinc.com/switchboard/agent-training (auth-gated)
- **Module info pages:** 11 of them, every Coming Soon and Planned sidebar item is clickable and shows what we'll build there
- **Old `/agent-training`:** redirects to `/switchboard/agent-training`
- **Public footer link:** discreet "Admin" link in the bottom bar of every page

### Architecture summary

- Native auth: shared password + HttpOnly cookie, HMAC SHA-256 signed, 30-day TTL
- Middleware (`src/middleware.ts`) gates `/switchboard/*` except `/switchboard/login`
- Public site and TZ Switchboard run in separate route groups so the dashboard inherits no public chrome (no Header, Footer, FloatingCTA, ScrollToTop, or public-site analytics scripts)
  - Root layout (`src/app/layout.tsx`): slim, html / body / fonts / globals only
  - `src/app/(public)/layout.tsx`: owns the public chrome and all analytics (GTM, GA4, Google Ads, Facebook Pixel, Hotjar) plus the LocalBusiness JSON-LD
  - `src/app/switchboard/layout.tsx`: bare wrapper, sets the page-title template (`%s | TZ Switchboard`) and noindex metadata
  - `src/app/switchboard/(dashboard)/layout.tsx`: theme init script + DashboardShell
- Theme: Light / Dark / System toggle in the topbar, defaults to System. No-flash inline init script. Variant scoped to `[data-theme="dark"]` so the public site stays light only.
- Sidebar nav driven by `src/components/switchboard/nav-config.ts` (single source for module list, slugs, taglines, overview copy, "what it will do" bullets, "what we need" bullets)
- Email: branded HTML templates in `src/lib/email-templates.ts`. Reusable layout shell + per-email functions. Resend over a verified domain.

### Environment variables on Vercel

| Name | Set | Purpose |
|---|---|---|
| `SWITCHBOARD_PASSWORD` | yes | Admin login password |
| `SWITCHBOARD_SESSION_SECRET` | yes | HMAC secret for signing session cookies |
| `RESEND_API_KEY` | yes | Resend API key (account under `tzelectricoffice@gmail.com`) |
| `AGENT_TRAINING_FROM_EMAIL` | yes | `TZ Switchboard <notifications@tzelectricinc.com>` |
| `AGENT_TRAINING_TO_EMAIL` | not set | Optional override. Default: `cesar@creativequalitymarketing.com` |
| `AGENT_TRAINING_REPLY_TO` | not set | Optional override. Default: `service@tzelectricinc.com` |

All of the above are on Production and Development. Preview is intentionally skipped (Vercel CLI bug around all-preview-branches; we don't use feature-branch previews here so this is fine).

### Resend setup

- **Account owner:** `tzelectricoffice@gmail.com` (TZ side, not CQ)
- **Verified domain:** `tzelectricinc.com` with SPF + DKIM via Cloudflare DNS
- **Sender:** `notifications@tzelectricinc.com`
- **Reply-to:** `service@tzelectricinc.com`
- **Plan:** Free tier (3,000 / month, 100 / day). Upgrade to Pro ($20 / mo, 50k) before launch volume kicks in.
- **Migration note:** Resend is already TZ-owned, so it skips the Tyler handoff entirely.

## What's open right now

- [ ] **Tyler fills out the agent training questionnaire.** Cesar already sent him the link, password, and a context message via Slack on 2026-04-25.
- [ ] **Smoke test the full email flow.** Submit the questionnaire ourselves, confirm the branded email lands in `cesar@creativequalitymarketing.com` and renders well across Apple Mail, Gmail, Outlook.
- [ ] **Native lead form to replace Typeform.** Multi-step lead capture, GCLID tracking for Google Ads Smart Bidding, posts directly to Housecall Pro. Reuses `renderEmailLayout()` for the lead notification email.

## Account handoff plan (everything paid moves to Tyler)

The endgame: **Tyler owns every paid service under his own logins and his own card.** CQ Marketing keeps only the GitHub repo and the source code we author. All hosting, AI, telecom, and email costs hit Tyler's card directly. We stop being the middleman.

### Stays with CQ Marketing
- GitHub repo `cqdesignsny/tz-electric` (source of truth for the code)
- Ongoing development and maintenance work

### Moves to Tyler (TZ Electric)
| Service | What it does | Migration step |
|---|---|---|
| **Vercel team** | Hosts the site, deploys, owns the domain | Tyler creates a Vercel team, invites Cesar as member, we transfer `tz-electric` project from `cq-marketings-projects` to his team, reattach `tzelectricinc.com` (DNS doesn't change, same Vercel IP) |
| **Anthropic API** | Claude API powering chat, SMS, voice agents | Tyler signs up at console.anthropic.com, adds his card, generates `ANTHROPIC_API_KEY`, we set it on his Vercel project |
| **Twilio** | Phone number + SMS messaging for AI SMS agent | Tyler signs up at twilio.com, buys a local NY number, completes A2P 10DLC business registration, we set Twilio env vars on his Vercel |
| **Vapi** | Voice agent (handles inbound calls, books jobs) | Tyler signs up at vapi.ai, connects his Twilio number, assistant configured against our `/api/vapi/*` tool endpoints |
| **Resend** | Outbound email | **Already on TZ side.** Account owner `tzelectricoffice@gmail.com`. Domain `tzelectricinc.com` verified. API key on Vercel. No migration needed. |
| **Stripe** | Plan signup payments | Already on TZ's account, no migration needed |
| **Housecall Pro** | CRM, scheduling, customer tagging | Already on TZ's account, no migration needed |
| **Trainual** | Human staff training | Tyler will set up Trainual account when ready, the TZ Switchboard module deep-links to it |

### Order of operations
1. **Now to migration day:** finish building TZ Switchboard modules + AI agents under our Vercel and Anthropic accounts. Tyler fills out the questionnaire; we build the agent knowledge base.
2. **Migration day (single focused session):** Tyler provisions every account above. We do the cutover in one sitting, transfer Vercel project, swap each env var to his keys, redeploy, smoke test login + lead form + agents.
3. **After migration:** Tyler's card pays all infra directly. We keep shipping code from the GitHub repo and Vercel autodeploys to his team.

## What's NOT built (intentionally deferred)

- **Multiple users / roles.** Single shared password. Move to Clerk when employees need their own logins for training.
- **Magic link login.** Single password is fine for v0. Upgrade later.
- **Real activity feeds on dashboard home.** The home page focuses on the open task ("Things to do") plus clickable Coming Soon and Planned cards. Stats placeholders were removed because they were just dashes. Wire actual data in once agents are live.
- **Theme cookie.** Theme persists in localStorage only. Server-rendered HTML always defaults to light, then the inline init script sets the right `data-theme` before hydrate. Acceptable. Future: cookie-based for true zero-flash SSR.
- **proxy.ts migration.** Next 16 prefers `proxy.ts` over `middleware.ts`. Backwards-compatible. Deferred until a focused session to validate the API.
- **Branch-preview env vars.** Vercel CLI bug around all-preview-branches; not worth the workaround since we don't use feature-branch previews.

## Files added or significantly changed in session 11 (Apr 25)

```
src/app/(public)/layout.tsx                                NEW, public chrome + analytics + JSON-LD
src/app/layout.tsx                                         SLIMMED, html/body/fonts/globals only
src/app/(public)/...                                       MOVED, every public route into the route group
src/app/switchboard/layout.tsx                             MOD, page-title template
src/app/switchboard/(dashboard)/layout.tsx                 MOD, theme init script
src/app/switchboard/(dashboard)/page.tsx                   REWRITE, "Things to do" framing, clickable cards
src/app/switchboard/(dashboard)/<11 module slugs>/page.tsx NEW, info pages for every Coming Soon / Planned module
src/app/switchboard/(dashboard)/agent-training/QuestionnaireForm.tsx  MOD, dark mode pass + em dash cleanup
src/app/switchboard/(dashboard)/agent-training/questions.ts           MOD, em dash cleanup
src/app/api/agent-training/submit/route.ts                 MOD, branded HTML email + reply-to
src/components/switchboard/ModuleInfoPage.tsx              NEW, shared template for all 11 info pages
src/components/switchboard/ThemeProvider.tsx               NEW, Light/Dark/System context + no-flash script
src/components/switchboard/ThemeToggle.tsx                 NEW, segmented control for the topbar
src/components/switchboard/DashboardShell.tsx              MOD, wraps in ThemeProvider, dark mode bg
src/components/switchboard/Sidebar.tsx                     MOD, every item clickable, dark mode classes
src/components/switchboard/TopBar.tsx                      MOD, theme toggle right cluster, responsive
src/components/switchboard/nav-config.ts                   REWRITE, slug-based hrefs, rich per-module data
src/lib/email-templates.ts                                 NEW, reusable branded HTML email layout
src/app/globals.css                                        MOD, @custom-variant dark scoped to data-theme
README.md                                                  MOD, Switchboard section + integrations table
HANDOFF.md                                                 MOD, this file
```

## Known issues / open threads

- `/agent-training/submit` requires login session. If Tyler's cookie expires mid-fill, he'll get a 401 on Submit. Form preserves answers in localStorage so a re-login keeps the data. Add graceful redirect-on-401 with re-submit when we have time.
- Sidebar logout uses `window.location.href` (not `router.replace`) so the cleared cookie is fully respected. Small UX hop but reliable.
- StatusBadge component duplicated in dashboard page and sidebar. Could consolidate.
- Theme toggle on first paint of a brand new browser session: flashes light for ~50ms before the no-flash init script runs (the script is in the dashboard server layout). Acceptable for an internal tool.

## Quick command reference

```bash
# Local dev (SSD only, Turbopack chokes inside Dropbox)
cd "/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site"
npm run dev

# Build check
npm run build

# Deploy: just commit. The post-commit hook pushes to GitHub and updates the other mirror.
git add -A && git commit -m "your message"

# Generate session secret
openssl rand -hex 32

# Verify all three locations are in sync
git -C "/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site" rev-parse HEAD
git -C "/Users/cqmarketing/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD
git ls-remote https://github.com/cqdesignsny/tz-electric.git refs/heads/main

# Vercel env management (project linked at SSD only)
vercel env ls
vercel env add NAME production --value 'value' --yes
vercel env rm NAME production --yes

# Trigger redeploy (also happens on every push)
vercel redeploy <last-prod-url>
```

## What Cesar wants next

1. Tyler completes the questionnaire and we get the answers
2. Build the agent knowledge base (`/switchboard/knowledge-base` becomes the live module)
3. Native lead form to replace Typeform (with GCLID tracking and HCP integration)
4. Scaffold the AI agents in order: SMS, web chat, then Vapi voice
5. Wire each "coming soon" module as it ships
6. When everything works, run the Tyler migration day (Vercel team transfer + remaining account provisioning)

The TZ Switchboard becomes Tyler's permanent operational backend. Every future agent (email assistant, office ops, warehouse, sales, marketing) ships as a new module in this same dashboard.
