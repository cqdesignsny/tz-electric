# TZ Switchboard Handoff

This is the rolling handoff doc. Last verified state, what's done, what's next, what's deferred. If anything below conflicts with code, trust the code. Keep this updated after every working session.

**Last verified:** 2026-04-25 — all three locations synced at `43616fe`.

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

- `tz-site/README.md` — public-facing project overview
- `tz-site/MEMORY.md` — Claude memory snapshot for session continuity
- `tz-site/HANDOFF.md` — this file
- `tz-site/STRATEGY.md` (if present) — strategy & design rationale

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

The TZ Switchboard is live at `tzelectricinc.com/switchboard` behind an admin login. The agent training questionnaire is built and submits to cesar@creativequalitymarketing.com via Resend. The site is deployed on Vercel (autodeploy on push to main).

### What's built

- **Site URL:** https://tzelectricinc.com
- **TZ Switchboard URL:** https://tzelectricinc.com/switchboard (gated)
- **Login URL:** https://tzelectricinc.com/switchboard/login
- **Questionnaire URL:** https://tzelectricinc.com/switchboard/agent-training
- **Old `/agent-training`:** redirects to `/switchboard/agent-training`
- **Footer link on public site:** "Admin" link in the bottom bar of every page

### Architecture summary

- Native auth: shared password + HttpOnly cookie, HMAC-signed (SHA-256), 30-day TTL
- Middleware (`src/middleware.ts`) gates `/switchboard/*` except `/switchboard/login`
- Dashboard shell with sidebar (left) + topbar (top, white logo on navy)
- Sidebar nav driven by `src/components/switchboard/nav-config.ts`
- Resend used for outbound submission email; default `onboarding@resend.dev` sender (only sends to the account email until a domain is verified)

### Working today

- [x] TZ Switchboard layout, sidebar, topbar
- [x] Dashboard home with stats placeholders + active/soon/planned modules
- [x] Login flow (login form, set cookie, middleware redirect, logout button in sidebar)
- [x] Agent training questionnaire (~70 questions, autosave, submit via Resend)
- [x] Submit API route at `/api/agent-training/submit` (auth-gated, emails markdown)
- [x] Public footer "Admin" link

## What you need to do next (in order)

### 1. Set Vercel environment variables

The site deploys but the TZ Switchboard will not work until these are set on Vercel:

| Name | Value | Where to get it |
|---|---|---|
| `SWITCHBOARD_PASSWORD` | Pick a memorable phrase (15+ chars) | You decide. Save in 1Password |
| `SWITCHBOARD_SESSION_SECRET` | Random ≥16-char string | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend API key | resend.com → API Keys (use cesar@creativequalitymarketing.com to sign up) |

**To set:** Vercel project → Settings → Environment Variables → add each → Production + Preview + Development → Save → Redeploy (or push any commit).

### 2. Smoke test it yourself

1. Open `tzelectricinc.com/switchboard`
2. Get redirected to `/switchboard/login`
3. Enter the password you set in `SWITCHBOARD_PASSWORD`
4. Land on the dashboard home
5. Click Agent Training → fill out a few questions → Submit
6. Check inbox at cesar@creativequalitymarketing.com — email should arrive in seconds
7. Click Sign out in sidebar → confirms cookie cleared

### 3. Send Tyler and Terry the link

> "The TZ Switchboard is live. This is your internal control center for everything we're building. First task: fill out the agent training questionnaire. Save your password somewhere safe. Link: https://tzelectricinc.com/switchboard — password: [the one you set]"

### 4. Once they reply with answers

- Build the AI agent knowledge base from their submission
- Provision Tyler's accounts (Vercel team, Anthropic API, Twilio, Vapi)
- Migrate the site to Tyler's Vercel team
- Build native lead form (replaces Typeform)
- Scaffold SMS, web chat, Vapi tool endpoints

## Account handoff plan (everything paid moves to Tyler)

The endgame: **Tyler owns every paid service under his own logins and his own card.** CQ Marketing keeps only the GitHub repo and the source code we author. All hosting, AI, telecom, and email costs hit Tyler's card directly. We stop being the middleman.

### Stays with CQ Marketing
- GitHub repo `cqdesignsny/tz-electric` (source of truth for the code)
- Ongoing development and maintenance work

