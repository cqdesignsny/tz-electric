# TZ Switchboard Handoff

This is the rolling handoff doc. Last verified state, what's done, what's next, what's deferred. If anything below conflicts with code, trust the code. Keep this updated after every working session.

**Last verified:** 2026-05-18, end of session 20. **Pre-launch Claire fixes + after-hours dispatch foundation shipped.** Tyler's testing batch from 2026-05-13/14 landed plus a fresh round from 2026-05-18: (1) Voice Claire stops reading numbers digit-by-digit (BTUs, dollar amounts, ranges spoken naturally; phone numbers and emails stay digit-spelled). (2) Mini-split single-zone install range corrected to $5,500–$9,000 (was hallucinating $3,500). (3) Small-repair pricing now discloses the diagnostic / Field Assessment fee + parts on top, never a flat number alone. (4) New "Same-Day Priority Dispatch ($275)" branch for non-emergency urgent jobs during business hours. (5) Business hours canonicalized to **7:30 AM – 4:00 PM** per Tyler's new after-hours SOP doc — `lookupBusinessHoursImpl` rewritten with minute-resolution + after-hours-window classifier (overnight vs standard). (6) Hiring-inquiry handler added — Claire redirects to `/careers` and never books a hiring inquiry as a service lead. (7) Overhead/underground intake simplified — second question always shown with "no preference" option, prompt rule says accept "I don't know" without drilling. (8) After-hours emergency dispatch built end-to-end: migration `010_add_after_hours_dispatch.sql` with `tz_on_call_schedule` + `tz_emergency_dispatches` + `tz_dispatch_attempts`; `src/lib/twilio-outbound.ts` for SMS + voice via Twilio REST; `src/lib/on-call.ts` lookup helper; `src/lib/after-hours-dispatch.ts` with the new `dispatch_after_hours_emergency` Claire tool plus the cascade worker `runEscalationTick()`; `/api/cron/dispatch-escalation` every 5 minutes in `vercel.json`; seed script `scripts/seed-on-call-schedule.mjs` that parses the KB calendar (section 3) into the schedule table. Tech rotation, supervisor chain (Ty / Sam / Tyler), and HVAC + plumbing emergency contacts all pull from the existing KB. **Strategic shift locked:** Claire is being expanded from "booking agent" to "TZ AI" — one brain, multiple surfaces (customer-facing, admin chat, office-staff chat, tech SMS, training mode), role-gated tool registry, MCP wrapper deferred until after the in-app surfaces stabilize. See new "Claire as TZ AI (architecture direction)" section below. All three locations (GitHub / SSD / Dropbox) synced. Run the sanity check at the bottom of this doc to confirm before you start.

## Picking up on a different machine

The project is portable across machines because the auto-sync + Google sign-in flow doesn't tie work to a specific laptop. To resume:

1. **Pull the latest from GitHub** (canonical) onto whatever machine you're working from.
   ```bash
   git -C "/Path/To/tz-site" pull
   # or fresh clone
   git clone https://github.com/cqdesignsny/tz-electric.git
   ```
2. **Local dev only — install + pull env vars.** Skip if you're just reviewing.
   ```bash
   cd tz-site
   npm install --cache /tmp/npm-cache-tz   # or just `npm install` if your cache is healthy
   vercel link                              # pick TZ Electric team → tz-electric project
   vercel env pull .env.local --yes         # writes the dev-tier secrets locally
   ```
