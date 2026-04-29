# TZ Switchboard Handoff

This is the rolling handoff doc. Last verified state, what's done, what's next, what's deferred. If anything below conflicts with code, trust the code. Keep this updated after every working session.

**Last verified:** 2026-04-28, mid-session 15 (auth + editable KB in progress). All three locations (GitHub / SSD / Dropbox) synced. Run the sanity check at the bottom of this doc to confirm before you start.

## Sync architecture (read this first)

Three copies of this codebase exist. They must always match.

| Location | Path | Role |
|---|---|---|
| **GitHub** | `https://github.com/cqdesignsny/tz-electric.git` | **Source of truth.** Vercel deploys from here. |
| **SSD** | `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site` | **Local dev location.** Run `npm run dev` here (Turbopack hates Dropbox). |
| **Dropbox** | `/Users/cqstudio/Library/CloudStorage/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site` | **Cloud backup mirror.** Editable, but prefer SSD for active work. |

**Per-machine note:** On Cesar's laptop the home directory is `cqmarketing` and Dropbox is at `/Users/cqmarketing/Dropbox/TZ Electric Inc/...`. Same Dropbox folder, different user-path prefix. The SSD's `.git/hooks/post-commit` hardcodes one path in its `PEER=` line and needs to be edited per machine to match the local Dropbox path, otherwise the SSD-to-Dropbox auto-sync silently no-ops.

**Hierarchy if anything ever drifts:** GitHub > SSD > Dropbox.

### Auto-sync (already wired up)

Both SSD and Dropbox have a `.git/hooks/post-commit` hook. After every commit on either side, the hook:
1. Pushes the commit to GitHub
2. Fast-forwards the other mirror via `git fetch` + `git merge --ff-only`

So a normal commit on the SSD propagates everywhere automatically. No manual `git push` needed. If the hook prints a WARNING (network error, non-fast-forward), resolve manually before continuing.

### Files always kept in sync (alongside the code)

- `tz-site/README.md`, public-facing project overview
- `tz-site/MEMORY.md`, project memory snapshot for session continuity
- `tz-site/HANDOFF.md`, this file
- `tz-site/STRATEGY.md` (if present), strategy and design rationale

All four live inside the repo and ride the auto-sync. Update them at the end of every working session along with the code changes.

### Manual sync sanity check (one-liner)

```bash
git -C "/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site" rev-parse HEAD
git -C "/Users/cqstudio/Library/CloudStorage/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD  # main rig
# git -C "/Users/cqmarketing/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD  # laptop
git ls-remote https://github.com/cqdesignsny/tz-electric.git refs/heads/main
```
All three should print the same SHA.

---

## Current state

The TZ Switchboard is live and fully functional at `tzelectricinc.com/switchboard`. **Tyler submitted the agent training questionnaire on 2026-04-26 at 11:46 AM.** Cesar followed up with gap questions on 2026-04-27 and Tyler answered the persona/SMS/water-heater-promo/review-workflow gaps. All answers (original + follow-up) are locked in at [`docs/agent-training-answers.md`](docs/agent-training-answers.md). That file is the canonical knowledge base the SMS, voice, and web chat agents will load as their system prompt context. The persona is **Claire** (female voice, identifies as AI in the opener).

A handful of blockers remain before the SMS or voice agent can ship; see "What's open right now" below and section 10 of `docs/agent-training-answers.md`.

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

### SMS Claire cutover plan (when Tyler finishes vendor signups)

Scaffolding is live. Going from holding-pattern to "Claire is talking to customers" is now a small, well-defined step.

**Tyler's vendor todo (one-time):**

1. **Twilio account.** Sign up at twilio.com, buy a local Hudson Valley number, **start A2P 10DLC business registration immediately** — that's the long pole, 1-2 weeks of vendor review. Carriers throttle/block business SMS without it. Brand vetting fee ~$4 + ~$10/mo per campaign. Generate API credentials when the account is active (Account SID + Auth Token).
2. **AI provider.** Two paths:
    - **Preferred: Vercel AI Gateway.** Enable on Tyler's Vercel team (where the project lives post-migration). Auth is automatic via OIDC, no separate API key. One less paid account in the handoff.
    - **Fallback: direct Anthropic.** Sign up at console.anthropic.com, add a payment method, generate `ANTHROPIC_API_KEY`.

**Cesar's wire-up (~30 minutes once Tyler's keys land):**

1. Set Vercel env vars (production): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`. If using direct Anthropic also set `ANTHROPIC_API_KEY`. Gateway uses OIDC automatically.
2. Replace the TODO block in `src/app/api/agents/sms/webhook/route.ts` with the AI SDK `generateText` call (pseudocode is right there in the comment — `model: 'anthropic/claude-sonnet-4-6'`, system prompt from `buildSystemPrompt`, tools from `buildAgentTools`, message history mapped from `listMessages`).
3. In the Twilio console, point the inbound SMS webhook for the TZ number at `https://tzelectricinc.com/api/agents/sms/webhook` (POST, application/x-www-form-urlencoded).
4. Send a test SMS. The conversation appears in `/switchboard/sms-conversations`. Office can take over mid-thread; release sends the thread back to Claire.