### Moves to Tyler (TZ Electric)
| Service | What it does | Migration step |
|---|---|---|
| **Vercel team** | Hosts the site, deploys, owns the domain | Tyler creates a Vercel team → invites Cesar as member → we transfer `tz-electric` project from `cq-marketings-projects` to his team → reattach `tzelectricinc.com` (DNS doesn't need to change — same Vercel IP) |
| **Anthropic API** | Claude API powering chat, SMS, voice agents | Tyler signs up at console.anthropic.com → adds his card → generates `ANTHROPIC_API_KEY` → we set it on his Vercel project |
| **Twilio** | Phone number + SMS messaging for AI SMS agent | Tyler signs up at twilio.com → buys a local NY number → completes A2P 10DLC business registration → we set Twilio env vars on his Vercel |
| **Vapi** | Voice agent (handles inbound calls, books jobs) | Tyler signs up at vapi.ai → connects his Twilio number → assistant configured against our `/api/vapi/*` tool endpoints |
| **Resend** | Outbound email (TZ Switchboard submits, lead alerts) | **Live as of 2026-04-25.** Account created under `tzelectricoffice@gmail.com`. Domain `tzelectricinc.com` verified (SPF + DKIM via Cloudflare DNS). API key set on Vercel as `RESEND_API_KEY`. Sender: `notifications@tzelectricinc.com`, reply-to: `service@tzelectricinc.com`. Already on TZ's side, no migration needed at handoff. |
| **Stripe** | Plan signup payments | Already on TZ's account — no migration needed |
| **Housecall Pro** | CRM, scheduling, customer tagging | Already on TZ's account — no migration needed |

### Order of operations
1. **Now → migration day:** finish building TZ Switchboard modules + AI agents under our Vercel/Resend/Anthropic accounts. Tyler fills out the questionnaire; we build the agent knowledge base.
2. **Migration day (single focused session):** Tyler provisions every account above. We do the cutover in one sitting — transfer Vercel project, swap each env var to his keys, redeploy, smoke test login + lead form + agents.
3. **After migration:** Tyler's card pays all infra directly. We keep shipping code from the GitHub repo and Vercel autodeploys to his team.

## What's NOT built (intentionally deferred)

- **Multiple users / roles.** Single shared password. Move to Clerk when employees need their own logins for training, etc.
- **Magic link login.** Single password is fine for v0. Upgrade later.
- **Real activity feeds on dashboard home.** All stats are `—` placeholders. Wire up when actual data exists.
- **Verified email domain.** Using `onboarding@resend.dev` so Resend free tier only delivers to the signup email (cesar@creativequalitymarketing.com). Fine for now since that's the only recipient. Verify a custom domain when sending to other recipients.
- **proxy.ts migration.** Next 16 prefers `proxy.ts` over `middleware.ts`. Backwards-compatible. Deferred until a focused session to validate the API.

## Files touched in the TZ Switchboard session (Apr 24)

```
src/middleware.ts                                          NEW — auth gate for /switchboard/*
src/lib/switchboard-auth.ts                                NEW — HMAC session signing
src/app/api/switchboard/auth/login/route.ts                NEW — POST password, set cookie
src/app/api/switchboard/auth/logout/route.ts               NEW — clear cookie
src/app/api/agent-training/submit/route.ts                 MOD — added auth check
src/app/switchboard/layout.tsx                             MOD — bare wrapper + metadata
src/app/switchboard/login/page.tsx                         NEW — Suspense + LoginForm
src/app/switchboard/login/LoginForm.tsx                    NEW — login UI
src/app/switchboard/(dashboard)/layout.tsx                 NEW — DashboardShell wrapper
src/app/switchboard/(dashboard)/page.tsx                   MOD — overview + stats + modules
src/app/switchboard/(dashboard)/agent-training/*           MOVED + softened header
src/components/switchboard/Sidebar.tsx                     NEW
src/components/switchboard/TopBar.tsx                      NEW
src/components/switchboard/DashboardShell.tsx              NEW
src/components/switchboard/nav-config.ts                   NEW
src/components/layout/Footer.tsx                           MOD — "Admin" link in bottom bar
next.config.ts                                             MOD — /agent-training redirect
README.md                                                  MOD — switchboard section
```

## Known issues / open threads

- `/agent-training/submit` endpoint requires login session. If Tyler tries to submit while logged out (cookie expired), he'll get 401. We should handle this in the form gracefully (redirect to login + preserve answers from localStorage). For now, 30-day cookie TTL means this is rare.
- Sidebar logout button uses `window.location.href` for redirect (not `router.replace`) to ensure the auth cookie clear is fully respected. Works, but is a small UX hop.
- StatusBadge component exists in two places (page + sidebar). Could consolidate.

## Quick command reference

```bash
# Local dev (SSD only — Turbopack chokes inside Dropbox)
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
```

## What the user (Cesar) wants next

After tomorrow's smoke test and sending Tyler the link:

1. Get Tyler's questionnaire back
2. Migrate site to Tyler's Vercel team (he pays direct from now on)
3. Build native lead forms (replaces Typeform, hits HCP)
4. Scaffold the AI agents: SMS, web chat, Vapi tool endpoints
5. Wire up the "coming soon" TZ Switchboard modules as they come online

The TZ Switchboard becomes Tyler's permanent operational backend. Every future agent (email assistant, office ops, warehouse, sales, marketing) ships as a new module in this same dashboard.