3. **Sign in to the live Switchboard** at https://tzelectricinc.com/switchboard/login with your Google account (`tyler@tzelectricinc.com`, `terry@tzelectricinc.com`, or `cesar@creativequalitymarketing.com` — all owners). The site is live and serves from Tyler's Vercel infrastructure regardless of which machine you came from.
4. **Per-machine SSD/Dropbox sync paths** — the SSD at `/Volumes/CQ-PRO-4TB/CQ Marketing/...` and Dropbox at `~/.../Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site` only matter when you're working on the desktop with the SSD plugged in. On a laptop, just use a regular clone of the GitHub repo. The post-commit hook is what keeps SSD ↔ Dropbox in sync; if you commit from a clone-only setup, GitHub gets the push and the next time the SSD or Dropbox copies pull, they catch up.

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
- **Voice Claire:** dial **+15186786153** (Hudson Valley Twilio number on Tyler's account, voice via Vapi BYON, Claude Haiku 4.5 + 11labs Eryn voice, full TZ knowledge base injected per call via dynamic server-URL pattern, all six lead-booking tools wired)
- **Web Chat Claire:** https://tzelectricinc.com/claire (full-page immersive chat, smart assistant persona, books leads into HCP via the same backend as the website form)
- **Lead form:** https://tzelectricinc.com/quote (3-step form, multi-channel attribution, HCP routing)
- **Stay Cool billboard landing:** https://tzelectricinc.com/stay-cool (single-page promo for the summer mini-split billboard; QR code target with UTM params for `summer-2026-minisplit` campaign tracking; `noindex` so it doesn't compete with `/mitsubishi` for organic search). See "Stay Cool billboard landing" section below.
- **HVAC Maintenance landing:** https://tzelectricinc.com/hvac-maintenance (modular per-component maintenance pricing from Tyler's 2026-05-07 doc; per-component pricing matrix, common-system pricing matrix, FAQs, deep-clean policy; sends bookings to `/quote?service=hvac&promo=maintenance`).
- **TZ Switchboard:** https://tzelectricinc.com/switchboard (Google OAuth, role-gated)
- **Call Logs module:** https://tzelectricinc.com/switchboard/call-logs (live viewer for every inbound voice call: status filter pills, inline audio player with the Vapi recording URL, two-sided transcript with collapsible tool-call rows, Vapi call-id debug pill, deep link to captured lead in Lead Pipeline)
- **Reports module:** https://tzelectricinc.com/switchboard/reports (live dashboard: lead volume by day stacked by channel, channel breakdown with pipeline value, service mix, Claire conversation health, "Conversations to review" with reason badges for flagged/escalated/no-contact cases). CSV export per period. **Daily digest email at 8 AM ET** to Tyler/Terry/Cesar via Vercel Cron + Resend, skips on zero-activity days.
- **Web Chat module:** https://tzelectricinc.com/switchboard/web-chat (live thread viewer, attribution, takeover, lead deep-link)
- **Login:** https://tzelectricinc.com/switchboard/login
- **Auth:** Google OAuth via NextAuth (domain-restricted to `tzelectricinc.com` + `creativequalitymarketing.com`). Legacy shared password (`Itsgonnabegreat26!`, stored in Vercel env as `SWITCHBOARD_PASSWORD`) kept as transition fallback.
- **Questionnaire:** https://tzelectricinc.com/switchboard/agent-training (auth-gated). Tyler submitted 2026-04-26.
- **Module info pages:** every Coming Soon and Planned sidebar item is clickable and shows what we'll build there.
- **Old `/agent-training`:** redirects to `/switchboard/agent-training`.
- **Public footer link:** discreet "Admin" link in the bottom bar of every page.

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

### Web Chat Claire (LIVE as of 2026-05-01)

Full-page immersive chat at https://tzelectricinc.com/claire. Replaces the old Podium widget. Same persona (Claire, smart assistant) and same lead-routing pipeline as the website form, exposed to anyone landing on `/claire`.

**End-to-end flow:**

1. Visitor lands on `/claire`. Empty state shows Claire's portrait, the centered theme toggle, the greeting "Hi, I'm Claire. I'm a smart assistant for TZ Electric. Ask me anything about your project. Cooling, heating, electrical, plumbing, generators, EV chargers. How can I help you today?", a row of suggestion chips, and the composer.
2. Visitor sends a message. Client generates a UUID v4, stashes in sessionStorage, and POSTs to `/api/agents/web-chat/stream` with `{ messages, conversationId, attribution }`. The conversation row is upserted into `tz_agent_conversations` (channel=`web_chat`) on first request, capturing first-touch attribution (gclid, fbclid, utm_*, referrer, landing URL).
3. Server builds the system prompt via `buildSystemPrompt({ channel: 'web_chat' })` (KB + persona + voice rules + security rules + mission + channel framing) and the tool surface via `buildAgentTools({ conversationId, channel: 'web_chat' })`.
4. Streams via `streamText` through Vercel AI Gateway (model `anthropic/claude-sonnet-4.6`). System prompt cached via Anthropic ephemeral cache (~90% input cost reduction on cache hits).
5. Claire follows the helpful-first flow: answer the question using KB ranges, ask for first name + best phone naturally within 2-3 turns, qualify with the per-service questions from KB section 6, offer a free estimate, and call `create_lead_with_estimate` to land the lead.
6. Office sees everything live in the TZ Switchboard Web Chat module (see "TZ Switchboard Web Chat" below).

**Tools Claire has access to (`src/lib/agent-tools.ts`):**

- `update_visitor_contact` — saves visitor's name + phone + optional email to the conversation row. Called as soon as the visitor shares contact info. Office sees them in the Switchboard immediately.
- `find_existing_customer` — HCP customer lookup by phone, email, or full name. Called before `create_lead_with_estimate` to avoid duplicates.
- `create_lead_with_estimate` — **the booking step**. Same backend as `/api/leads/submit` (the website form). Persists to `tz_leads`, finds-or-creates HCP customer, creates unscheduled estimate with all qualification answers in office-internal notes, drops Job Inbox card, mirrors to TZ Switchboard Lead Pipeline, stitches `tz_lead_id` back to the conversation.
- `lookup_business_hours` — checks if office is open right now, returns Saturday/Sunday context.
- `flag_for_office_review` — marks the conversation for office attention (ambiguous cases, complaints, suspected non-customers, customer asks for human).
- `escalate_emergency` — pages Tyler + on-call team (active leak, no heat below 32, smoke / sparks / burning smell, electrical hazard, gas smell, sewage backup, medical equipment dependency loss).

**System prompt structure (`src/lib/agent-prompt.ts`):**

- Persona ("You are Claire, smart assistant, never use 'AI' or 'AI assistant'").
- Mission block ("Be a helpful expert first, lead-capture machine second" + 6-step end-to-end flow, ending in `create_lead_with_estimate`).
- Channel framing (`## You are on the WEB CHAT channel`, with conversation flow specific to web chat).
- KB content (loaded from `docs/agent-training-answers.md` + per-section overrides from `tz_kb_overrides`).
- Tool use reminders (mention `update_visitor_contact`, never call `create_lead_with_estimate` without contact captured).
- Voice & Style rules (no em dashes, no emojis, no AI filler, no inflation, friendly contractions, varied sentence length).
- Security & Abuse Resistance (stay in role, refuse prompt injection, never reveal sensitive data, detect spam/solicitors/bots).

**Server-side guardrails (`src/app/api/agents/web-chat/stream/route.ts`):**

- `MAX_USER_MESSAGE_CHARS = 2000` — single message size cap, 413 + friendly error.
- `MAX_USER_MESSAGES_PER_CONVERSATION = 50` — DB-backed count, 429 + "use Start Over or call us" message when hit.
- `MAX_OUTPUT_TOKENS = 1200` — caps any single Claire reply.
- `MAX_TOOL_STEPS = 8` — caps the tool-use loop.
- AI Gateway per-user attribution via `providerOptions.gateway.user = sha256(visitorIP).slice(0,24)` and `tags = ['feature:claire-web-chat', 'env:<vercel-env>']`. Configure RPM / tokens-per-day / concurrent ceilings in the Vercel dashboard (suggested 20 RPM / 50K tokens-per-day / 3 concurrent per user).
- Anthropic prompt caching via `system: { role: 'system', content: systemPrompt, providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } }`. ~90% input cost reduction on cache hits within 5-minute TTL.

**TZ Switchboard Web Chat (`src/app/switchboard/(dashboard)/web-chat/page.tsx`):**

- Lives at `/switchboard/web-chat`. Gated by `requireModuleAccess('web-chat')`.
- Loads `web_chat`-channel conversations from `tz_agent_conversations` + their messages from `tz_agent_messages`.
- Left rail: thread list with visitor label (name once Claire captures it, otherwise short id stub), captured phone or attribution-channel fallback, "Lead captured" badge, "Office responding" badge during takeover, "Escalated" badge for flagged threads.
- Right pane: header with visitor + status + takeover/release/close buttons; first-touch attribution strip (channel, UTM, gclid, referrer, landing URL, lead deep-link to `/switchboard/lead-pipeline`); message timeline with collapsible tool-call rows showing JSON arguments + results; token usage per assistant message.
- Office reply composer at the bottom (only enabled during takeover). Saves to transcript; customer-side delivery on the live `/claire` widget is a small follow-up (needs SSE / polling on the client).
- Actions API at `/api/agents/web-chat/conversations` — supports `takeover` / `release` / `close` / `office_reply`.

**UI on `/claire`:**

- Public site Header at the top so visitors can navigate to other pages. No Footer / "Ready to Get Started?" CTA strip / FloatingCTA — those compete with the chat for attention.
- Composer is `position: fixed; bottom: 0` so iOS keeps it above the on-screen keyboard. Page scrolls behind it; pb-40 / sm:pb-44 keeps the last message readable.
- Smart auto-scroll: keeps the latest message visible by default, but if the visitor scrolls up to read older history, it doesn't yank them back. Detects user scroll direction (negative dy = scrolled up) vs programmatic scroll (always positive dy).
- Light/Dark labeled segmented toggle (`[ ☀ Light | ☾ Dark ]`). Storage key `tz-claire-theme` separate from the TZ Switchboard theme so it doesn't leak.
- Start Over button next to the toggle in thread view. Mints a fresh UUID, clears messages, returns to empty state. Old thread stays in the DB.
- Claire's portrait (`public/images/agents/claire-profile.png`, 1254x1254) shows in the empty-state hero and next to every Claire message in the thread (small avatar). Photo zoom: `scale-[1.4] origin-top` so her face fills the round crop instead of leaving headspace.
- User bubble: navy in light mode, blue-dark in dark mode, white text. Claire bubble: gray-200 in light mode, white/10 in dark mode, dark text. iMessage-style with the corner notch flipped to the sender's side.
- Mobile: `font-size: max(16px, 1em)` on every input/textarea/select via globals.css so iOS Safari doesn't auto-zoom on input focus. Body has `overflow-x-clip` so no element can ever push past the viewport width.

**Brand / voice rules baked into the system prompt:**

- Free estimates are the default for any pricing question. Field Assessment is a narrow paid case (trenching to detached structures, whole-home rewires on unknown panels, in-ground pools, customers who don't know their own service size). Tyler caught Claire quoting the $169 fee on 2026-04-30; the new Estimates Policy section in KB section 1 + a hard rule in the system prompt prevent her from drifting back.
- Identifies as "smart assistant", never "AI assistant". Customer-facing only; internal HCP tag stays as `TZ AI AGENT`.
- No em dashes (use commas, periods, parens). No en dashes for pauses (only allowed in published number ranges). No emojis. No AI filler ("Great question", "I'd be happy to", "Here's the thing"). No significance inflation ("pivotal", "groundbreaking", "robust", "transformative"). No tier-1 AI vocab ("delve", "leverage", "harness", "navigate"-metaphorical, "realm", "embark"). Friendly contractions, short sentences, direct answers.

**Cost reality (Anthropic Sonnet 4.6 via Gateway, with prompt caching enabled):**

- Quiet month, ~10 chats/day: $30-50.
- Normal month, ~25 chats/day: $75-150.
- Busy month, ~50 chats/day: $200-400.
- Plus $5 free Gateway credits per team per month.
- Caching cuts repeat-input cost ~90% within 5-min TTL, so realistic bills land near the lower end of the ranges.

**Two dashboard toggles still pending (Cesar can flip whenever, no code change):**

1. Vercel team → AI Gateway → **Rate Limits**. The route already passes `user` + `tags` so per-visitor ceilings work the moment a value is set. Suggested 20 RPM / 50K tokens-per-day / 3 concurrent per user.
2. Vercel team → AI Gateway → **Budget Alerts**. Set a monthly cap (suggested $100 alert / $500 hard limit) so a real attack triggers a warning + degradation instead of a surprise bill.

**Known follow-ups:**

- Customer-side delivery of office takeover replies on the live `/claire` widget. Currently office reply persists to the transcript only; needs SSE / WebSocket / polling on the client to push the office's message into the visitor's open chat. Same gap exists for SMS Claire (waits on Twilio Messages API push).
- Auto-refresh of the conversations list in the Switchboard. Today the office reloads or clicks a thread to see new activity.
- The form-data identifier `'Yes — active leak'` flows through 5 callsites in the lead pipeline. Renaming requires touching all 5 atomically. Customer impact is the form radio button label only; the system-prompt rule keeps Claire from echoing the em dash regardless. Mark as future cleanup.
- Vercel BotID `@vercel/botid` package integration if dashboard toggle isn't enough abuse protection.
- Friendlier limit-reached UX on the client (currently the 429 surfaces as the generic "Something went wrong" UI; the friendly `message` field in the JSON body is ignored by useChat).

### Voice Claire (Vapi) — LIVE as of 2026-05-13

**Tyler's first real test calls landed and were successful.** Dial **+15186786153** to reach Claire. Persona, knowledge base, tools, and Resend notifications match the web-chat experience. Full transcript + recording playback in the Switchboard within ~30 seconds of hangup.

| Item | Status | Notes |
|---|---|---|
| Vapi workspace | live (`tzelectricoffice@gmail.com`) | Private API key in `VAPI_PRIVATE_KEY` on Vercel + `.env.local`. Used by MCP server, CLI, and any future outbound calls |
| Vapi Assistant "Claire" | configured + published | id `6aa271db-9bec-446a-9f47-9949b5020d5a`. Voice 11labs Eryn (`DXFkLCBUTmvXpp2QwZjA`), model Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), transcriber Deepgram nova-3, `backgroundSound: "off"` (was "office" by default — Tyler heard call-center ambience on first calls, dimmed via PATCH). Server URL + secret set on both the assistant AND the phone number so inbound calls fire `assistant-request` to our backend. Fallback system prompt is a TZ-flavored degraded-mode script ("technical issue, leave name and callback number") in case our server URL ever 5xxs |
| Twilio account | live (Tyler's own, `tyler@tzelectricinc.com`) | **The original "TZ Electric" account from 2026-05-08 (under tzelectricoffice@gmail.com) is now orphaned** — Tyler created his own account, verified, paid out of pocket. Credentials of record: Account SID + Auth Token wired on Vercel (Auth Token sensitive). Live values readable via `vercel env pull .env.local --yes`. No API Key/Secret created yet — Auth Token is sufficient for Vapi BYON and our SMS webhook verification |
| Twilio phone number | live | `+15186786153` (Hudson Valley 518). Voice URL → `api.vapi.ai/twilio/inbound_call` (set by Vapi during BYON). Messaging URL → `tzelectricinc.com/api/agents/sms/webhook` (dormant until A2P 10DLC clears). Status callback → Vapi. Phone number id: `c6ab9b17-69b6-461c-a907-c7260429b8fc` |
| A2P 10DLC registration | not yet started | Required for SMS, NOT for voice. Voice already works. Tyler kicks this off in his Twilio console; 1-2 week carrier review. When clear: SMS Claire goes live with the existing webhook (we still need to swap the TODO in `src/app/api/agents/sms/webhook/route.ts` for a real `generateText` call) |
| `/api/agents/voice/server` route | shipped (commit `03b2c41`, transcript fix `478bea4`) | Single dispatch endpoint switching on `message.type`. Handles `assistant-request` (returns full assistant config inline with dynamic KB), `tool-calls` (executes via shared `buildAgentTools()` adapter), `end-of-call-report` (persists transcript + recording URL), `status-update` (logs). Auth via `VAPI_SERVER_URL_SECRET` checked as either `Authorization: Bearer` or `X-Vapi-Secret` header, constant-time compared |
| `/switchboard/call-logs` viewer | shipped (commit `03b2c41`) | Cloned the web-chat viewer pattern. Two-pane layout, status filter, inline audio playback, expandable tool-call rows, Vapi call-id debug pill, lead deep-link. Read-only — voice takeover via text-reply isn't a thing; a future Phase could add "click to dial" so the office picks up the customer from the Switchboard |

### Voice Claire architecture (how the pieces fit)

End-to-end path for an inbound call to `+15186786153`:

1. **Twilio** receives the inbound voice call. Voice URL forwards to `api.vapi.ai/twilio/inbound_call` (configured during BYON import).
2. **Vapi** picks up. The phone number has no static `assistantId`, so Vapi POSTs `assistant-request` to our Server URL (`https://tzelectricinc.com/api/agents/voice/server`) with the call id + caller phone number.
3. **Our route** (`handleAssistantRequest`) verifies the Bearer secret, creates a `tz_agent_conversations` row keyed by `external_call_id`, builds the system prompt via `buildSystemPrompt({channel: 'voice'})` (66-70k chars: full KB + persona + voice channel framing + security rules), translates `buildAgentTools(ctx)` into Vapi's function format via `buildVapiFunctionDefinitions`, returns the full inline `assistant` config.
4. **Vapi** initializes the call with that config and plays the opener ("Hi, thanks for calling TZ Electric...") in Eryn's voice.
5. Customer talks → Claire qualifies → Claire decides to run a tool → **Vapi** POSTs `tool-calls` to the same Server URL → our `handleToolCalls` looks up the conversation, persists `tool_use` + `tool_result` message rows, executes via the shared tool surface (HCP customer match, lead insert, estimate creation, office email via Resend), returns `{ results: [...] }` to Vapi → Claire speaks the next turn.
6. Customer hangs up → **Vapi** POSTs `end-of-call-report` with the full transcript artifact + recording URL → our `handleEndOfCallReport` normalizes roles (Vapi uses `bot` for Claire; we map to `assistant`), bulk-inserts the user + assistant turns keyed by `external_id = "<callId>:<time>"` for idempotency, closes the conversation with the recording URL stashed in `closed_reason`.
7. Office sees the call at `/switchboard/call-logs` with playback + transcript + tool-call audit trail.

### Tools wired into Voice Claire

Exactly the same six tool surface as web chat (literal code reuse via `buildAgentTools(ctx)` with `channel: 'voice'`):

- `update_visitor_contact` — saves first name + phone to the conversation. On voice, the carrier already provided the phone via caller ID; this tool just adds the name.
- `find_existing_customer` — HCP lookup by phone/email/name before booking, to avoid duplicates.
- `create_lead_with_estimate` — the booking call. Same dual-record flow as web chat: tz_leads insert + HCP customer find-or-create + unscheduled estimate with `lead_source: "CSR AI"` + `/leads` POST for inbox notification + Resend email to Tyler/Terry/service@/cesar@.
- `lookup_business_hours` — check if office is open right now.
- `flag_for_office_review` — soft escalation, sends a flag email but no SMS page yet.
- `escalate_emergency` — hard escalation, fires the red-banner emergency email. SMS paging layers on top once A2P clears.

### Background sound

Vapi's default `backgroundSound: "office"` adds subtle call-center ambience to the assistant's audio. Tyler heard it on his first calls and asked to dim it. Set to `"off"` on 2026-05-13. **One curl call to flip back on** if anyone misses the texture:

```bash
curl -X PATCH "https://api.vapi.ai/assistant/6aa271db-9bec-446a-9f47-9949b5020d5a" \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"backgroundSound": "office"}'
```

### Transcript role mapping (gotcha worth knowing)

Vapi's `end-of-call-report` artifact uses `role: "bot"` for Claire's spoken turns, not `role: "assistant"`. Our initial route filter dropped every Claire turn for that reason — first wave of Tyler's test calls landed with only the customer side visible in the Switchboard. Fixed at commit `478bea4`: route now normalizes `bot` → `assistant`, `user` → `user`, skips `system` (it's the prompt, not a turn) and skips `tool_calls` / `tool_call_result` (those persist live during the call via the `tool-calls` webhook instead). Backfill script `scripts/backfill-voice-transcripts.mjs` walks every voice conversation, refetches the Vapi artifact, and inserts any missing turns idempotently via `external_id = "<callId>:<time>"`. Already executed against production: 44 messages restored across 5 calls.

**Phone-number routing strategy** (decided 2026-05-01, unchanged):

TZ's published main number **(518) 678-1230 stays exactly where it is** with TZ's current carrier. We do NOT port it. Voice Claire lives on a separate Twilio number; the main number forwards to it under specific conditions.

**Architecture:**

- Tyler signs up at vapi.ai (his card, his account, per the handoff plan). Vapi runs the assistant logic but uses Twilio under the hood for telephony.
- Tyler signs up at twilio.com (his card, his account). Buys ONE Hudson Valley local Twilio number (~$1.15/month). This single number does double duty for voice + SMS (see "One Twilio number for both" below).
- Tyler logs into his current carrier's portal (whoever provides 518-678-1230 today) and configures forwarding:
  - **Business hours (Mon-Fri 7am-5pm):** main number rings the office first. Unanswered in 3-4 rings → roll to the new Twilio number. Office gets first crack; Claire is overflow.
  - **After hours / weekends / holidays:** main number forwards directly to the new Twilio number. Claire picks up immediately, qualifies, books a free estimate, or escalates to the on-call rotation per the dispatch SOP in `docs/agent-training-answers.md`.
- We configure the Vapi assistant in the Vapi dashboard to point at our `/api/agents/voice/*` tool endpoints (thin wrappers around the same `buildAgentTools()` surface as web chat).

**Why this approach:**

- No port required. No carrier change, no 2-3 week port window, no risk to the number TZ has been using forever.
- Claire is purely additive. If Vapi or Anthropic ever go down, the worst case is the main number rings to voicemail like it does today. Nothing breaks for the office.
- HCP is unaffected. HCP doesn't own the phone number; it tracks calls when associated with a customer record. Whether Claire or a human picks up, lead capture flows through `create_lead_with_estimate` to the same HCP customer + estimate + Job Inbox + Switchboard mirror pipeline.
- Caller ID handles contact-capture for free. Vapi exposes the caller's phone number from the carrier on every call, so the voice channel framing already says Claire only confirms the name (no contact-first dance).

### One Twilio number for BOTH voice and SMS (Bring Your Own Number to Vapi)

Cesar asked 2026-05-01 whether voice and SMS need separate Twilio numbers. **They don't.** A US local Twilio number is voice + SMS capable by default; you point separate webhooks at the two functions:

- **Voice URL** on the number → Vapi (their endpoint, set up via Vapi's BYON wizard).
- **Messaging URL** on the same number → our `https://tzelectricinc.com/api/agents/sms/webhook`.

Two paths to set this up:

1. **Vapi-managed number (avoid).** Convenient but the number lives in Vapi's managed Twilio sub-account, which means we can't easily wire the Messaging URL to our SMS webhook. Forces a second standalone Twilio number for SMS. Two numbers, two monthly rentals, two phone numbers in customer-facing copy.
2. **Bring Your Own Number (BYON) — what we want.** Tyler keeps his own Twilio account, buys one Twilio number, configures both webhooks himself. Connects to Vapi via Vapi's BYON flow. **One number, both functions, one rental, simpler customer story.**

**Tyler's account picture:**

- **Vapi account** (his card) — runs voice assistant logic, no number management.
- **Twilio account** (his card) — owns ONE Hudson Valley local number (~$1.15/month). Voice URL → Vapi. Messaging URL → our SMS webhook.

**Customer-facing numbers:**

- "Call (518) 678-1230" — stays with TZ's current carrier as always. Forwards to the new Twilio number on no-answer / after-hours; Vapi/Claire picks up.
- "Text (518) XXX-XXXX" — the new Twilio number. Published as the SMS contact because TZ's current main number is likely a landline that can't receive texts. SMS Claire handles inbound here.
- If Tyler's current main carrier IS SMS-capable (modern VoIP like RingCentral / Vonage), we could revisit and unify under one published number. Most landlines aren't, so two-numbers-in-marketing-copy is the realistic plan.

**Timing:**

- **Voice goes live first.** No carrier review for voice. Hours after Tyler's Vapi + Twilio signups land + we wire the Vapi assistant config + Tyler sets up forwarding on the main number.
- **SMS waits on A2P 10DLC.** 1-2 week vendor wait for Twilio's brand vetting before SMS reliably delivers to consumer carriers. Tyler kicks off the registration when he buys the Twilio number; we wait for it to clear.

**Long-term unification option (not needed for v1):** port (518) 678-1230 to Twilio later so the main published number IS the Twilio number doing both voice (via Vapi) + SMS (via Claire) all in one. Cleaner customer story (one number for everything), but requires the port window. The two-numbers-with-forwarding plan above ships immediately without that risk.

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
| `SWITCHBOARD_PASSWORD` | yes | Admin login password (legacy fallback; Google OAuth is primary) |
| `SWITCHBOARD_SESSION_SECRET` | yes | HMAC secret for signing session cookies |
| `RESEND_API_KEY` | yes | Resend API key (account under `tzelectricoffice@gmail.com`) |
| `AGENT_TRAINING_FROM_EMAIL` | yes | `TZ Switchboard <notifications@tzelectricinc.com>`. Used as default `from` for digest + flag/escalation emails too. |
| `AGENT_TRAINING_TO_EMAIL` | not set | Optional override. Default: `cesar@creativequalitymarketing.com` |
| `AGENT_TRAINING_REPLY_TO` | not set | Optional override. Default: `service@tzelectricinc.com` |
| `LEAD_FORM_TO_EMAILS` | not set | Comma-separated recipients for new-lead + flag + emergency emails. Default: tyler@/terry@/service@/cesar@. |
| `HOUSECALL_PRO_API_KEY` | yes (sensitive) | Bearer token for `api.housecallpro.com`. |
| `HCP_BU_PLUMBING_UUID` | not set | HCP Business Unit UUID for Plumbing. When set, every Plumbing-categorized estimate auto-tags this BU. Tyler must grab from HCP UI dev tools (see "HCP Business Unit UUIDs" below). |
| `HCP_BU_HVAC_UUID` | not set | Same for HVAC. |
| `HCP_BU_ELECTRICAL_UUID` | not set | Same for Electrical. |
| `CRON_SECRET` | not set (recommended) | Verifies Vercel Cron requests to `/api/cron/daily-digest`. If unset, the endpoint is open. |
| `DIGEST_TO_EMAILS` | not set | Comma-separated recipients for the daily 8 AM digest. Default: `tyler@tzelectricinc.com,terry@tzelectricinc.com,cesar@creativequalitymarketing.com`. |
| `DIGEST_FROM_EMAIL` | not set | Optional override for the digest sender. Defaults to `AGENT_TRAINING_FROM_EMAIL`. |
| `DIGEST_REPLY_TO` | not set | Optional override for the digest reply-to. Defaults to `AGENT_TRAINING_REPLY_TO`. |
| `VAPI_PRIVATE_KEY` | yes (sensitive) | Vapi private API key. Used by the MCP server, the local CLI via `VAPI_API_KEY` env, and any future outbound calls our backend initiates. |
| `VAPI_SERVER_URL_SECRET` | yes (sensitive) | 64-char hex secret for verifying inbound Vapi webhooks at `/api/agents/voice/server`. Mirrors the same value configured in the Vapi assistant + phone-number server settings. Rotate via PATCH to both Vapi endpoints + Vercel env if leaked. |
| `VAPI_VOICE_PROVIDER` | yes | TTS provider for Claire (`11labs`). |
| `VAPI_VOICE_ID` | yes | 11labs voice id for Claire (`DXFkLCBUTmvXpp2QwZjA`, "Eryn"). Custom voice from TZ's 11labs subscription via BYOK — Vapi credential is wired in Vapi dashboard so the voice consumes Tyler's 11labs quota directly. |
| `VAPI_MODEL_PROVIDER` | yes | LLM provider for voice (`anthropic`). |
| `VAPI_MODEL_NAME` | yes | LLM model identifier (`claude-haiku-4-5-20251001`). Web chat still uses Sonnet via AI Gateway for nuanced text Q&A; voice uses Haiku for sub-second latency. |
| `TWILIO_ACCOUNT_SID` | yes | Tyler's own Twilio account (`tyler@tzelectricinc.com`). Account SID `ACc6fcf0...`. The old `tzelectricoffice@gmail.com` account from 2026-05-08 is orphaned and should be closed by Cesar when convenient. |
| `TWILIO_AUTH_TOKEN` | yes (sensitive) | Tyler's Twilio auth token. Used both by Vapi BYON (Vapi stores its own copy server-side from the dashboard import) and by our `/api/agents/sms/webhook` for signature verification. |
| `TWILIO_PHONE_NUMBER` | yes | `+15186786153`. Hudson Valley local number on Tyler's account, voice via Vapi BYON, SMS dormant until A2P 10DLC clears. |
| `TWILIO_API_KEY_SID` | not set | Optional, more secure than Auth Token. Skip until we need outbound SMS sends from our backend at scale; Auth Token suffices for v1. |
| `TWILIO_API_KEY_SECRET` | not set | Same. |

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

## Claire as TZ AI (architecture direction, locked 2026-05-18)

We are expanding Claire from "the customer-facing booking agent" to **the TZ AI** — one persona, one knowledge base, multiple surfaces, role-gated tool registry. Tyler joked about a "TZ Alexa" in the 2026-05-15 meeting; that is what we are actually building.

### Surfaces (in build order)

| Surface | Audience | What she does |
|---|---|---|
| Web chat / voice / SMS (current) | Customers | Book leads, qualify, escalate, after-hours dispatch |
| **In-app Claire (next)** | Switchboard users | Slide-out chat panel always available; conversational interface for everything below |
| Admin chat | Tyler, Terry, Cesar | Edit KB sections, set on-call rotation, review calls, query analytics in plain English |
| Office chat | Office staff (Molly, April) | "How do I handle a refund pushback?" "What's the deposit policy?" SOP lookup |
| Tech SMS | Field technicians | "12k FX compressor, quarter-by-three line set, right?" Material verification, code lookup |
| Training mode | New hires | Self-paced curriculum, weekly modules, Friday quizzes, pre-screening assessments |

### Why in-app first, MCP later

We explicitly considered exposing an MCP server so Tyler could wire his own Claude into TZ. **Decision: build in-app Claire first.** Reasons:

- The hard work is the tool layer (auth, audit, versioning, role-gating, destructive-action confirmations). The in-app surfaces stress-test that more thoroughly because they get hit by every role (owner, admin, office staff, eventually techs) — not just Tyler-as-power-user.
- Tyler doesn't currently use Claude Code. Setting him up with MCP would mean Cesar configuring his machine. Easier first interaction: he logs into the Switchboard, the chat is already there.
- The in-app surface is a controlled, branded environment. MCP exposes everything to whatever client speaks the protocol. Build trust in the tool layer before opening it up.
- The MCP wrapper is thin once the tool registry exists. ~2 sessions of work to add after in-app stabilizes.

### Architectural pieces to build (in order)

1. **Refactor `agent-prompt.ts`** from per-channel branching to a layered builder: `buildPrompt({ surface, role, user, context })`. Surface picks which KB layers + tool sets to mount. Channel is a sub-aspect of surface.
2. **Tool registry abstraction.** Each tool registers with `{ name, scopes, handler, description, destructive }`. Role-gating happens at registry resolution time — admin tools never appear in office-staff prompts. Destructive ops require an explicit confirmation step.
3. **Karpathy file structure in the shared Drive** (`Shared drives/CQ Marketing AI Files/tz/`):
   - `customer/` — current public KB (move from `docs/agent-training-answers.md`, keep that file as the build artifact that ingests this folder)
   - `office/` — internal SOPs: refund handling, deposit pushback scripts, building permit walkthroughs, J numbers, scheduling baselines
   - `tech/` — material specs, NEC code references, TZ install patterns, breaker sizing rules
   - `training/` — curriculum, weekly modules, quizzes
   - `prompts/` — per-surface system-prompt fragments
4. **Right-side slide-out chat panel** in the TZ Switchboard. Always present, collapsed by default, opens with a keystroke. Mobile: full-screen modal. Lives at `/switchboard/claire` for long sessions too.
5. **Admin chat surface first** — Tyler is the bottleneck. Solving his use case (edit KB conversationally, set on-call without clicking forms) frees the most velocity. Two starter tools: `update_kb_section`, `set_on_call_today`.
6. **Office chat surface second** — Molly + April get answers without paging Tyler. Internal SOPs go into `office/`.
7. **Tech SMS third** — material verification + code lookup. Higher engineering depth but huge field-error reduction.
8. **Training mode fourth** — onboarding curriculum + assessments.
9. **Multimodal fifth** — image ingestion (estimates, panels, line sets), voice notes, PDF SOP upload.
10. **QC auditor sixth** — nightly CSR call review, surfaces coaching moments for Tyler's weekly review.
11. **MCP seventh** — wrap the tool registry. Per-user OAuth tokens via the existing Google sign-in. One-click installer in the Switchboard. Sellable platform asset.

### Risks worth re-naming each session

- **Internal hallucination is more dangerous than customer-facing.** Every internal answer must cite the source section in the KB. If no source exists, Claire says "no SOP for this, ask Tyler" and flags it for him to add. Never invent internal policy.
- **Destructive admin operations require diff preview + confirmation.** "Wipe the Generac section" shows the diff and waits for yes. Versioned via `tz_kb_override_history` (already wired).
- **Per-surface prompts, not one mega-prompt.** Accuracy drops if we pile every layer into one context. Each surface mounts only what it needs.
- **Role isolation is non-negotiable.** Customer reply must never leak internal pricing logic. Office reply must never miss internal context. Strict per-surface system prompts + `redact_for_role` middleware.
- **Cost discipline.** Per-user rate limits + monthly Gateway caps. Already have the user-attribution + tags wiring on the public surfaces.

### Naming + UX decisions locked

- **One name across all surfaces: "Claire".** Customer-facing trust signal stays consistent; internal users develop a single mental model. No "Office Claire" / "Customer Claire" split.
- **In-app surface UX:** slide-out chat on the right side of every Switchboard page, plus a dedicated `/switchboard/claire` for long sessions. Mobile collapses to a full-screen modal with a clear close affordance.
- **Admin / edit access roles:** Cesar, Tyler, Terry only at launch. Office staff get read + ask, not edit. Owner-only for destructive operations.

## After-Hours Dispatch (shipped 2026-05-18)

Implements Tyler's `TZ_Electric_After_Hours_SOP.md` end-to-end. Built as a real cascade, not just a notification.

### Tool surface

Claire calls `dispatch_after_hours_emergency` whenever lookup_business_hours says the office is closed AND the issue is a genuine emergency. Inputs: `issue_description`, `customer_phone`, optional `customer_name` / `customer_address`, optional `safety_flags[]` (active_leak, no_heat, smoke_sparks, gas_smell, electrical_hazard, sewage_backup, medical_equipment_loss, total_power_loss), and `customer_acknowledged_fees` (boolean — she must confirm the $475 fee with the customer before dispatching).

The tool:
1. Reclassifies the window from local NY time (`business_hours` / `standard_after_hours` / `overnight`). Rejects business-hours calls.
2. Looks up the on-call tech (date-bound) and the supervisor chain (always-on) via `tz_on_call_schedule`.
3. Opens a `tz_emergency_dispatches` row with `status='open'`.
4. **Overnight (10 PM – 5 AM):** sends one SMS each to the on-call tech and the on-call supervisor with the full call details. Sets `next_attempt_no=99` so the cron worker leaves it alone. Done.
5. **Standard after-hours (4 PM – 10 PM, 5 AM – 7:30 AM):** fires T+0 SMS + voice call to the on-call tech, schedules `next_attempt_at` for T+15 with `next_attempt_no=1`.
6. Returns a customer-facing confirmation message Claire reads back ("I've alerted Nick, he should be calling you within 10 to 15 minutes…" or the overnight version).

### Cascade worker

`/api/cron/dispatch-escalation` runs every 5 minutes via Vercel Cron. Pulls `status='open' AND time_window='standard_after_hours' AND next_attempt_at <= now` rows (max 25 per tick), advances the cascade. The `time_window` column had to be renamed from `window` because `window` is a reserved keyword in PostgreSQL — caught immediately at migration apply time.

| attempt_no | Action | Next |
|---|---|---|
| 1 (T+15) | text + call tech again | schedule T+30 |
| 2 (T+30) | text + call tech AND text + call supervisor | schedule T+60 |
| 3 (T+60) | final text + call to both | schedule customer callback T+65 |
| 4 (T+65) | call customer with "team tied up" script | close dispatch as `closed_no_response` |

Every Twilio call writes a row to `tz_dispatch_attempts` with the SID for traceback. The unique index `(dispatch_id, attempt_no, target_role, channel)` makes the worker idempotent — a cron retry on the same tick is a no-op.

### Privacy

The SOP says never read a tech's personal number to a customer. The current implementation honors this by never sharing the tech's number — the tech calls the customer back. A future Phase will add Vapi `transferCall` to bridge the tech directly when they answer the inbound call from Twilio (`<Dial>` already on the path).

### On-call schedule source of truth

`tz_on_call_schedule` is seeded from the KB calendar in section 3 by `scripts/seed-on-call-schedule.mjs`. Run once after the migration applies. Resede after any rotation swap by editing the KB calendar (`docs/agent-training-answers.md`) and re-running the script. Future: admin Claire chat will edit this conversationally.

### Open follow-ups (post-launch routing day)

- **Twilio outbound smoke test.** The first real after-hours dispatch should be a Cesar-initiated test call to verify Twilio SMS + outbound voice both fire correctly. Twilio Auth Token + the new number are already on Vercel.
- **Bridge call.** Replace the "tech calls customer back" pattern with a Twilio `<Dial>` bridge so the tech can accept the inbound and be live with the customer in one step.
- **Tech response acknowledgment.** Today the cron blindly escalates. A future tick reads inbound SMS replies ("ON IT" / "OK") to mark `status='resolved_tech_responded'` and stop the cascade. Twilio webhook scaffolding already exists at `/api/agents/sms/webhook`.
- **Routing flip on Tyler's main number.** Per the meeting, Option A first: HCP rings the office 4–5x during business hours, rolls to Claire's `+15186786153` on no-answer; after-hours forwards directly. Option B (Claire replaces the HCP phone tree entirely) is queued for a later session.

## What's open right now

- [x] ~~Tyler fills out the agent training questionnaire.~~ Submitted 2026-04-26.
- [x] ~~Smoke test the full email flow.~~ Tyler's submission landed cleanly in `cesar@creativequalitymarketing.com` via Resend.
- [x] ~~Get Tyler's answers on the remaining blockers.~~ Tyler doesn't have opinions on the operational gaps, so CQ Studio filled them in with industry-standard best-practice defaults. See **section 10 of `docs/agent-training-answers.md`** ("v1 Best-Practice Fills"). Tyler can override any default by editing that file. Resolved: HCP record creation flow (use `/leads` endpoint), renter / landlord workflow (soft-block, collect landlord info, office verifies), home warranty decline script (warm pivot to Wisetack / Synchrony financing), review-already-left detection (single automated send + optional manual follow-up via Switchboard), Saturday dispatch scope (emergencies follow after-hours SOP, non-emergencies book for next business day, no estimates).
- [x] ~~Native lead form to replace Typeform.~~ Live at `/quote`. Branded email via Resend, GCLID + UTM capture, replaces every `TYPEFORM_URL` CTA. Renter branch tags `Renter - Landlord Verification Needed`. First real lead through it: Celeste Benard (#19), wired and visible across the stack.
- [x] ~~Form question parity with old Typeform.~~ Session 14 added every Typeform question that had been missing from the native form. HVAC: heating-only-or-both, throughout-vs-rooms, decommission existing system, NYSERDA awareness. Electrical: why-upgrading, overhead-vs-underground, switch-to-underground (conditional), utility company. Generator: full residential/commercial branch — portable-vs-standby on residential side, generator size on commercial side, plus service size + utility company on both. Conditional questions (`showWhen`) hide automatically when the parent answer doesn't match, and stale answers prune client + server side when a parent answer changes.
- [x] ~~HCP routing rewritten: estimates instead of leads.~~ Per Tyler's 2026-04-28 call, `customer.notes` is reserved for persistent customer info ("don't wear shoes in the house"), NOT job specifics. New flow: `POST /api/leads/submit` finds the existing customer in HCP (by ANY of phone, email, or full name — see "Existing customer match" below), or creates a new one with name/phone/email/address only and `notes=null`. Then creates an unscheduled estimate with `work_status: needs scheduling`. Office-internal lead details land on the option's notes via a secondary `POST /estimates/{eid}/options/{oid}/notes` call (HCP drops `notes` on options at create time — verified empirically). Tags land on `option.tags` and surface on the estimate row in HCP. The `tz_leads` row is stitched with `hcp_customer_id`, `hcp_estimate_id`, `hcp_customer_existing`, `hcp_match_via`, `hcp_error` so the Switchboard can deep-link to the matching HCP estimate. **Empirical HCP findings logged in `src/lib/housecall-pro.ts`** so the next agent doesn't have to rediscover them.
- [x] ~~HCP routing settled on DUAL-record flow (estimate + lead) with `lead_source` preset on the estimate (2026-05-08, after a brief single-estimate experiment).~~ Story arc: Tyler showed a Google "Reserve with Google" lead that had the full service info populated as "Estimate for X" while our `/leads`-POST inbox cards had an empty "Additional notes" panel. Probed exhaustively across all 35 leads in the account — confirmed HCP's public API does NOT expose any way to set notes on a `/leads` resource (no top-level `notes`/`additional_notes`/`service_details`/`summary`/`customer_availability`, no `/leads/{id}/notes` sub-endpoint, no PATCH/PUT). Google's lead is actually an `/estimates` resource with `lead_source: "Reserve with Google"` and rich `option.notes` — the Inbox UI renders that as "Estimate for X". Briefly pivoted to a single-estimate-only flow (`lead_source: "Lead Form"` for web form, `"CSR AI"` for Claire) and dropped the `/leads` POST. **That regression cost us a real lead** the next morning: David Maros (electrical contractor, whole-home rewire prospect) chatted with Claire → Claire correctly captured contact + flagged for office review → no inbox notification surfaced → Tyler caught the gap. **Restored to dual-record same day** at commit `c9a05ed`: every submission now creates BOTH a `/leads` POST (so the office's existing inbox notification habit keeps working) AND an `/estimates` POST with `lead_source` preset (so the rich notes show on the linked estimate). Yes, two HCP records per submission. Visibility wins over elegance. Web form uses `lead_source: "Lead Form"`, Claire uses `lead_source: "CSR AI"` (both are HCP-locked presets). Verified end-to-end via `scripts/e2e-test-lead.mjs`: tz_leads row populated with `hcp_customer_id` + `hcp_estimate_id` + `hcp_lead_id` all three. The HCP `/lead_sources` endpoint exposes the full 38-value preset whitelist; locked presets (Lead Form, CSR AI, Online Booking, Reserve with Google, etc.) get HCP-recognized integration treatment in the Inbox UI. See "HCP empirical findings — what works, what doesn't" section below for the full evidence.
- [x] ~~Office notifications wired for every Claire tool call (2026-05-08 hotfix, same day as David Maros gap).~~ Pre-fix: `flag_for_office_review` and `escalate_emergency` only updated `tz_agent_conversations.status`. Claire's user-facing message claimed "Office has been notified" / "Tyler is being paged now" but **nothing actually fired**. There was a literal `// TODO: when Tyler ships Twilio, page him + on-call rotation here` comment in the code. David Maros's flagged conversation sat in the DB with no notification for ~12 hours. New `src/lib/agent-notifications.ts` wraps Resend with three branded helpers: `sendOfficeFlagEmail` (priority badge + customer info + reason + Switchboard CTA), `sendEmergencyEscalationEmail` (red banner + tap-to-call link to the customer's phone + emergency styling), `sendClaireLeadCapturedEmail` (lead summary + qualification answers + HCP estimate link, parity with web form leads). All three pull customer context from `tz_agent_conversations` so the email has everything the office needs without a Switchboard click. Recipients default to Tyler/Terry/service@/cesar@; override via `LEAD_FORM_TO_EMAILS`. SMS paging will layer on top once Twilio A2P 10DLC clears.
- [x] ~~Attribution + thank-you conversion firing.~~ Form redirect now passes `service`, `serviceKey`, `channel`, `value`, `leadId`, `ownership` to `/thank-you`. The page renders a `<ConversionTracker />` client component that fires three events on mount: (1) GTM `dataLayer.push({event:'lead_submitted', ...})` so any tag in the GTM container can trigger from this signal without a code change; (2) GA4 `generate_lead` (the recommended event for lead conversions; if GA4 ↔ Google Ads is linked and `generate_lead` is marked as a conversion in GA4, it imports automatically — no Google Ads conversion label needed in code); (3) Meta Pixel `Lead` standard event for Facebook + Instagram ad reporting. Optional direct Google Ads conversion fallback: set `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AW-16641031492/LABEL` if you want to fire alongside the GA4 import. Client tracking now captures every common click ID (gclid, gbraid, wbraid, fbclid, msclkid, ttclid, li_fat_id, lsa_id) plus document.referrer, with first-touch (90-day) and last-touch (30-day) cookie sets. Server-side `deriveChannel()` reduces the snapshot to a single label like `Google Ads`, `Meta Ads (Instagram)`, `Bing Organic`, `Direct`, `Referral - example.com`. Channel is persisted on `tz_leads.attribution_channel` (migration 004), tagged onto both the HCP estimate option and the Job Inbox lead (`Channel: Google Ads`), shown on the office email, and surfaced on the Lead Pipeline as a colored chip + filter + dedicated stat cards (Paid / Organic / Referral / Direct). Per-service lead value (`leadValueCents`) drives the conversion event's `value` so Smart Bidding has a meaningful target — Generator/HVAC/Panel $400, EV charger $250, Plumbing $200, Surge $100, default $250. Tune by editing `src/lib/attribution.ts` once we have a few months of HCP Won/Lost data.
- [x] ~~Existing customer match: phone OR email OR name.~~ Originally phone-only; Tyler called that too weak (returning customers can mistype name or use a new phone). `findExistingCustomer` now fires three lookups in parallel and dedupes; phone is preferred over email over name. **Two HCP quirks worth knowing:** (1) `?phone_number=` is silently ignored — HCP returns the same first 10 customers regardless of input, so we filter client-side by exact normalized phone match against `mobile_number`/`home_number`/`work_number`; (2) `?q=<query>` actually does match across email/name, but loosely, so we filter client-side for exact email or full-name match before accepting.
- [x] ~~Two-way Won/Lost status sync.~~ The office flips estimates Won/Lost in HCP via the option-level approval buttons. Lead Pipeline page reads the latest `work_status` + `option.approval_status` for any rows whose `estimate_status_synced_at` is older than 5 minutes (capped at 30 rows per page load, sequential). Manual "Refresh statuses" button bypasses the throttle. Won/Lost/Open filter is back, won leads get an emerald accent, lost leads dim, and a status badge surfaces on each row.
- [x] ~~Lead Pipeline read path switched to Neon.~~ `/switchboard/lead-pipeline` now reads from `tz_leads` instead of HCP `/leads`, so the Switchboard mirrors exactly what's in HCP without doubling up on data. Every row deep-links to the HCP estimate via `hcp_estimate_id`; rows with HCP sync errors show an explicit "HCP sync error" badge plus the failure reason and a manual-recreate hint. Filters: search + service. Won/Lost filter dropped (no `pipeline_status` from Neon yet — re-add once we sync HCP estimate status back). Recent Leads card on the Switchboard home swapped over too.
- [x] ~~Knowledge Base v1 (read-only).~~ Live at `/switchboard/knowledge-base`. Renders `docs/agent-training-answers.md` as a structured browseable view with sticky section nav, scroll-spy active state, and full markdown styling.
- [x] ~~Neon Postgres provisioned (`tz-db`) and attached to the project.~~ Marketplace integration on Vercel. `tz_leads` table created via `migrations/001_init.sql`. `npm run migrate` applies any new migrations.
- [x] ~~Knowledge Base v2 (edit-in-place).~~ Live at `/switchboard/knowledge-base`. Owners + admins see Edit / Revert per section. Tyler-authored overrides land in `tz_kb_overrides` (Neon) and always win on render and in agent prompts — even if CQ later updates the base markdown. `tz_kb_override_history` keeps every revision; `tz_audit_log` stamps every edit.
- [x] ~~Switchboard auth: Google OAuth + per-user roles + per-module access overrides.~~ Domain-restricted to `tzelectricinc.com` + `creativequalitymarketing.com`. Owners (Tyler, Terry, Cesar) can promote / demote / disable users from `/switchboard/users` and toggle module access per-user via Customize access. Login_count + last sign-in tracked per user.
- [x] ~~Vercel + Neon handoff to TZ Electric team.~~ Project + domain transferred to Tyler's TZ team (`team_rgs4fNAHW2dNT1fCPsjf5aVg`, owned by `tzelectricoffice@gmail.com`, Pro plan). Neon migrated from CQ Marketplace to TZ-DB Marketplace via `pg_dump 17` → `psql` restore — schema + data identical pre/post. Old CQ Neon deleted by Cesar. Stripe + HCP secret env vars converted to Vercel `sensitive` type for production+preview.
- [x] ~~Web Chat Claire shipped at /claire.~~ Full-page immersive chat. AI SDK v6 + AI Gateway with OIDC auth and Anthropic prompt caching. Helpful-first qualification flow. Captures contact via `update_visitor_contact`, books leads via `create_lead_with_estimate` (same backend as the website form). Voice & Style + Security & Abuse Resistance + Estimates Policy hard-coded into the system prompt. TZ Switchboard Web Chat module live with takeover, attribution, and lead deep-link. See "Web Chat Claire (LIVE...)" section above for the full operational doc.

### Session 19 deliverables (2026-05-11/13, voice channel goes live)

Two sub-sessions: first half on 2026-05-11 (Generac KB update from Tyler's feedback on a web chat); second half across 2026-05-13 wiring voice Claire end-to-end. Shipped:

- [x] **Generac startup & activation KB section (commit `5d28ce4`).** Customer in web chat 2026-05-11 asked Claire how to first-start a brand-new Generac generator. Claire walked them through DIY procedure (oil, fuel valve, Auto mode), which risks voiding Generac's manufacturer warranty. Tyler took over and offered the paid startup service. New KB subsection in section 1: $290 flat fee, hard "do NOT coach DIY startup" rule, casual mention of yearly maintenance plans at `/signature-plans` (Preferred + Elite tiers include generator inspection), normal `create_lead_with_estimate` booking flow with the service intent in the option notes.
- [x] **Diagnostic scripts (commit `f194a96`).** `scripts/find-conversation.mjs <id-fragment>` looks up a `tz_agent_conversations` row by a short ID fragment (matches the Switchboard's "visitor 2AE 3CD23" label format) and dumps the full transcript including tool calls, office takeover replies, and customer / assistant turns. `scripts/list-kb-overrides.mjs` lists every override row from `tz_kb_overrides`. Both reuse the existing `@neondatabase/serverless` + dotenv pattern from `scripts/migrate.mjs`.
- [x] **Voice Claire shipped end-to-end (commit `03b2c41`).** See full "Voice Claire (Vapi) — LIVE" section above. Net new: migration 009 adds `external_call_id` column + partial index to `tz_agent_conversations`; `src/lib/vapi-signature.ts` verifies Bearer or X-Vapi-Secret header constant-time; `src/lib/vapi-tools.ts` adapts our AI SDK `buildAgentTools()` surface to Vapi's function-tool format via Zod 4's `z.toJSONSchema`; `src/app/api/agents/voice/server/route.ts` is one dispatch endpoint switching on `message.type` (assistant-request returns inline assistant config, tool-calls executes + returns results, end-of-call-report persists transcript + recording, status-update logs). New viewer at `src/components/switchboard/CallLogsClient.tsx` mirrors the web-chat viewer pattern with audio player + Vapi call-id debug pill + lead deep-link; `/switchboard/call-logs` nav flipped from "soon" to "live".
- [x] **`.gitignore` hardening (commit `d0cfbe2`).** Added `.claude/settings.local.json` and `.claude/.env*` to gitignore so the project-local Vapi MCP credential (and any future project-local secrets) can't accidentally land in git.
- [x] **Transcript role-mapping fix + backfill (commit `478bea4`).** Tyler's first wave of test calls landed in the Switchboard with only the customer side visible. Root cause: Vapi's `end-of-call-report` artifact uses `role: "bot"` for Claire's spoken turns; our route filter only accepted `role: "assistant"` so every Claire turn was silently dropped. Route now normalizes `bot` → `assistant`, `user` → `user`, skips system + tool roles. New script `scripts/backfill-voice-transcripts.mjs` walks every voice conversation, refetches each call's Vapi artifact, and inserts any missing turns keyed by `external_id = "<callId>:<time>"` for idempotency. Already ran against production: 44 messages restored across 5 calls.
- [x] **Tyler's feedback on first calls.** Two items relayed by Cesar after Tyler's first batch: (1) background sounded like a call center — turned out to be Vapi's default `backgroundSound: "office"` ambience; set to `"off"` via PATCH; one-liner curl documented to flip back on if anyone misses it. (2) Switchboard transcript only showed customer responses — same bug as above, fixed by the role-mapping change + backfill.
- [x] **Tyler's Twilio account (under his own email).** The original "TZ Electric" Twilio account from session 18 (`tzelectricoffice@gmail.com`, the office shared mailbox) is now orphaned. Tyler created his own at `tyler@tzelectricinc.com`, completed identity verification, bought `+15186786153` on his card. New credentials wired to Vercel as `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`. Old account credentials should be left to dissolve naturally; nothing references them anymore.
- [x] **Voice cost tuning per Cesar's "this looks expensive" eyeball.** Initial Vapi config picked Claude Sonnet 4.5 + 11labs scribe v1 transcriber → ~$0.18/min average cost, ~3,300ms latency (unusable). Flipped to Deepgram nova-3 transcriber (100ms latency, same $0.01) + Claude Haiku 4.5 (drop from 2,000ms → 800ms, $0.09 → $0.03). New steady state: ~$0.12/min, ~1,400ms latency. Web chat keeps Sonnet for richer Q&A; voice gets Haiku for sub-second response feel.
- [x] **Tooling for direct backend access.** Three new surfaces wired so future debugging doesn't require Cesar screenshotting dashboards:
  - **Vapi MCP server** at `https://mcp.vapi.ai/mcp` configured in `.claude/settings.local.json` via `npx mcp-remote` + Bearer auth using `VAPI_PRIVATE_KEY`. Loads on next Claude Code session restart. 10 tools exposed: `list_assistants` / `get_assistant` / `create_assistant` / `list_calls` / `get_call` / `create_call` / `list_phone_numbers` / `get_phone_number` / `list_tools` / `get_tool`.
  - **Vapi CLI** installed at `~/.vapi/bin/vapi` (v0.2.1) via `curl -sSL https://vapi.ai/install.sh | bash`. Authenticates with `VAPI_API_KEY` env var. Read paths work fine (`vapi assistant get`, `vapi phone list`); write paths (`vapi assistant update`) panic without `vapi login`, so prefer `curl` against `api.vapi.ai/assistant/{id}` for PATCH operations.
  - **Twilio CLI** installed at `/opt/homebrew/bin/twilio` (v6.2.4) via `brew install twilio/brew/twilio`. Authenticates via existing `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` env vars from `.env.local`. Used to inspect the new number's webhook config (`twilio api:core:incoming-phone-numbers:fetch --sid <PN-sid> -o json`).

### Session 18 deliverables (2026-05-07/08, post-launch polish)

After Tyler kicked the tires for a few days, he sent a batch of feedback in `#tz-electric` Slack and via screenshots / video. Cesar relayed everything in this session. Shipped in order:

- [x] **`/stay-cool` billboard landing page.** Single-page promo that mirrors TZ's new summer billboard ("Stay Cool This Summer / Mini-Split Installations"). Hero with Mitsubishi Electric + Diamond Contractor cert badges, lifestyle photo from `public/images/misc/mini-life/mini-life-split.png`, "Free Estimate" CTA into `/quote?service=mini-split&promo=stay-cool-2026`, "Chat with Claire" CTA into `claireHref('stay_cool_landing')`. `noIndex: true` so it doesn't compete with `/mitsubishi`. QR code target URL bakes in UTM params: `https://tzelectricinc.com/stay-cool?utm_source=billboard&utm_medium=offline&utm_campaign=summer-2026-minisplit` so GA4 attributes every scan. Shipped at commit `703cac7`.
- [x] **`/hvac-maintenance` landing page (Tyler's modular pricing doc).** Built from `HVAC Maintenance Quote & Booking.docx` and the office SOP `TZ_Electric_HVAC_Maintenance_Price_Book_SOP.docx`. Hero, "What's included" 3-card row, full per-component pricing table (Outdoor Compressor, High-Wall Head, Ceiling Cassette, Low-Wall Head, Ducted Air Handler with one-time + 3-year contract + deep-clean add-on columns), common-system pricing table (1:1, 1:2, 1:3, mixed, ducted variants), how-it-works 4-step strip, FAQ. Sends bookings to `/quote?service=hvac&promo=maintenance`. Maintenance pricing matrix also added to KB section 1 of `docs/agent-training-answers.md` so Claire can quote it. Internal SOP saved to `docs/hvac-maintenance-office-sop.md` for office reference until the Switchboard Employee Training module is built. Shipped at commit `7079113`.
- [x] **Floating button polish (Claire bubble + FloatingCTA).** Tyler complained Claire was popping up while he filled out the quote form, and that the floating buttons collided with the mobile menu when it was open. Fixes: (1) added `/quote` to the `HIDDEN_PATHS` array in both `ClaireFloatingBubble.tsx` and `FloatingCTA.tsx`, (2) bumped both scroll thresholds from 400px to 700px and made Claire's bubble respect the same threshold (was previously time-delayed not scroll-gated), (3) `Header.tsx` now sets `document.body.dataset.mobileMenuOpen = 'true'` when the mobile menu opens; both floating components have a shared `tz-floating-action` class and `globals.css` has a rule `body[data-mobile-menu-open="true"] .tz-floating-action { display: none !important; }`. Shipped at commit `7079113`.
- [x] **Bad-link sweep ("button click goes to bottom of page" complaint).** Two real culprits found via grep: (1) homepage newsletter form had `<form action="#" method="POST">` which on submit reloads the page with `#` appended, scrolling to nothing — replaced with a real CTA strip ("Get a Free Estimate" + "Call" buttons that actually do something); (2) `/signature-plans` and `/maintenance` hero CTAs were labeled "Sign Up Online" with a document icon but href was `#plans` (just scrolls down to plans grid) — relabeled to "View Plans" with a chevron-down icon so action matches label. Verified all forms (`<form>` only at `/switchboard/login` and `SignupModal`, both have proper `onSubmit` handlers), all `<button>` instances inside forms have `type="button"`, all inputs have `inputMode` (tel/email/numeric), `globals.css` enforces 16px min font on inputs (no iOS zoom), `body { overflow-x-clip }` (no horizontal overflow). Shipped at commits `b813a16` and `703cac7`.
- [x] **Claire prompt updates (per Tyler's feedback).** Three new sections added to `src/lib/agent-prompt.ts`:
  - **Scheduling Policy:** "Never quote a time before 9 AM. The earliest TZ starts estimates is 9 AM. Never name a specific calendar slot — the office books all windows. 'We'll be in touch within one business day' is the close." Direct response to Terry's 2026-05-06 1:09pm message about an 8:30am estimate getting auto-scheduled (turned out to be Google not Claire, but rule baked in regardless). Tyler's exact wording for timing is locked in: "typically same week, sometimes next day if you provide your info, then office follows up to schedule with a specialist."
  - **Stay In The Customer's Lane:** "Don't pivot a maintenance call into a new-install pitch, don't pivot a repair call into a system-replacement pitch. The on-site tech handles upgrade conversations." Direct response to Tyler's 2026-05-06 7:36pm "New Mitsubishi heat pumps installed instead 😬" message.
  - Plus the existing Estimates Policy and Voice & Style sections.
  - Suggestion chips on `/claire` empty state: dropped "I have a leak" (per Tyler's 7:34pm "seems weird to be the first one"), replaced with "Mini-split install" + "Mini-split maintenance" so the chips align with the form's funnel. Shipped at commits `7079113` and earlier.
- [x] **HCP routing rewire (the big one — see preceding entry for full detail).** Pivot to single-estimate Google-style flow with locked-preset `lead_source` values. Web form uses "Lead Form", Claire uses "CSR AI". Verified end-to-end with `scripts/e2e-test-lead.mjs` against production. Shipped at commit `487d2e0`.
- [x] **HCP `business_unit_uuid` plumbing (env-driven, ready when Tyler grabs UUIDs).** `createEstimateForLead` accepts an optional `businessUnitUuid` parameter; `businessUnitUuidForService(serviceKey)` in `constants.ts` maps service slugs to one of three UUIDs sourced from `HCP_BU_PLUMBING_UUID` / `HCP_BU_HVAC_UUID` / `HCP_BU_ELECTRICAL_UUID` env vars. When unset the field is omitted (no-op). Verified empirically that HCP validates `business_unit_uuid` at create time (returns 422 "unknown <id> provided" for invalid). HCP's public API does NOT expose `/business_units` (404), so Tyler has to grab the UUIDs from the HCP UI's network tab on the estimate-edit page. See "HCP empirical findings" section below for the path. Open item: Tyler still owes us the three UUIDs.

### Stay Cool billboard landing (`/stay-cool`)

Single-page promo at `src/app/(public)/stay-cool/page.tsx`. Replaces the old Webflow promo path. Hero is one navy section under the public Header (no duplicate logo or phone — they're already in the nav). Features:

- Cert strip at the top: Mitsubishi Electric + Diamond Contractor logos
- "Stay Cool / This Summer" headline (matches billboard copy)
- "Mini-Split Installations" subhead in tracked-uppercase blue-light
- Lifestyle photo (`mini-life-split.png`) framed in a rounded card with bottom navy fade
- Two CTAs: "Get a Free Estimate" → `/quote?service=mini-split&promo=stay-cool-2026`, "Chat with Claire" → `/claire?source=stay_cool_landing`
- Phone fallback link under the CTAs
- "Why a Mini-Split" 4-card row (Cools without ducts, Whisper-quiet, Zone-by-zone, Heats in winter too)
- Diamond Contractor trust strip with explainer + 4 bullets (Factory-trained, Best warranties, 330+ reviews, Wisetack/Synchrony)
- Final CTA gradient card with two more action buttons

`noIndex: true` so the promo page doesn't compete with `/mitsubishi` for organic search. The QR code on the printed billboard should encode:

```
https://tzelectricinc.com/stay-cool?utm_source=billboard&utm_medium=offline&utm_campaign=summer-2026-minisplit
```

GA4 acquisition reports will show "billboard / offline / summer-2026-minisplit" as the source for every scan. The lead form's existing attribution capture (`gclid`, `utm_*`, referrer, landing URL) will tag any lead through this page in `tz_leads.attribution_channel` and on the HCP estimate.

### HVAC Maintenance landing (`/hvac-maintenance`)

Static landing page at `src/app/(public)/hvac-maintenance/page.tsx` built from Tyler's customer-facing maintenance doc (`HVAC Maintenance Quote & Booking.docx`, sent 2026-05-07). Modular per-component pricing because every system is configured differently. The full pricing matrix is also in KB section 1 of `docs/agent-training-answers.md` ("HVAC Maintenance (Mini-Split & Ducted Cleaning)") so Claire quotes it accurately when asked. The internal office SOP from `TZ_Electric_HVAC_Maintenance_Price_Book_SOP.docx` is saved as `docs/hvac-maintenance-office-sop.md` for office reference. v1 sends all booking traffic to `/quote?service=hvac&promo=maintenance`; future v2 could add an interactive on-page configurator that builds the line items live (Outdoor Compressor x N + Indoor Heads x N) and submits as a structured maintenance lead, but the static page is enough for the QR code from Tyler's flyer / social posts.

### HCP empirical findings — what works, what doesn't (2026-05-08)

Documented to save the next person from re-discovering. All probe scripts are in `tz-site/scripts/probe-hcp-*.mjs` — feel free to re-run if HCP's API changes shape.

**Lead resource (`/leads`):**

- POST `/leads` accepts `customer.{first_name, last_name, mobile_number, email, notes}`, top-level `customer_id` (to attach to existing), top-level `tags`, top-level `address`, top-level `lead_source`. That's it.
- **Top-level `notes`, `additional_notes`, `service_details`, `summary`, `customer_availability`, `description`, `pipeline_status` are ALL silently dropped on POST.** Verified by setting them, reading back, no persistence.
- No `/leads/{id}/notes` sub-endpoint. No PATCH or PUT on `/leads/{id}` (404). The lead resource is essentially write-once.
- `customer.notes` persists but is the *customer's* persistent note field, not lead-specific. Tyler's 2026-04-28 rule: don't pollute it with job specifics.
- **Conclusion:** the "Additional notes" panel on HCP's lead inbox card cannot be populated via the public API. Period.

**Estimate resource (`/estimates`):**

- POST `/estimates` accepts the standard fields (customer_id, options, address) PLUS:
  - `lead_source` — string from the preset whitelist. Persists. Drives the source badge on the Inbox UI card.
  - `business_unit_uuid` — validated at create time (422 with invalid). Auto-populates the Business Unit dropdown on the estimate.
  - `job_type_uuid` — accepted on the request but does NOT persist on the estimate (job_type is a job-level concept, not estimate-level).
- `option.notes` is the right place for office-internal qualification + attribution dumps. Add via POST `/estimates/{eid}/options/{oid}/notes` with `{content: string}`.
- The Inbox UI renders estimates with a non-null `lead_source` as "Estimate for X" cards with the source badge and `option.notes` surfaced as Additional notes — the Google "Reserve with Google" UX.

**Lead source whitelist (`/lead_sources`):**

- 38 preset values total, split into `lock` (HCP-managed) and `edit` (office-customizable).
- Locked presets work on both `/leads` POST and `/estimates` POST: **Lead Form**, **CSR AI**, **Online Booking**, **Reserve with Google**, **API Leads**, **OnCall Air**, **ResponsiBid**, **HouseCall App**, **HouseCall Marketplace**, **Website Builder**, **AC Doctor**.
- Editable presets include: **Website**, **Google**, **Facebook**, **YouTube**, **Billboard**, **Mitsubishi**, **NYSERDA**, **Generac**, **BBB**, **Social**, **Saw TZE Truck**, **Drove By Office**, **Referral-Existing Customer**, **Referral-Employee**, **Referral-Contractor**, **Referral-Other**, **Referral-Friend/Family**, **Next Door**, **County List of Licensed Electricians**, etc.
- Sending a non-preset value returns 422 "Lead source not found" (e.g. "TZ AI Agent" / "Web Form" both rejected).
- **Tyler can add custom lead sources** via HCP Settings > Lead Sources. If he wants a specific "Claire AI" or "TZ Web Form" badge, he creates it there and we update the constant.
- Current usage: web form sends `lead_source: "Lead Form"`, Claire sends `lead_source: "CSR AI"`.

**Business Unit UUIDs (still pending Tyler):**

- TZ has three Business Units configured: Plumbing, HVAC, Electrical (per Tyler's 2026-05-07 screenshot of the estimate edit page).
- HCP does NOT expose `/business_units` via the public API. Tried `/business_units`, `/businessunits`, `/companies/{id}/business_units`, `/settings/business_units` — all 404.
- The UUIDs are visible in the HCP UI's network tab when the BU dropdown loads on the estimate-edit page.
- Until Tyler provides them, the env vars `HCP_BU_PLUMBING_UUID` / `HCP_BU_HVAC_UUID` / `HCP_BU_ELECTRICAL_UUID` are unset and the field is omitted from estimate POSTs (no harm, no auto-tag). Setting any one engages auto-tagging for that vertical.
- Service-to-BU mapping (in `src/lib/constants.ts`): mini-split / mitsubishi / hvac / cooling / heating / maintenance → HVAC; electrical / generator / ev-charger / panel → Electrical; plumbing / hot-water-heaters → Plumbing.

**HCP test records to clean up (manual delete in HCP UI — DELETE not exposed via API):**

- Customer `cus_170b17b36d79494aa4ee25c4b50ebf56` (ZZTest Probe-...). Has multiple estimates attached (#19999–#20011) plus various standalone test leads (#40, plus six probe leads from `lea_005bafc5...`, `lea_91c0b0e0...`, etc.). Easiest cleanup: delete the customer in HCP UI, the rest cascades.

### Next on deck: AI agents (Claire), in this order

1. ~~**Web chat Claire**~~ — **DONE** (2026-05-01). Live at `/claire`. See full section above.
2. ~~**Voice Claire via Vapi**~~ — **DONE** (2026-05-13). Live at `+15186786153`. See "Voice Claire (Vapi) — LIVE" section above.
3. **SMS Claire (long pole, 1-2 week vendor wait).** Scaffolding fully shipped end of session 14: webhook signature verification, conversation persistence, takeover UI at `/switchboard/sms-conversations`. Twilio number, account creds, and Messaging URL are all wired now — only A2P 10DLC carrier review remains. Tyler kicks off A2P registration from his Twilio console; expect 1-2 weeks of carrier vetting. **Cutover when vendor unblocks**: replace one TODO block in `src/app/api/agents/sms/webhook/route.ts` with a `generateText({...})` call (pseudocode is in the comment, but mirror the web-chat route's pattern: gateway() wrapper, prompt caching, system prompt as `SystemModelMessage` with Anthropic ephemeral cache, `MAX_OUTPUT_TOKENS` cap, gateway user/tags). Point Twilio messaging webhook at the existing route (already done). Cost expectation: ~$120-150/mo SMS + per-conversation tokens.

After SMS clears: Phase R1 reports already shipped (charts off `tz_leads` at `/switchboard/reports`). Next phases on the roadmap: R2 HCP Won/Lost integration (close rates by channel), R3 ad-cost integration (Google/Meta APIs → CPL/CPA/ROAS), R4 per-channel agent reporting. Then Phase 7 self-improving learning loop (transcript flagging → approved edits land as KB overrides via the existing override mechanism).

**Reusable across all three channels:** voice and SMS share the same `agent-prompt.ts` (KB + persona + voice + security + mission + per-channel framing), the same tool surface in `agent-tools.ts`, and the same persistence in `agent-conversations.ts`. The web-chat route (`src/app/api/agents/web-chat/stream/route.ts`) is the reference implementation for AI Gateway wiring, prompt caching, abuse guardrails, and tool-call persistence — copy its shape for voice and SMS routes.

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