**Office-side outbound SMS** (Twilio API call from `/api/agents/sms/conversations` when role=office_reply): currently persists only to the transcript. Add the Twilio Messages API push (~5 lines) at the same time as the model wire-up so office takeover replies actually deliver.

### Google OAuth + per-user auth cutover plan

The Switchboard now accepts Google sign-in alongside the legacy shared password (transition fallback). To turn on the Google flow:

**Cesar's one-time Google Cloud Console setup (~10 min):**

1. https://console.cloud.google.com → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID (Web application).
3. Authorized JavaScript origins: `https://tzelectricinc.com`
4. Authorized redirect URIs: `https://tzelectricinc.com/api/auth/callback/google`
5. Save the Client ID + Client Secret.
6. (Optional but recommended) → APIs & Services → OAuth consent screen → Internal user type → restrict to Workspace.

**Cesar's Vercel env adds:**

```
vercel env add AUTH_GOOGLE_ID production         # Google OAuth Client ID
vercel env add AUTH_GOOGLE_SECRET production     # Google OAuth Client Secret
vercel env add AUTH_SECRET production            # `openssl rand -hex 32`
vercel env add AUTH_TRUST_HOST production --value 'true'   # so NextAuth honors x-forwarded-host on Vercel
```

Trigger a redeploy after the env vars land. The login page will show the Google button alongside the password fallback. First sign-in with `tyler@tzelectricinc.com` and `terry@tzelectricinc.com` auto-assigns owner role; everyone else lands as `office` and can be promoted by an owner from `/switchboard/users`.

**Role allowlists (hardcoded in `src/lib/auth-config.ts`):**

- `OWNER_EMAILS`: `tyler@tzelectricinc.com`, `terry@tzelectricinc.com`
- `ADMIN_EMAILS`: `cesar@creativequalitymarketing.com`
- Allowed sign-in domains: `tzelectricinc.com`, `creativequalitymarketing.com`

Domain allowlist enforcement is in the NextAuth `signIn` callback AND in middleware (defense in depth). Editing the allowlists requires a deploy (intentional — these are the bootstrap identities).

**Editable KB (Tyler-overrides-win):**

`/switchboard/knowledge-base` shows the merged base + overrides view. Owners and admins see Edit / Revert buttons on every section; Tyler-authored overrides land in `tz_kb_overrides` keyed by section path and always win on render and in agent prompts. Every override write also stamps `tz_audit_log` and appends to `tz_kb_override_history` for diff display. Editing requires a Google session (the password fallback can read but not write — anonymous edits would have no attribution).

The agent prompt assembler (`src/lib/agent-prompt.ts`) reads the merged content on every prompt build via `loadMergedKnowledgeBase()`. The cache busts automatically on every override upsert.

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

### Vercel ownership (post-handoff 2026-04-28)

The `tz-electric` project has been transferred from `cq-marketings-projects` to a new **TZ Electric** Vercel team owned by `tzelectricoffice@gmail.com` (Pro plan, Tyler's card). Cesar (`cqdesignsny@gmail.com`) is a Member with full project access.

- Project id (unchanged): `prj_wtBcaXPS6KOeXJniJroHRYnxiDtm`
- New team id: `team_rgs4fNAHW2dNT1fCPsjf5aVg` (slug `tz-electric`)
- Old team (still has other CQ projects, no longer hosts tz-electric): `team_nSvXagrumMTVvAjEfQW5vPnw`
- Domain: `tzelectricinc.com` followed the project automatically. No DNS changes.
- All ~30 env vars (Stripe, Resend, HCP, Switchboard auth, AUTH_*, full Neon connection set) preserved as encrypted snapshots through the transfer.
- Neon database **migrated to TZ-DB on 2026-04-28** (same session as the team transfer). Production now points at `ep-aged-meadow-amvorazs.c-5.us-east-1.aws.neon.tech` (the TZ Marketplace-provisioned database). Schema + data copied via `pg_dump` (PG 17) → `psql` restore — verified row counts identical (1 user, 1 lead, 8 migrations). Canonical env vars (`DATABASE_URL`, `POSTGRES_*`, `PG*`, `NEON_PROJECT_ID`) all overwrite the original CQ-side snapshots and now point at TZ-DB. SSD `.env.local` re-pulled to match.
- **Old Neon on CQ removed 2026-04-28.** Cesar deleted the original Neon database from CQ Marketing's projects → Storage. Verified CQ team's Vercel storage no longer lists any tz-electric resource. Every paid resource for tz-electric is now on Tyler's TZ Electric Vercel team (hosting, AI Gateway access when wired, Neon DB). CQ Marketing keeps only the GitHub repo per the handoff plan.
- **Sensitive env vars 2026-04-28.** `HOUSECALL_PRO_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY` converted to Vercel `sensitive` type for production + preview (write-only — values cannot be revealed via the dashboard). Development keeps an `encrypted` row so `vercel env pull` keeps populating `.env.local` for local work.

### Database (Neon Postgres)

- **Provider:** Neon, attached to the `tz-electric` Vercel project via the Marketplace integration. DB name: `tz-db`. Provisioned on 2026-04-28.
- **Env vars (auto-injected by Vercel):** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NO_SSL`, plus `PG*` and `POSTGRES_*` host/user/password/database split. All set on Production, Preview, and Development. Pull locally with `vercel env pull .env.local --yes`.
- **Driver:** `@neondatabase/serverless` HTTP client at runtime (in `src/lib/db.ts`). Pool client in `scripts/migrate.mjs` for migrations. No `@vercel/postgres` (sunset).
- **Schema:** all TZ tables prefixed `tz_` so the DB can host other things alongside without naming collisions. Applied migrations are tracked in a `_migrations` table for idempotent reruns.
- **Migrations:** put new SQL files in `migrations/` numbered like `002_add_xxx.sql`. Run `npm run migrate` from the repo root. The script reads `DATABASE_URL_UNPOOLED` from `.env.local` (Pool client over WebSocket; needed because some statements don't play nice with PgBouncer transaction mode).
- **Current tables:** `tz_leads` (every form submission, will eventually hold AI agent intakes too — see Phase 4 in the buildout). Indexed on `created_at`, `source`, `email`, `phone`, `hcp_lead_id`, and `hidden`.
- **Read path today:** the TZ Switchboard Lead Pipeline still reads from HCP (the fast path). `tz_leads` is being populated via write-through so we have history when we flip the read path in Phase 4 / 7.

### Resend setup

- **Account owner:** `tzelectricoffice@gmail.com` (TZ side, not CQ)
- **Verified domain:** `tzelectricinc.com` with SPF + DKIM via Cloudflare DNS
- **Sender:** `notifications@tzelectricinc.com`
- **Reply-to:** `service@tzelectricinc.com`
- **Plan:** Free tier (3,000 / month, 100 / day). Upgrade to Pro ($20 / mo, 50k) before launch volume kicks in.
- **Migration note:** Resend is already TZ-owned, so it skips the Tyler handoff entirely.

## What's open right now

- [x] ~~Tyler fills out the agent training questionnaire.~~ Submitted 2026-04-26.
- [x] ~~Smoke test the full email flow.~~ Tyler's submission landed cleanly in `cesar@creativequalitymarketing.com` via Resend.
- [x] ~~Get Tyler's answers on the remaining blockers.~~ Tyler doesn't have opinions on the operational gaps, so CQ Studio filled them in with industry-standard best-practice defaults. See **section 10 of `docs/agent-training-answers.md`** ("v1 Best-Practice Fills"). Tyler can override any default by editing that file. Resolved: HCP record creation flow (use `/leads` endpoint), renter / landlord workflow (soft-block, collect landlord info, office verifies), home warranty decline script (warm pivot to Wisetack / Synchrony financing), review-already-left detection (single automated send + optional manual follow-up via Switchboard), Saturday dispatch scope (emergencies follow after-hours SOP, non-emergencies book for next business day, no estimates).
- [x] ~~Native lead form to replace Typeform.~~ Live at `/quote`. Branded email via Resend, GCLID + UTM capture, replaces every `TYPEFORM_URL` CTA. Renter branch tags `Renter - Landlord Verification Needed`. First real lead through it: Celeste Benard (#19), wired and visible across the stack.
- [x] ~~Form question parity with old Typeform.~~ Session 14 added every Typeform question that had been missing from the native form. HVAC: heating-only-or-both, throughout-vs-rooms, decommission existing system, NYSERDA awareness. Electrical: why-upgrading, overhead-vs-underground, switch-to-underground (conditional), utility company. Generator: full residential/commercial branch — portable-vs-standby on residential side, generator size on commercial side, plus service size + utility company on both. Conditional questions (`showWhen`) hide automatically when the parent answer doesn't match, and stale answers prune client + server side when a parent answer changes.
- [x] ~~HCP routing rewritten: estimates instead of leads.~~ Per Tyler's 2026-04-28 call, `customer.notes` is reserved for persistent customer info ("don't wear shoes in the house"), NOT job specifics. New flow: `POST /api/leads/submit` finds the existing customer in HCP (by ANY of phone, email, or full name — see "Existing customer match" below), or creates a new one with name/phone/email/address only and `notes=null`. Then creates an unscheduled estimate with `work_status: needs scheduling`. Office-internal lead details land on the option's notes via a secondary `POST /estimates/{eid}/options/{oid}/notes` call (HCP drops `notes` on options at create time — verified empirically). Tags land on `option.tags` and surface on the estimate row in HCP. The `tz_leads` row is stitched with `hcp_customer_id`, `hcp_estimate_id`, `hcp_customer_existing`, `hcp_match_via`, `hcp_error` so the Switchboard can deep-link to the matching HCP estimate. **Empirical HCP findings logged in `src/lib/housecall-pro.ts`** so the next agent doesn't have to rediscover them.
- [x] ~~Job Inbox visibility for new leads.~~ Per Tyler's 2026-04-28 follow-up: office staff also need new leads to land in HCP's Job Inbox > "API Leads" channel so they don't have to refresh the Estimates list to notice them. After the estimate succeeds we also `POST /leads` with **top-level `customer_id`** referencing the existing customer (verified empirically — top-level works, nested `customer.id` returns 400, and sending a `customer` object creates duplicate customer records). Same triage tags go on the inbox lead so the team sees service / urgency / scope / flags on the inbox card. The lead id is stored on `tz_leads.hcp_lead_id` for record-keeping. Inbox lead failure is non-fatal: the estimate is still the source of truth.
- [x] ~~Attribution + thank-you conversion firing.~~ Form redirect now passes `service`, `serviceKey`, `channel`, `value`, `leadId`, `ownership` to `/thank-you`. The page renders a `<ConversionTracker />` client component that fires three events on mount: (1) GTM `dataLayer.push({event:'lead_submitted', ...})` so any tag in the GTM container can trigger from this signal without a code change; (2) GA4 `generate_lead` (the recommended event for lead conversions; if GA4 ↔ Google Ads is linked and `generate_lead` is marked as a conversion in GA4, it imports automatically — no Google Ads conversion label needed in code); (3) Meta Pixel `Lead` standard event for Facebook + Instagram ad reporting. Optional direct Google Ads conversion fallback: set `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AW-16641031492/LABEL` if you want to fire alongside the GA4 import. Client tracking now captures every common click ID (gclid, gbraid, wbraid, fbclid, msclkid, ttclid, li_fat_id, lsa_id) plus document.referrer, with first-touch (90-day) and last-touch (30-day) cookie sets. Server-side `deriveChannel()` reduces the snapshot to a single label like `Google Ads`, `Meta Ads (Instagram)`, `Bing Organic`, `Direct`, `Referral - example.com`. Channel is persisted on `tz_leads.attribution_channel` (migration 004), tagged onto both the HCP estimate option and the Job Inbox lead (`Channel: Google Ads`), shown on the office email, and surfaced on the Lead Pipeline as a colored chip + filter + dedicated stat cards (Paid / Organic / Referral / Direct). Per-service lead value (`leadValueCents`) drives the conversion event's `value` so Smart Bidding has a meaningful target — Generator/HVAC/Panel $400, EV charger $250, Plumbing $200, Surge $100, default $250. Tune by editing `src/lib/attribution.ts` once we have a few months of HCP Won/Lost data.
- [x] ~~Existing customer match: phone OR email OR name.~~ Originally phone-only; Tyler called that too weak (returning customers can mistype name or use a new phone). `findExistingCustomer` now fires three lookups in parallel and dedupes; phone is preferred over email over name. **Two HCP quirks worth knowing:** (1) `?phone_number=` is silently ignored — HCP returns the same first 10 customers regardless of input, so we filter client-side by exact normalized phone match against `mobile_number`/`home_number`/`work_number`; (2) `?q=<query>` actually does match across email/name, but loosely, so we filter client-side for exact email or full-name match before accepting.
- [x] ~~Two-way Won/Lost status sync.~~ The office flips estimates Won/Lost in HCP via the option-level approval buttons. Lead Pipeline page reads the latest `work_status` + `option.approval_status` for any rows whose `estimate_status_synced_at` is older than 5 minutes (capped at 30 rows per page load, sequential). Manual "Refresh statuses" button bypasses the throttle. Won/Lost/Open filter is back, won leads get an emerald accent, lost leads dim, and a status badge surfaces on each row.
- [x] ~~Lead Pipeline read path switched to Neon.~~ `/switchboard/lead-pipeline` now reads from `tz_leads` instead of HCP `/leads`, so the Switchboard mirrors exactly what's in HCP without doubling up on data. Every row deep-links to the HCP estimate via `hcp_estimate_id`; rows with HCP sync errors show an explicit "HCP sync error" badge plus the failure reason and a manual-recreate hint. Filters: search + service. Won/Lost filter dropped (no `pipeline_status` from Neon yet — re-add once we sync HCP estimate status back). Recent Leads card on the Switchboard home swapped over too.
- [x] ~~Knowledge Base v1 (read-only).~~ Live at `/switchboard/knowledge-base`. Renders `docs/agent-training-answers.md` as a structured browseable view with sticky section nav, scroll-spy active state, and full markdown styling.
- [x] ~~Neon Postgres provisioned (`tz-db`) and attached to the project.~~ Marketplace integration on Vercel. `tz_leads` table created via `migrations/001_init.sql`. `npm run migrate` applies any new migrations.
- [ ] **Phase 3 (next): Knowledge Base v2 (edit-in-place).** Authenticated in-app editor for the answers doc. Two viable paths: commit changes back to `docs/agent-training-answers.md` via the GitHub API (cleaner: edits land in git history and trigger a redeploy) or back the editor with a `tz_kb_versions` table in Neon (faster: in-app version control, sync to git on demand). Recommendation: start DB-backed for speed, sync to git via a "publish" action. Closes "easy way to continuously edit the agents."
- [ ] **Phase 4: SMS Agent (Claire).** Scaffolding shipped end of session 14 — `tz_agent_conversations` + `tz_agent_messages` tables exist (migration 005), `/api/agents/sms/webhook` accepts Twilio inbound with signature verification + holding-pattern reply, `/switchboard/sms-conversations` is live with conversation list + transcript view + takeover toggle, `lib/agent-prompt.ts` composes the Claire system prompt from `docs/agent-training-answers.md`, `lib/agent-tools.ts` defines the AI SDK v6 tool surface (find_existing_customer, create_lead_with_estimate, lookup_business_hours, flag_for_office_review, escalate_emergency) with implementations wrapping the existing form/HCP pipeline. **What's left:** wiring the actual model call inside the webhook (10-line `generateText({...})` block — pseudocode is in the route's TODO comment), and the cutover env vars below.
- [ ] **Phase 5: Web chat agent (Claire).** Same prompt and tool surface as SMS, AI SDK streaming widget on every public page, proactive popup at 15s.
- [ ] **Phase 6: Voice agent (Claire).** Vapi assistant on a Twilio number, 15-minute max before forced handoff, runs the after-hours emergency dispatch SOP exactly.
- [ ] **Phase 7: Self-improving learning loop.** Office flags transcripts in the SMS / chat / voice modules. Flagged items queue in the Knowledge Base. Approved edits auto-merge into the answers doc. Performance dashboard with handoff rate, false-escalation count, satisfaction proxy.

## Account handoff plan (everything paid moves to Tyler)

The endgame: **Tyler owns every paid service under his own logins and his own card.** CQ Marketing keeps only the GitHub repo and the source code we author. All hosting, AI, telecom, and email costs hit Tyler's card directly. We stop being the middleman.

### Stays with CQ Marketing
- GitHub repo `cqdesignsny/tz-electric` (source of truth for the code)
- Ongoing development and maintenance work

### Moves to Tyler (TZ Electric)
| Service | What it does | Migration step |
|---|---|---|
| **Vercel team** | Hosts the site, deploys, owns the domain | Tyler creates a Vercel team, invites Cesar as member, we transfer `tz-electric` project from `cq-marketings-projects` to his team, reattach `tzelectricinc.com` (DNS doesn't change, same Vercel IP) |
| **Anthropic API** | Powers chat, SMS, voice agents | Tyler signs up at console.anthropic.com, adds his card, generates `ANTHROPIC_API_KEY`, we set it on his Vercel project |
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

## TZ Switchboard Reports module: roadmap

`/switchboard/reports` is a Coming-Soon module page today. The plan, in order of payoff, is to build it out into TZ's primary marketing + ops reporting surface. Inspiration: CQ Signal — every feed of report data lives under one admin module.

### Phase R1: Lead reports (data we have today, ~1-2 days)

Data source: `tz_leads` (Neon). Everything below is already persisted.

Sections:

- **Lead volume over time.** Daily / weekly / monthly counts. Stacked by `attribution_channel` (Google Ads, Meta, Direct, Organic, etc.).
- **Channel breakdown.** Pie / bar of total leads by channel for the selected period. Click through to a filtered Lead Pipeline view.
- **Service mix.** Counts per service key (HVAC, Generator, Electrical, etc.). Useful for capacity planning.
- **Funnel by channel.** Once Phase R2 lands, columns: Leads → Estimates Won → Lost → Open. For now: Leads → Estimates Created → HCP Sync Errors.
- **Self-reported vs derived source.** Side-by-side comparison of `referral_source` (what the customer answered "How did you hear about us?") vs `attribution_channel` (what the click ID / referrer says). Disagreements highlight customers misremembering, ad campaigns picking up organic credit, etc.
- **Lead value at risk.** Sum of `attribution_value_cents` for currently open estimates. Gives the office a "$$$ in the pipeline right now" number.

Implementation: server component reads tz_leads with a date range, renders charts via a small Recharts wrapper. No new dependencies if we use `recharts` (already common in Next.js apps). Filters: date range, channel, service.

### Phase R2: HCP Won/Lost integration (depends on Phase 4-ish status sync maturity)

We already sync `estimate_status` (open/won/lost) periodically. Reports gain:

- **Close rate by channel.** Won / (Won + Lost) per channel. Tells you which channels send buyers vs lookers.
- **Average time-to-won.** Days between lead created and estimate marked Won.
- **Won lead value.** Sum of estimate `total_amount` for won estimates (need to also sync `total_amount` from HCP into tz_leads — small extension to lead-status-sync).

### Phase R3: Ad cost integration → CPL, CPA, ROAS (~1 week)

External APIs to plug in:

- **Google Ads API.** Pulls campaign-level cost. Match to leads via `gclid`. Produces cost-per-lead and cost-per-Won by campaign / ad group.
- **Meta Marketing API.** Same idea, match via `fbclid` or campaign UTM. Produces FB / IG ad reporting.
- **Microsoft Advertising API** (later, if Bing budget is non-trivial).

Vercel-native fit: store API tokens as encrypted env vars, run a daily cron that pulls cost data into a new `tz_ad_spend` table (campaign_id, date, cost, impressions, clicks). Reports JOIN tz_leads to tz_ad_spend on campaign_id + date.

This is where the real ROAS reporting lives: "$X spent on Google Ads this month, Y leads, Z Won estimates worth $W booked revenue, ROAS = W ÷ X."

### Phase R4: AI agent reporting (lights up as agents ship)

Once SMS Claire / voice Claire / chat Claire are live, every conversation gets persisted to `tz_agent_conversations` + `tz_agent_messages` tables (Phase 4 of the buildout in `What's open right now`). Agent reporting then layers on top:

- **Conversation volume by channel** (SMS, voice, chat). Same channel attribution applied — if a Google Ads click led to a chat that booked a job, the Google Ads campaign gets credit.
- **Agent → human handoff rate.** How often Claire pulls in a human. Per skill, per service, per time of day.
- **Agent close rate.** Conversations that ended in a booked estimate / job, by channel.
- **Agent satisfaction proxy.** Customer sentiment from transcripts (Anthropic API summarization of the conversation).
- **First-response time.** SLA tracking for SMS / chat.
- **Cost per conversation.** Anthropic API spend ÷ conversation count, broken out by channel so we know which traffic source is profitable to staff with AI.

### Implementation notes for whoever builds this

- All reporting reads should be from Neon, not HCP, for speed. Sync HCP → Neon in the background (already doing this for estimate status).
- Date range component: standard, top-right of every report. Default last 30 days.
- Export: CSV download per report. Tyler's bookkeeper / accountant should be able to grab raw data.
- Permissions: shared password gates `/switchboard/reports` like every other module today. When we move to Clerk per-user auth, lock revenue reports to admin role only.

## What's NOT built (intentionally deferred)

- **Own-database lead storage (long-term path for Lead Pipeline).** Phase 2 of the agent buildout reads leads directly from HCP via `GET /leads`. That's the fast path: HCP is the source of truth, the office team works there, and the TZ Switchboard reflects whatever's there. The long-term path adds Neon Postgres via the Vercel Marketplace and persists every form submission (and every AI agent intake) to our own DB, with HCP as a downstream sync target. **Do not skip this work.** It's a hard prerequisite for Phase 7 (the self-improving learning loop), since the agents need durable transcript and outcome history, structured search across thousands of leads, and historical analytics that HCP can't surface. Backfill leads from HCP into the new DB at provisioning time. Trigger: when we start Phase 4 (SMS agent) and need conversation persistence anyway, or sooner if Tyler hits a query / filter / reporting need that HCP can't serve.
- **Multiple users / roles.** Single shared password. Move to Clerk when employees need their own logins for training.
- **Magic link login.** Single password is fine for v0. Upgrade later.
- **Real activity feeds on dashboard home.** The home page focuses on the open task ("Things to do") plus clickable Coming Soon and Planned cards. Stats placeholders were removed because they were just dashes. Wire actual data in once agents are live.
- **Theme cookie.** Theme persists in localStorage only. Server-rendered HTML always defaults to light, then the inline init script sets the right `data-theme` before hydrate. Acceptable. Future: cookie-based for true zero-flash SSR.
- **proxy.ts migration.** Next 16 prefers `proxy.ts` over `middleware.ts`. Backwards-compatible. Deferred until a focused session to validate the API.
- **Branch-preview env vars.** Vercel CLI bug around all-preview-branches; not worth the workaround since we don't use feature-branch previews.

## HCP /leads API: attaching to an existing customer

- **`customer_id` at the top level** on POST /leads: 201 Created, attaches to the existing customer cleanly. No duplicate customer.
- **Nested `customer.id`**: 400 Bad Request — wrong shape.
- **Sending a `customer` object** with phone matching an existing record creates a DUPLICATE customer rather than matching. Always prefer `customer_id`.
- **`tags`** (top-level array of strings) accepted; renders on the Job Inbox card preview.
- **`address`** accepted; helpful when the inbox card surfaces location.

We use this dual-write so the office sees new leads in HCP's "API Leads" Job Inbox channel for quick visibility while the estimate stays the source of truth for job details.

## HCP /estimates API: what we learned empirically (2026-04-28)

After three test submissions against the live HCP API:

- **`POST /estimates` REQUIRES `options: [...]`.** Returns `{"errors":{"options":"is missing"}}` without it. We pass a single placeholder option with `name` and (optionally) `tags`.
- **Top-level `private_notes`, `notes`, `tags`, `description` are silently dropped.** None are real fields on the estimate.
- **`options[i].tags`** is the correct place for triage tags. They render on the estimate row and persist.
- **`options[i].notes`** is silently dropped at create time. The actual insert path is a separate request: `POST /estimates/{estimate_id}/options/{option_id}/notes` with `{"content": "..."}` returns 201 and the note shows up on read. `createEstimateForLead` now does both calls in sequence and returns `{estimate, noteAttachError}` so the submit route records the estimate id even when the second call fails.
- **`options[i].message`** would be customer-facing (it overrides the default "message_from_pro" sent to customers). Never put internal qualification answers there.
- **`work_status`** at the estimate level is the lifecycle field (`"needs scheduling"` for fresh unscheduled). **`option.approval_status`** flips to `"approved"` / `"declined"` when the office uses HCP's Won/Lost buttons; that's what our status sync watches.

## HCP /customers API quirks

- **`?phone_number=...` is silently ignored.** HCP returns the same first 10 customers regardless of input. Filter client-side against `mobile_number`/`home_number`/`work_number`.
- **`?q=...` does match email/name** but loosely. Filter client-side for exact email or exact full-name match.
- **`POST /customers` works as documented** with `first_name`, `last_name`, `mobile_number`, `email`, `addresses` (with `type: "service"`).

## Files added or significantly changed in session 14 (Apr 28, evening)

```
migrations/002_add_hcp_estimate_links.sql                 NEW, adds hcp_customer_id,
                                                          hcp_estimate_id, hcp_customer_existing,
                                                          hcp_error columns + indexes on tz_leads
src/lib/leads-store.ts                                    MOD, adds attachHcpEstimate +
                                                          extends StoredLead / InsertLeadInput
src/lib/housecall-pro.ts                                  MOD, adds findCustomerByPhone,
                                                          createCustomerForLead,
                                                          createEstimateForLead. Old createLead
                                                          retained for reference.
src/app/api/leads/submit/route.ts                         REWRITE, find-or-create customer +
                                                          create unscheduled estimate flow,
                                                          private_notes built from labeled
                                                          qualification answers, tags include
                                                          existing-customer flag
src/components/forms/lead-form-config.ts                  REWRITE, adds every Typeform
                                                          question that had been missing per
                                                          service. Adds showWhen conditional
                                                          rendering, isQuestionVisible helper,
                                                          getQuestionLabel helper
src/components/forms/LeadForm.tsx                         MOD, filters questions by
                                                          isQuestionVisible, prunes stale
                                                          answers when a parent changes,
                                                          skips required-validation on hidden
                                                          questions
src/components/switchboard/lead-pipeline-utils.ts         REWRITE, summarizeStoredLead reads
                                                          from tz_leads (not HCP), builds
                                                          hcpDeepLink to /estimates/{id} or
                                                          /customers/{id}, renders qualification
                                                          via service-config labels
src/app/switchboard/(dashboard)/lead-pipeline/page.tsx    REWRITE, reads listStoredLeads()
                                                          instead of listLeads()
src/components/switchboard/LeadPipelineClient.tsx         REWRITE, drops won/lost filter
                                                          (no pipeline_status from Neon),
                                                          new HCP sync error banner inside
                                                          expanded detail, success-tone tag
                                                          for "Existing customer"
src/components/switchboard/RecentLeadsCard.tsx            MOD, listStoredLeads + new
                                                          summarizer + Existing customer chip
docs/agent-training-answers.md                            MOD, new "Canonical Lead Intake
                                                          Question Set" subsection in section 6
                                                          and new section 11 "Lead Routing into
                                                          Housecall Pro" so SMS/voice/chat
                                                          agents share the same flow
HANDOFF.md / README.md / MEMORY.md                        MOD, this update
```

## Files added or significantly changed in session 13 (Apr 28)

```
package.json                                              MOD, adds @neondatabase/serverless, marked,
                                                          dotenv (dev), and `npm run migrate` script
migrations/001_init.sql                                   NEW, initial schema: tz_leads + indexes,
                                                          plus _migrations tracking table on first run
scripts/migrate.mjs                                       NEW, idempotent migration runner over
                                                          migrations/*.sql using @neondatabase/serverless
                                                          Pool + dotenv from .env.local
src/lib/db.ts                                             NEW, Neon HTTP client (singleton)
src/lib/leads-store.ts                                    NEW, insertLead / listStoredLeads /
                                                          setLeadHidden / attachHcpLeadId
src/app/api/leads/submit/route.ts                         MOD, write-through: persists to tz_leads
                                                          before HCP, stitches HCP lead id back when
                                                          available, surfaces hcpError in the email
src/app/switchboard/(dashboard)/knowledge-base/page.tsx   REWRITE, server component reads
                                                          docs/agent-training-answers.md, parses
                                                          sections by ## heading, renders each via
                                                          marked into a styled .kb-prose container
src/components/switchboard/KnowledgeBaseNav.tsx           NEW, client component, sticky section nav
                                                          with IntersectionObserver scroll-spy
src/app/globals.css                                       MOD, adds .kb-prose styles for headings,
                                                          paragraphs, lists, blockquotes, code,
                                                          tables, hr, strikethrough, dark variants
src/components/switchboard/nav-config.ts                  MOD, Knowledge Base status: 'live'
src/components/switchboard/LeadPipelineClient.tsx         MOD, paginate at 15 per page, compact
                                                          page-number range, scroll-to-top on page
                                                          change, filter changes reset page to 1
src/lib/housecall-pro.ts                                  MOD (earlier in session), uses verified
                                                          /leads payload shape (customer.first_name,
                                                          customer.mobile_number, customer.notes,
                                                          tags) — see commit 8e47054
HANDOFF.md / README.md / MEMORY.md                        MOD, this update
```

## Files added or significantly changed in session 12 (Apr 27)

```
docs/agent-training-answers.md                            NEW, canonical agent knowledge base (Tyler's
                                                          questionnaire answers + follow-up gap answers,
                                                          structured for direct injection into agent
                                                          system prompts)
HANDOFF.md                                                MOD, this file — questionnaire status, blockers,
                                                          Dropbox path correction, session 12 entry
README.md                                                 MOD, references the new agent training answers
                                                          doc + Claire persona
MEMORY.md                                                 MOD, Delaware county, Claire persona, session 12
                                                          entry, key files updated
```

Non-repo housekeeping that happened the same session (not part of any commit):

- `tz-site/.env.local` synced from Dropbox → SSD (was missing on SSD, blocks `npm run dev`).
- `tz-site/.vercel/project.json` on Dropbox replaced with the canonical SSD copy (Dropbox had a stale link to an old `tz-site` Vercel project; canonical is `tz-electric` / `prj_wtBcaXPS6KOeXJniJroHRYnxiDtm`).
- Parent-level docs (`README.md`, `STRATEGY.md`, `webflow-data.md`, `skills-lock.json`), Resend skill bundles, and parent dev-tool settings copied from Dropbox → SSD parent.
- SSD `.git/hooks/post-commit` `PEER=` path fixed from `/Users/cqmarketing/...` to `/Users/cqstudio/Library/CloudStorage/Dropbox/...` so SSD-to-Dropbox auto-sync actually runs on the main rig.

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
git -C "/Users/cqstudio/Library/CloudStorage/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD  # main rig
# git -C "/Users/cqmarketing/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site" rev-parse HEAD  # laptop
git ls-remote https://github.com/cqdesignsny/tz-electric.git refs/heads/main

# Vercel env management (project linked at SSD only)
vercel env ls
vercel env add NAME production --value 'value' --yes
vercel env rm NAME production --yes

# Trigger redeploy (also happens on every push)
vercel redeploy <last-prod-url>
```

## What Cesar wants next

1. ✓ Tyler completes the questionnaire and we get the answers (done 2026-04-26)
2. **Native lead form to replace Typeform** (active priority, with GCLID tracking and HCP integration)
3. Wire `/switchboard/knowledge-base` to render `docs/agent-training-answers.md` so Tyler can review and refine answers in-app
4. Get answers on the 5 remaining blockers in section 10 of `docs/agent-training-answers.md`
5. Scaffold the AI agents in order: SMS first (Claire, 24/7), web chat next (proactive popup at 15s, all pages), Vapi voice last (15-min max before handoff)
6. Wire each "coming soon" module as it ships
7. When everything works, run the Tyler migration day (Vercel team transfer + remaining account provisioning)

The TZ Switchboard becomes Tyler's permanent operational backend. Every future agent (email assistant, office ops, warehouse, sales, marketing) ships as a new module in this same dashboard. The voice persona for all customer-facing agents is **Claire** (per the answers doc).
