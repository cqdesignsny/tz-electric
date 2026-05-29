# TZ Switchboard Handoff

This is the rolling handoff doc. Last verified state, what's done, what's next, what's deferred. If anything below conflicts with code, trust the code. Keep this updated after every working session.

**Last verified:** 2026-05-29 morning, **session 26** (Dennis). See the **"✅ SESSION 26 UPDATE"** block at the top of the DENNIS section immediately below for what got done this session; the original session-25 task list and all prior history are preserved unchanged underneath it.

---

## ⭐ DENNIS — START HERE (session 25 → 26 handoff, morning of 2026-05-29)

Read this whole section before touching anything. You have full access **as Tyler** on Twilio and Housecall Pro, and access to the Vercel `tz-electric` project via Cesar. Everything below is ordered by priority.

### ✅ SESSION 26 UPDATE (Dennis, 2026-05-29 morning) — what got done

Worked the task list top-to-bottom. Status of the session-25 priorities:

- **#1 A2P resubmission — DONE (awaiting carrier approval).** Pulled live status: campaign was still FAILED (errors 30896 opt-in / 30882 terms URL). Confirmed root cause — the 2026-05-21 submission predated the now-live compliant site content (re-verified live this morning: `/terms-condition` full SMS program terms incl. STOP/HELP + the no-third-party-sharing clause, `/privacy-policy` mirror, `/quote` default-unchecked consent checkbox in `LeadForm.tsx`). **Resubmitted via the Twilio API** (a failed A2P campaign can't be PATCHed): backed up the old registration to `/tmp/a2p-backup/`, deleted it, and POSTed a fresh Low-Volume campaign on the same service `MGd889a7...`, reusing every field verbatim and changing ONLY `message_flow` to (a) embed the verbatim consent-checkbox language and (b) point Terms at `https://tzelectricinc.com/terms-condition`. New status: **`IN_PROGRESS`, no errors.** Number `+15186786153` still attached. **When it flips to REGISTERED/APPROVED → set `TWILIO_SMS_ENABLED=true` on Vercel** (re-check command unchanged, below).

- **#2 HCP auto-responder — CORRECTED + PINNED (not "Sparky").** "Sparky" does not exist in HCP today; the handoff naming was stale. The "reaching out about your API Leads request" text is the **Job Inbox → Auto-reply** (global toggle: Settings → Job Inbox, or `pro.housecallpro.com/app/apps/details/job_inbox`). Confirmed via HCP help docs — it's Job Inbox's exact default template, and it runs on HCP's own texting number (independent of our A2P blackout). **It was already OFF** when Dennis checked (all Pipeline → Leads SMS automations are off too). Per Dennis: **leave it PINNED as "might still be an issue — watch for it."** If the double-text resurfaces, this is the culprit. Do NOT disable the Pipeline Estimates follow-ups or Jobs archive rules — those are legit and wanted.

- **#3 HCP customer name recognition — SHIPPED + VERIFIED IN PROD (commit `8824b86`).** Built to spec. `migrations/014_add_hcp_customers.sql` (additive only — `CREATE TABLE/INDEX IF NOT EXISTS`, no existing table touched). `src/lib/hcp-customers.ts`: `normalizeMobile10` (mirrors the voice route's 10-digit logic so keys match), `syncHcpCustomers` (paginate + batched upsert via `sql.transaction`, ~37 round-trips), `lookupHcpCustomerByPhone` (never throws). Cron `/api/cron/hcp-customer-sync` at `0 7 * * *` (3 AM ET, after the analyzer) added to `vercel.json`. Voice route (`handleAssistantRequest`) attaches `customer_name` + `hcp_customer_id` to the conversation row ONLY — **deliberately NOT passed into `buildSystemPrompt`**, so Claire does not greet by name (honors the locked decision). Backfilled prod: **3,622 customers, 3,155 with valid phones**; lookup round-trip verified ("Alex Mallory" resolved from a stored number); deploy confirmed live (prod sync returned 200). **HCP was read-only throughout — GET /customers only, a one-way copy into Neon; no HCP record or setting, and no existing Neon table, was modified.** Phase 2 (deferred, routes through Cesar): same lookup on the web/SMS entry points + a prompt rule letting Claire use known details to skip re-collecting info.

- **NEW (Tyler ask, same day) — End-of-day follow-up recap — SHIPPED + VERIFIED IN PROD (commit `3cceb5f`).** Claire's throughout-the-day flag emails get lost when staff are in the field. New cron `/api/cron/end-of-day-flags` (fires **6 PM Eastern year-round**, DST-proof) sends a daily wrap: (a) a **per-person email** to each employee Claire flagged a callback to that day (`notify_team_member`) listing ONLY their items — name→email resolved via the staff-directory matcher + active `tz_users` (correctly handles `Ty`→`tstein@` vs `Tyler`→`tyler@`); (b) **one master recap of ALL flagged items to `service@tzelectricinc.com`** (override via `EOD_RECAP_TO`), grouped person → general office → a separate emergencies section. Each item **deep-links to its exact call/chat card** via `?id=<conversationId>` (all three Switchboard views read it). Code: `src/lib/eod-recap.ts` + the cron route; exported `sendEmail`/`escapeHtml`/`SITE_URL` from `agent-notifications.ts`. **Read-only on existing data, additive only (no migration), no change to Claire or the existing flag emails.** Skip-if-empty, `CRON_SECRET`-gated, `?dryRun=1` for safe prod testing (used to verify — Sam resolved to `sam@`). Dennis reviewed real samples and approved the format. TIMING: 6 PM Eastern year-round — vercel.json schedules `0 22,23 * * *` (both EDT and EST candidate UTC hours) and the route gates on `America/New_York` hour === 18 so exactly one send fires at 6 PM ET regardless of DST; manual fires via `?date=` / `?dryRun=1` / `?force=1` bypass the gate. To change recipients of the master recap without a deploy, set `EOD_RECAP_TO` on Vercel.

- **`CRON_SECRET` — ✅ SET + VERIFIED (session 26, commit `c69f81c`).** Generated a 64-char random secret, set it on Vercel **Production** via the Vercel CLI (authed as `cqdesignsny`), and redeployed so functions bind it. Verified live: anonymous GET to a cron endpoint → **HTTP 401**, authorized GET (Bearer that Vercel auto-sends to crons) → works. All five cron endpoints (daily-digest, dispatch-escalation, claire-daily-analysis, hcp-customer-sync, end-of-day-flags) are now locked down. The value is also in the SSD `.env.local` (gitignored) for manual triggering — manual hits now need `Authorization: Bearer <CRON_SECRET>`. Note: the connected Vercel MCP is read/deploy only (no env-write tool); used the CLI. Set on Production only (crons run on Production); add to Preview/Dev if ever needed.

- **Claire voice fix — message/voicemail tool-firing + no invented availability (session 26).** Tyler flagged the Nick call (518-722-3007, 2026-05-29 11:30 AM, conv `84e7cc8f`): caller named Tyler and asked to leave a voicemail, Claire said she'd pass it along + invited the voicemail, but fired **ZERO tools** — office got nothing — and she invented "everyone\'s busy / on another line." Root cause: the prompt already instructed the right behavior (lines ~161/181/124-129) but the model talked through it without committing a tool call. Fix in `agent-prompt.ts` (transfer/message section): added a NON-NEGOTIABLE block — (1) if you tell a caller you\'ve passed the message / invited a voicemail you MUST fire `notify_team_member` or `flag_for_office_review` in that same turn (words without a tool = lost message); (2) never invent staff availability; (3) use the inbound caller-ID number if they won\'t give one, still fire the tool; (4) named person + message = `notify_team_member` even for suspected solicitors. Also extended the **3-turn hard cap** to cover ANY person/message/voicemail/transfer request (was keyed only on the word "agent"). Type-checked, deployed. NOTE: this is a prompt-rule change — Cesar\'s domain per the usual norm; made at Tyler/Dennis\'s direction, give Cesar a heads-up. Separately noted (not yet fixed): Claire\'s office-number read-out garbled as "...one two Triaro" (TTS/transcriber artifact) — worth a number-pacing look.

**Still open from the session-25 list:** #4 Claire call transfer (blocked on the exact HCP voicemail number from Tyler), #5 dispatch visibility page (buildable now), #6 user management edit/disable, #7 smaller items.

### Context in 60 seconds

Today (session 25) was production-issue triage from Tyler + Terry's Slack plus a Vapi cost review. The single biggest discovery: **every outbound SMS from the TZ number is being carrier-rejected** because the A2P 10DLC *campaign* failed review. That silently broke (a) after-hours tech dispatch texts and (b) Claire's new "text a specific staffer" paging. Voice calls are unaffected (not A2P-gated). We shipped code fixes that make the system honest + lean on email/voice until SMS is unblocked. **Your #1 job is finishing the A2P resubmission so SMS goes live.**

### What shipped today (already live in production)

| Commit / change | What |
|---|---|
| `a52bae0` | **HOTFIX:** removed Vapi `endCallPhrases`. "thanks for calling" was substring-matching Claire's own opener and auto-hanging up every call ~14s in. Dropped 20+ calls before catch. Do NOT re-add endCallPhrases without a word-boundary matcher. |
| `d304f43` | **"Agent" intent fix + `notify_team_member` tool + staff directory.** Claire now pivots on first "agent/person/human" to take a message (3-turn cap), and routes named-staffer requests. New `src/lib/staff-directory.ts` parses an editable KB table (§3). |
| `24c9399` | **Three Slack-flagged fixes:** (1) Stripe plan-signup office email (was a `console.log` stub); (2) SMS over-promise fix + `TWILIO_SMS_ENABLED` master gate; (3) after-hours dispatch now sends an office backup email. |
| Vapi API PATCH | Disabled Vapi post-call `analysisPlan` (summary + successEval + structuredData) — was ~20% of voice spend, duplicative of our own nightly Opus analyzer. |
| DB | **Terry → owner** (she was stuck `office`; now has Admin Claire). **Mike's invite resent.** |

Voice cost baseline (last 14 days, from Vapi): **$7.88 / 79 calls / ~$0.11 per minute.** Breakdown: Vapi platform fee 46%, Claude Haiku LLM 24%, post-call analysis 20% (now disabled), Deepgram STT 9%, 11labs $0 on Vapi (BYOK, billed separately ~$8-13). Anthropic prompt caching is NOT available through Vapi (their `AnthropicModel.messages` is bare `OpenAIMessage`, no `cache_control` passthrough) — would require a custom-LLM-URL proxy, deprioritized. Cesar turned on Vapi auto-reload so the wallet never zeroes out again.

### YOUR TASK LIST (priority order)

#### 1. Finish the A2P 10DLC resubmission — THE unblocker (all SMS dead until this clears)

> ✅ **DONE session 26** — resubmitted via API, now `IN_PROGRESS`. See the SESSION 26 UPDATE above. Remaining: flip `TWILIO_SMS_ENABLED=true` on Vercel once it shows REGISTERED/APPROVED. Original instructions kept below for reference.

**Current real status** (I pulled it from the Twilio API today):
- ✅ Business profile "TZ Electric Voice" — twilio-approved
- ✅ Brand `BN40fcd3821a2c839ea0b2fdae00cb195b` — APPROVED / VERIFIED
- ❌ **Campaign — FAILED** (submitted 2026-05-21). Rejection errors:
  - **30896** — opt-in/consent info insufficient (field: MESSAGE_FLOW)
  - **30882** — Terms & Conditions URL issue (field: TERMS_AND_CONDITIONS_URL)
- The number **+15186786153** is attached to messaging service **`MGd889a7dbf8976d2b4363f47433741902`** ("Low Volume Mixed A2P Messaging Service"). Keep using that service.

**Why it's now fixable:** the website is already fully compliant. Verified live (HTTP 200) today: `/terms-condition` has a full "SMS / Text Messaging Program Terms" section (program name, opt-in methods, frequency, data rates, HELP, STOP, supported carriers, AND the critical "no mobile info shared with third parties" clause), `/privacy-policy` mirrors it, and the `/quote` form has a compliant consent checkbox. The 2026-05-21 submission predated that content. So the resubmission should pass.

**Steps (Twilio Console, signed in as Tyler):**
1. **Messaging → Regulatory Compliance → A2P 10DLC.** Find the campaign under brand "TZ Electric" showing **Failed**.
2. Open it → look for **"Edit and resubmit"** / **"Resubmit."** If locked, **create a new campaign** on the **"Low Volume Mixed A2P Messaging Service"** (the one with the number attached — do NOT use the empty "TZ Electric" service `MG5610c56778b12ff99a6a1052be734c8e`).
3. Use case: **Low Volume Mixed** (unchanged).
4. **Opt-in / message-flow description** — paste:
   > Customers opt in by submitting the service-request form at https://tzelectricinc.com/quote and checking the default-unchecked SMS consent box, which reads: "By checking this box, I agree to receive SMS text messages from TZ Electric, including messages from our smart assistant Claire, about my service request, appointment confirmations, technician dispatch, and follow-ups. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe, HELP for help. No mobile information will be shared with third parties for marketing." Consent is also collected verbally when a customer calls our office, and when a customer initiates a text to our number. Full SMS program terms: https://tzelectricinc.com/terms-condition
5. **Terms & Conditions URL:** `https://tzelectricinc.com/terms-condition`
6. **Privacy Policy URL:** `https://tzelectricinc.com/privacy-policy`
7. Leave the existing sample messages (they weren't the problem). Submit.
8. Low-volume campaigns usually clear in minutes-to-hours. **When it shows Registered/Approved, set `TWILIO_SMS_ENABLED=true` on the Vercel `tz-electric` project env and redeploy (or just set it — `sendSms` reads it at runtime).** That instantly re-enables after-hours dispatch texts + `notify_team_member` texts with no code change.
9. Verify: send a test (e.g. trigger a `notify_team_member` page or use the Twilio console) and confirm Messages API status = `delivered`, not `undelivered / 30034`.

**How to re-check status anytime** (from `tz-site/`, env in SSD `.env.local`):
```bash
export $(grep -E '^TWILIO_(ACCOUNT_SID|AUTH_TOKEN)=' .env.local | xargs)
curl -s -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  "https://messaging.twilio.com/v1/Services/MGd889a7dbf8976d2b4363f47433741902/Compliance/Usa2p" | python3 -m json.tool
```

#### 2. Disable Housecall Pro "Sparky" auto-responder

> ⚠️ **CORRECTED + PINNED session 26** — it's NOT "Sparky"; it's the **Job Inbox → Auto-reply** (global), and it was already OFF. Pinned as "watch for it." See the SESSION 26 UPDATE above. The original (incorrect) steps below are kept only as history — ignore the "Sparky" hunt.

**Problem:** when a website lead lands in HCP's "API Leads" channel, HCP's built-in **Sparky AI** auto-texts the customer "Hello [Name]! This is TZ Electric Inc reaching out about your API Leads request. How can we help you?" — double-messaging on top of Claire's intake. This is NOT our code (confirmed via Tyler's screenshot 2026-05-28). Can't be fixed from our codebase — it's an HCP setting.

**Steps (Housecall Pro, signed in as Tyler):**
1. Settings (gear) → look for **"Sparky AI" / "AI Team" / "AI CSR" / "AI Receptionist"**, or under **Conversations / Messaging → Automations**.
2. Turn OFF auto-response to new leads, specifically for the **API Leads** / **Online Booking** channels.
3. Also check **Settings → Lead Sources / Integrations → API Leads** for a per-channel auto-reply toggle.
4. If you can't find it, HCP chat support: ask "How do I stop Sparky AI from automatically texting customers on inbound API leads?" — known setting, varies by account tier.
5. Verify: next API lead should NOT trigger the "reaching out about your API Leads request" text.

#### 3. Build HCP customer name-recognition sync

> ✅ **SHIPPED session 26** (commit `8824b86`, verified in prod). Table, nightly cron, and silent call-time lookup all live. See the SESSION 26 UPDATE above. The build spec below was followed as written.

**Goal (Cesar's chosen approach):** recognize returning customers by inbound phone so **call logs show names instead of just phone numbers**, and Claire skips re-collecting info she already has. **Decision: do NOT have Claire greet by name** (avoids creepiness + wrong-name-on-shared-line). Attach the HCP customer silently.

**Build spec:**
1. **Migration** (next number after 012): `tz_hcp_customers` table — `hcp_customer_id` (unique), `first_name`, `last_name`, `mobile_phone` (normalized 10-digit, indexed), `email`, `street/city/state/zip`, `last_synced_at`.
2. **Nightly cron** `/api/cron/hcp-customer-sync` — paginate HCP `GET /customers` (see `src/lib/housecall-pro.ts` for the auth + fetch pattern), upsert each into `tz_hcp_customers` keyed on `hcp_customer_id`, normalize phone with the same logic as `normalizePhoneE164`. Gate behind `CRON_SECRET`. Add to `vercel.json` cron schedule (~3 AM ET, after the 2 AM analyzer).
3. **Call-time lookup** — in `handleAssistantRequest` (`src/app/api/agents/voice/server/route.ts`) and the web/SMS entry points, look up the normalized caller phone in `tz_hcp_customers`. On hit: set `conversation.customer_name` + `hcp_customer_id` on the row silently (do not alter Claire's opener). Keep latency low — it's a single indexed Neon query, fine within Vapi's 7.5s assistant-request deadline.
4. Call logs already render `customer_name` from the conversation row — once populated, returning callers show by name automatically. No call-logs UI change needed.
5. Note: `findExistingCustomer` (by phone/email/name) already exists in `housecall-pro.ts` but hits HCP live — use the Neon table for call-time speed, reserve the live lookup for lead creation.

#### 4. Claire call transfer / forwarding (NEW — direction locked session 25, Tyler's recurring ask)

**Context:** Tyler keeps asking for Claire to forward/transfer calls, most recently 2026-05-28 ("a way to forward calls to [an extra HCP voicemail] number from her at the end of a call... so that our current voicemail which nobody answers links to her wouldn't happen"). Decision after Cesar talked it through:

- **Build in-call TRANSFER, not "bypass Claire to a voicemail box."** A plain voicemail box recreates the exact "nobody answers it" problem Claire was built to solve (Marina Long, Alex Sadeh et al. fell through that crack pre-Claire). Claire already functions as a smart voicemail — records, transcribes, emails the office, surfaces in the Switchboard. So voicemail becomes an option Claire OFFERS, never a path that replaces her.
- **Clarify the primitive: transfer ≠ outbound dial.** We ALREADY dial out — after-hours dispatch places Twilio calls to the on-call tech. What's missing is connecting the LIVE inbound caller to another number mid-call. That's transfer, and it's the thing to build.
- **Vapi supports transfer natively.** Our voice server route ALREADY receives the `transfer-destination-request` event (it's in the `VapiServerMessage` type union + the switch in `src/app/api/agents/voice/server/route.ts`) — we currently return `{ok:true}` and do nothing with it. Wiring = handle that event + give Claire a transfer trigger.

**Two transfer targets:**
1. **Warm transfer to a staffer's cell** when a caller genuinely needs a human, it's business hours, and someone's likely available. Reuse the staff directory (`src/lib/staff-directory.ts`, KB §3) for name → number.
2. **Cold handoff to the HCP voicemail number** as the graceful "leave a message with a real box" out for callers who refuse Claire. **Get the exact extra HCP number from Tyler before building.**

**Design decisions to make first (don't skip):**
- **No-answer path:** if a warm transfer rings and nobody picks up, where does it land? Must NOT loop Claire → HCP forward → Claire. Land it on the HCP voicemail number or fall back to Claire's take-a-message flow.
- **Business-hours gating:** cell transfers only during 7:30 AM–4:00 PM; after-hours route to dispatch (emergencies) or voicemail.
- **Cost:** a transfer holds two concurrent call legs briefly. Minor, but note it.
- **Prompt rewrite:** the prompt currently FORBIDS promising transfers ("no warm-transfer wired" in the transfer-handling block of `agent-prompt.ts`). Once transfer is live, rewrite that block so Claire offers it in the right cases — and still does NOT over-promise (same lesson as the SMS over-promise fix: only claim what actually happens).

**Implementation sketch:**
- Handle `transfer-destination-request` in the voice route: return the destination number based on context (named staffer from the directory, or the voicemail number).
- Add a `transfer_call` tool (or use Vapi's native transfer destinations) so Claire triggers it intentionally with a spoken reason, gated by hours + availability, with the no-answer fallback wired.
- Update the agent-prompt transfer block to the new reality.

#### 5. Dispatch visibility page + Twilio StatusCallback (now higher value given the SMS blackout)

**Why:** Tyler thought after-hours dispatch was broken because he had no view into it. It DOES fire (voice works), but `tz_dispatch_attempts.status` records "sent" (Twilio-accepted) even when the carrier later rejects (undelivered/30034) — there's no delivery feedback wired.
1. Add `StatusCallback` URL to `sendSms` + `placeCall` in `src/lib/twilio-outbound.ts` pointing at a new `/api/webhooks/twilio-delivery` route.
2. That route updates `tz_dispatch_attempts.delivered_at` + `error_code` by matching the Twilio SID (`MessageSid`/`CallSid`).
3. New `/switchboard/after-hours` page: one card per dispatch (`tz_emergency_dispatches`) with its attempt ladder (T+0/T+15/T+30/T+60) showing channel + real delivery status. Owner/admin gated.

#### 6. User management UI: edit name + remove/disable

Tyler can't fix Mike's lowercase name or remove anyone. `src/components/switchboard/UsersClient.tsx` already has `ROLE_OPTIONS` including `disabled`. Add: inline edit of `name`, and a remove/disable action (prefer soft-disable via `disabled_at` over hard delete to preserve audit/attribution). Owner-only.

#### 7. Smaller open items (knock out as time allows)

- **"Customer said no → Claire re-asked the same question."** Tyler's Joey call (917-808-9404, 2026-05-28 ~1:51pm). Distinct from the agent-intent fix. Add a prompt rule: when a caller says "no" to a confirmation, acknowledge and move on — never re-ask the same question in different words (ties into the existing "Accept I Don't Know" rule in `agent-prompt.ts`).
- **Opener A/B test.** Session 24's analyzer flagged 8 calls where the caller heard the opener and hung up. Test a shorter/more human opener.
- **Calendar read** — Tyler asked (2026-05-28 6:41am): Claire answering "what time is my appointment today?" Needs an HCP scheduled-jobs-by-customer read + a new read-only tool. Privacy rule already in KB §4 (only share upcoming appt, not history).
- **Central Hudson direct-routing layering** — Tyler asked (6:44am): he already set parameters around the 452-2000 / 452-2010 utility numbers so Claire skips qualifying. He wants utility callers routed straight to a staffer. Overlaps with `notify_team_member` — once SMS is live this is mostly a prompt rule.
- **`CRON_SECRET` lockdown** (carried from session 24) — analyzer + new sync crons should require it. Cesar/Dennis set the env var.
- **13× `create_lead_with_estimate` loop** on conv `0717f9c8` (session 24) — investigate possible duplicate HCP records from a tool retry loop.

### Key facts / gotchas Dennis needs

- **Env / secrets:** the SSD `.env.local` at `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site/.env.local` has the full set (DATABASE_URL, Twilio, Vapi, Resend, HCP, Stripe). `vercel env pull` is INCOMPLETE because the CLI links to the old `cq-marketings-projects` shell — use the SSD file.
- **SMS is gated by `TWILIO_SMS_ENABLED`** (default off). `sendSms` short-circuits when off. Flip to `true` on Vercel the moment A2P clears. Nothing else changes.
- **Vapi assistant ID:** `6aa271db-9bec-446a-9f47-9949b5020d5a`. Dynamic server-URL pattern — `/api/agents/voice/server` returns the full inline config (system prompt, tools, voice) per call. WRITE ops via `curl` to `api.vapi.ai` with `VAPI_PRIVATE_KEY` (CLI write paths panic without `vapi login`).
- **DB query pattern:** from `tz-site/`, write a throwaway `scripts/_tmp-*.mjs` (uses `dotenv` + `@neondatabase/serverless`), run with `node`, delete after. For importing `.ts` libs use `npx tsx`. (Examples are all over today's session.)
- **Deploy:** commit on the SSD → post-commit hook pushes to GitHub + syncs Dropbox → Vercel auto-deploys `main`. Verify with `npx vercel ls --prod`. Per Cesar's standing rule: don't run local dev to verify, push to Vercel and test there.
- **Voice cost re-check:** Vapi only retains 14 days of call history. To pull cost: `GET https://api.vapi.ai/call?limit=100&createdAtGt=<14d ago ISO>` then sum `costBreakdown`. (A permanent cost dashboard was scoped but NOT built — it was erroneously marked done earlier; it remains open if Tyler wants ongoing visibility.)
- **Writing style for any customer-facing copy or KB edits:** no em dashes, no emojis, no AI filler. Claire identifies as a "smart assistant," never "AI." Business hours 7:30 AM–4:00 PM. Estimates are FREE by default.

---

### What shipped tonight (session 23 → 24, in order) — customer-facing voice + web chat + SMS (the original mission), AND admin-side as a chat that lives on every Switchboard page (the "Claire as TZ AI" architecture going from doc to product). Tyler had a real session and shipped 15 KB edits conversationally in 70 minutes through the new admin chat. Claire's first nightly self-improvement report fired and surfaced a real systemic issue (8 silence-pattern voice calls) that Tyler flagged for investigation.

### What shipped tonight (session 23 → 24, in order)

| Commit | What |
|---|---|
| `f67a6b8` | Voice prompt sweep — stall phrases banned, closing scripts, no-unprompted-pricing, estimator-vs-technician, phone-number TTS pacing, Vapi endCallPhrases + silenceTimeoutSeconds + maxDurationSeconds, mobile call-logs master-detail, invite emails wired through Resend |
| `cd9eb20` | After-hours fee disclosure — $475 framed as conditional opt-in, explicit caller-yes required before dispatch |
| `ee635f7` | Self-improvement Phase 1 — nightly cron `/api/cron/claire-daily-analysis` at 6:00 UTC (2 AM ET), pulls all prior-day voice/chat/SMS/lead-form, runs structured LLM pass via Zod schema, emails Tyler+Cesar a learning report. Migration 011 adds `tz_claire_daily_analysis` table. |
| `68811f8` | Analyzer upgraded Sonnet 4.6 → Opus 4.7; voice prompt rewrites transfer-request handling to lead with "what's going on?" instead of "I can't transfer" |
| `7eadac2` | Analyzer resilience — `schemaName` + `experimental_repairText` so Opus's JSON output reliably parses |
| `01bf783` | **Admin Claire V1** — /switchboard/agent-training rebuilt as chat + daily-reports browser. New `tz_kb_overrides` propose-then-approve flow. Migration 012 adds `admin_chat` channel. |
| `07eb749` | Persistent right-side Claire panel on every Switchboard page (initial: edge-tab toggle pattern) |
| `ad6dd5e` | **3-column agentic layout** — Claire panel always-open inline at lg+ (1024 / 1280 / 1536 width tiers), bubble + modal at <lg. Content shifts to fit via `lg:pr-[…]` on the row container. Matches Cursor / Antigravity / modern agent UI. |
| `6451516` | Dispatch voicemails finally usable — Twilio `MachineDetection=DetectMessageEnd` so TTS lands on Jimmy's voicemail; per-attempt + per-role voice + SMS scripts ("First emergency dispatch" / "Second attempt, 15 min" / "Third attempt, supervisor notified" / "Final"); no-AC NOT an emergency rule (Bianca case spelled out) |
| `612d591` | Mobile call-logs scroll — viewport-bounded `dvh`-based height so the transcript pane actually scrolls on iPhone |
| `5bcc351` → `c348074` → `7e80b0c` | **Page-hallucination saga (3 rounds)**. Initial attempt: move current-page block to top of system prompt. Failed — conversation history beat the prompt update. Second attempt: inject `[Page context for this turn: ...]` into the latest user-turn text so the freshest signal is at the top of history. Also failed — Claire still mirrored prior assistant turns. Final answer: **stop claiming to know the page at all**. New rule in `buildAdminPrompt`: "you do NOT know which Switchboard page the user is on. When asked 'what can you do here', answer generically with capabilities and ask 'which one?' when they reference 'this X'." Removed `currentPath` from prompt + UI Page-header. Cleaner contract — no false claims. |
| `fa3c250` | **KB structure analysis (graphify)** — ran the full pipeline on `docs/`. 127 nodes, 160 edges, 10 communities, 5 named hyperedges. Snapshot saved to `docs/kb-analysis/` (README + GRAPH_REPORT + interactive HTML + raw JSON). **Decision: NO runtime vector/graph RAG.** Graphify itself flagged "corpus fits in a single context window — you may not need a graph." Anthropic prompt caching is doing what vector RAG would do for cost. Revisit triggers documented in `docs/kb-analysis/README.md`. |

### What this means for picking up tomorrow

**Production state is solid.** Customer-facing Claire (voice + web chat) and admin Claire (in-Switchboard chat) are both live and have been used in production today. Tyler's KB edits all persisted through the propose-then-approve flow with proper audit trail (11 sections, 15 audit-log events, version-tracked).

**Tyler made the new admin chat productive on day one.** 11 distinct sections updated, 15 total writes (some sections iterated 2-3x — voice-persona went to version 3). Themes: $475 fee disclosure reinforcement, emergency criteria split, transfer-handling cleanup, name-routing, medical equipment priority, billing handling, voice persona, home warranty + utility callbacks, commercial routing, generator + new-construction.

**Claire's first nightly self-improvement report flagged a real issue.** 8 voice calls with the exact pattern: greeting played, 0 user turns, 12-21 sec duration, marked `customer-ended-call`. Confirmed: callers heard the AI opener and hung up. NOT a one-way audio problem (which Claire's report speculated about — she was overcautious, the right move). The fix space here is opener-tuning, not Twilio/Vapi infrastructure.

### What's open right now

1. **`CRON_SECRET` on Vercel** — analyzer endpoint is currently open (anyone can hit it, triggers an LLM call + email). Cost is bounded ($0.40/day) but should be locked down. Set a 32-64 char random string on Vercel for the `tz-electric` project's `CRON_SECRET` env var. Vercel Cron passes it as `Authorization: Bearer ...` automatically; external calls without the header get 401. **Cesar action, no code change needed.**
2. **13x `create_lead_with_estimate` loop on conv `0717f9c8`** — Tyler's test call 2026-05-27 17:16 fired the lead-creation tool 13 consecutive times in one conversation. Likely created duplicate HCP records. Needs: pull `tz_agent_messages` for that conversation to see the tool_use sequence, check `tz_leads` + HCP for the duplicates, understand what triggered the retry loop (probably model-side, possibly a tool-result loop after the parser fix that morning).
3. **Tyler's silence-pattern question (from his admin chat session)** — Claire flagged 8 calls in her first daily report. The fix isn't infrastructure (one-way audio), it's the opener (callers hearing "smart assistant" and hanging up). Worth A/B testing a shorter or more human-sounding opener.
4. ~~**Promote Terry to owner**~~ — ✅ DONE session 25 (DB update, verified `role=owner`).
5. **Switchboard team rollout** — Ty Stein signed in 2026-05-28. Mike still hasn't (invite resent session 25; likely blocked because `mike@tzelectricinc.com` isn't a Google Workspace identity yet — needs the account created). Cesar's list of additional names + roles still pending.

> NOTE (session 25): the authoritative current open list is the **"⭐ DENNIS — START HERE"** section at the top of this doc. The items below are the session-24 snapshot, kept for history.

### Architecture notes locked this session

- **Admin Claire ≠ Customer Claire** at the prompt level. Two distinct entry points: `buildSystemPrompt` (customer) + `buildAdminPrompt` (admin). Shared KB but separate missions, separate tool surfaces, separate role gates.
- **Anthropic conversation history beats system prompt updates** for continuity. Lesson from the page-hallucination saga: don't put time-varying context only in the system prompt; either re-inject it into the latest user turn OR don't promise it at all. We chose the second path.
- **Anthropic prompt caching already does most of what vector RAG would do** at TZ's scale (~10K-word KB). Graphify's own analysis confirmed "you may not need a graph." Decision documented at `docs/kb-analysis/README.md`. Revisit triggers: KB triples in size, cohesion rises, or 5+ concurrent admin users arrive.
- **Per-surface KB subsets (Karpathy file structure: customer/ office/ tech/ training/)** is on the roadmap but deferred. Premature at current scale.

**Earlier 2026-05-27 evening (commit f67a6b8 + cd9eb20):** the seven live-fire fixes from Tyler + Terry feedback + the Lewis fee-disclosure fix from his 5:40 PM Slack. **Headline:** seven live-fire fixes shipped in commit `f67a6b8` after Tyler + Terry surfaced a wave of Claire issues from the afternoon's real customer traffic. Tracy (a real caller) felt "hung up on" by Claire across 8 calls because Claire was promising "Hold tight" and "Let me get someone for you" with no transfer mechanism wired, then going silent. Same root cause as Tyler's "she repeated 'one moment' 25 times and glitched" report at 5:22 PM — Claire reaching for stall phrases at end of call. Three layers of fix landed: (1) **Prompt rules** ban the stall phrases verbatim ("Hold tight", "Hold on a sec", "Let me get someone for you", "Stay on the line", "I'll connect you now"), cap "one moment" at once per call, and add explicit closing scripts (billing / specific-person / return-call / generic-human-callback) with hard cap of two assistant turns after any tool call fires. (2) **Vapi platform-side** — `endCallFunctionEnabled: true`, `endCallPhrases: ["have a good one", "take care", "goodbye", "thanks for calling", "you can hang up whenever you"]`, `silenceTimeoutSeconds: 30`, `maxDurationSeconds: 900`, `backchannelingEnabled: false` (latter so Claire stops blurting "uh huh" during voicemail recordings). (3) **No-unprompted-pricing rule** + **estimator-vs-technician rule** + **phone number TTS pacing** (format changed from "five one eight, six seven eight, one two three zero" to "Five. One. Eight. Six. Seven. Eight. One. Two. Three. Zero." — period after each digit forces 11labs to slow down). The after-hours emergency dispatch reported as "broken" by Tyler at 4:52 PM ET was actually a timing artifact: the safety-net commit `035830d` from session 22 landed at 5:00:43 PM ET, 9 minutes AFTER Tyler's test. The very next emergency call (5:12 PM refrigerator-sparks) DID fire SMS + voice to Jimmy Neville cleanly with valid Twilio SIDs (`SM248af4...` and `CA674d25...`), and the T+15 escalation tick at 5:30 PM also fired correctly. System works; Tyler needs to re-test now that the safety net is live (and give Jimmy a heads-up first). Two additional Switchboard fixes also shipped same commit: **Mobile/iPad call-logs viewer** now uses a master-detail pattern (Tyler couldn't see transcripts or audio on his phone before because the thread list and active pane stacked vertically with 50 thread rows above the transcript); on mobile the list and pane swap based on whether a call is selected, plus a new "All calls" back link in the active header. **Invite emails finally send** — the original `inviteUser()` only created a DB row, which is why Mike + Ty Stein still hadn't signed in 10 days after Tyler's 5/17 invites. New `sendUserInviteEmail()` in `agent-notifications.ts` fires via Resend with the sign-in link to the invitee only (not the broadcast list). Plus `scripts/send-pending-invites.mjs` is a one-off catch-up that fires emails to any user with `login_count = 0 AND invited_by IS NOT NULL`; executed this session, two emails sent (Mike + Ty Stein, Resend ids `31b39e50-...` and `582c17b3-...`). On Tyler's "can we add service@ inbox as a user" question: that won't work via the Switchboard sign-in flow because service@ is a Google Workspace alias / distribution group, not a real identity that can authenticate via OAuth. The shared inbox already receives every Claire notification email (flags, escalations, lead-captured, daily digest); for Switchboard ACCESS each person needs their own `@tzelectricinc.com` Google Workspace account. Previous session summary preserved below.

**Session 22 verified state (2026-05-27, afternoon, home laptop).** **Voice Claire is fully wired and routing leads end-to-end for the first time.** Headline this session: a critical Vapi tool-call payload parsing bug was discovered — *every* voice tool call since launch (46/46 since 2026-05-13) had been failing silently with `Unknown tool: undefined`. Claire was promising callers "I'll flag this for the office" / "I'll book your estimate" / "I'll get you a callback" but no tools were actually firing, no leads were routing to HCP, no office notifications were sending. Marina Long, Alex Sadeh, Abigail @ Central Hudson and three more recent callers walked away thinking they'd be called back and the office had no idea any of them called. Root cause: Vapi sends tool calls in OpenAI's nested format (`{ id, function: { name, arguments: <JSON string> } }`) but our parser read `call.name` and `call.arguments` at the top level — both undefined. Patched in commit `e95fe2d` with a new `extractVapiCall()` helper in `src/lib/vapi-tools.ts` that unwraps both the nested function shape and the legacy top-level fallback, and JSON-parses the string-encoded arguments. Wired into both `executeVapiToolCall` (so tools actually run) and the `tool_use` persistence in `voice/server/route.ts` (so `/switchboard/call-logs` shows real tool names + parsed args going forward). Plus three voice-prompt waves landed on top: (1) Brevity rule (CRITICAL) — match reply length to question size, 15-sec speech ceiling, stop reciting hours/numbers, stop summarizing what the caller just said; (2) Voicemail intent handler — when caller asks to leave a message, Claire invites it then stays silent for the Vapi recording, fires `flag_for_office_review` with a one-line summary so office gets the email + can play back the audio; (3) No-fake-transfers policy — never promise "please hold while I transfer you" (no warm-transfer wired); instead take info + `flag_for_office_review` for human-request branches. Commit `b647bb7` added voice prompt v2: (a) one-piece-at-a-time on structured intake (don't bundle name + phone + address); (b) always-confirm name + ask-to-spell only on ambiguous/multi-syllable/foreign-origin names; (c) voicemail hang-up cue ("Once you're finished, you can hang up and the office will get back to you"). Commit `035830d` added the after-hours emergency routing hotfix: Tyler did a test call at 4:51 PM ET with "downed wires" — Claire correctly identified the emergency and collected all the info, but called `escalate_emergency` (email-only, business-hours tool) instead of `dispatch_after_hours_emergency` (Twilio cascade to on-call tech). Two-pronged fix: (i) prompt — mission section rewritten to force `lookup_business_hours` as the first action on any emergency, then explicit branch by window; (ii) code safety net — `escalate_emergency` now detects after-hours via `classifyWindow()` and auto-triggers `dispatchAfterHoursEmergencyImpl` with mapped args (`customer_acknowledged_fees: true` forced — life-safety overrides the fee gate). Both fire belt-and-suspenders. **HCP Phone Pro routing flip COMPLETED this session.** Final Claire Flow shape: Incoming → Call hours (Mon-Fri 7:30 AM – 4:00 PM ET) → open branch routes through a Call menu with Press 1-5 each Simul-Ringing one team member (Molly / Sam / Ty / Terry / Tyler Z) then falling through to `+15186786153` (Claire); closed branch goes straight to Claire. Tyler chose to keep the press menu pattern; works fine, just different UX than Claire-first. **Six recent callers need manual office callback** because the parser bug stranded them: Marina Long (310-962-6382, called 3x), Alex Sadeh (917-576-7433, electrical work at 72 Squirrel Hill Rd Haines Falls), Abigail @ Central Hudson (845-452-2010, service upgrade at 301 Platte Clove Rd), billing caller 518-567-1275, "trying to reach Tyler" caller 845-541-6754, and 845-452-2000 — full transcripts in `/switchboard/call-logs`. Switchboard team rollout still pending — Cesar's list of names + roles needed. **One CLI gotcha:** Cesar's Vercel CLI links to `cq-marketings-projects/tz-electric` (the old project shell pre-handoff to Tyler's team), so `vercel env pull` returns only Vercel system vars and no app secrets. Workaround: use the SSD copy's `.env.local` at `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site/.env.local` which still has the full env (DATABASE_URL, Twilio keys, Vapi keys, Resend key, HCP key). Three commits this session: `e95fe2d`, `b647bb7`, `035830d`. All three locations (GitHub / SSD / Dropbox) synced via the post-commit hook. Previous session summary preserved below: Session 21 (2026-05-26) was voice routing flip prep + AI Gateway credits outage triage. Pre-launch Claire fixes + after-hours dispatch foundation shipped on 2026-05-18 (commit `b38bcb6` + `4c13a46`): natural number reading rule, mini-split range fix, small-repair fee disclosure, same-day priority dispatch ($275) branch, business hours canonicalized to 7:30 AM – 4:00 PM, hiring-inquiry redirect, "accept I don't know" rule, overhead/underground intake simplified, AND the full after-hours emergency dispatch cascade with migration 010, Twilio outbound module, on-call schedule lookup, the new `dispatch_after_hours_emergency` Claire tool, and the cron worker. **Strategic shift locked 2026-05-18:** Claire expanding from "booking agent" to "TZ AI" — one brain, multiple surfaces, role-gated tool registry, MCP wrapper deferred. See "Claire as TZ AI (architecture direction)" below.

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

**Phone-number routing strategy** (decided 2026-05-01, **REVISED 2026-05-26**):

> **REVISION 2026-05-26 (session 21).** The original assumption below ("TZ's current carrier" hosting 518-678-1230) is wrong. The number actually lives **inside HCP Phone Pro**, not an external carrier. All routing edits happen inside HCP Phone Pro's call-flow editor, which exposes a native `Forward to: an employee or external number` step type that points cleanly at our Vapi/Twilio number `+1 (518) 678-6153`. See **Session 21 deliverables** above for the current plan, the new "Claire call flow" being built in HCP, the three routing options (Option 3 / Claire-first chosen), and the pick-up plan for actually flipping the routing. Tyler doesn't need to do anything carrier-side; Cesar has HCP access and is doing the edits. The intent of the original 2026-05-01 plan (Claire as overflow + after-hours, main number unchanged externally) still holds; only the mechanism changed.

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

### Session 22 (2026-05-27, voice flip executed + critical Vapi parser fix + emergency routing safety net + 3x voice prompt waves)

Continuation of the home-laptop pickup planned at the end of session 21. Major day for Voice Claire: the flip actually happened, then a critical multi-week silent bug was discovered the moment Tyler started watching live calls. Three commits shipped: `e95fe2d`, `b647bb7`, `035830d`.

#### 1. HCP Phone Pro Claire Flow — built, saved, flipped

Worked with Dennis live in HCP Phone Pro to build out the new "Claire Flow" alongside the existing Default flow (Default stays untouched as the rollback path). Three design decisions made during the build:

- **Open-hours pattern: press menu, NOT single Simul-Ring.** Earlier conversation considered a flat 5-person Simul-Ring that rings all phones at once. Tyler reviewed and chose to keep the press menu pattern — caller hears "press 1 for Molly, 2 for Sam, 3 for Ty, 4 for Terry, 5 for Tyler," each press goes to a single-person Simul-Ring then falls through to `+15186786153` (Claire) if that one person doesn't answer. Tradeoff acknowledged: with the press menu, Claire catches more "wrong-person-pressed" misses than she would with simul-ring-all, but Tyler preferred the routing predictability.
- **Closed branch: direct to Claire.** Mon-Fri 7:30 AM – 4:00 PM ET defines open hours; everything else routes straight to `+15186786153`. No voicemail box, no press tree — Claire handles all after-hours routing internally and decides emergency vs non-emergency via her own tools.
- **HCP "Call menu" required a default-action config.** First save failed with `"Option is required and a valid number action is required"` — turned out the Call menu node needs a default action for "no-press" and "invalid-press" cases. Fixed by setting the default to Forward-to-Claire so callers who don't navigate the menu still land with her.

Final shape:

```
Incoming call → Call hours (Mon-Fri 7:30 AM – 4:00 PM ET)
    ├─ During open hours → Call menu (5 options):
    │     ├─ Press 1: Simul-Ring Molly Slater (web phone) → Forward +15186786153 → End
    │     ├─ Press 2: Simul-Ring Samuel Tigges (mobile app) → Forward +15186786153 → End
    │     ├─ Press 3: Simul-Ring Ty Stein (mobile app) → Forward +15186786153 → End
    │     ├─ Press 4: Simul-Ring Terry Evanson (mobile app) → Forward +15186786153 → End
    │     ├─ Press 5: Simul-Ring Tyler Zitz (mobile app) → Forward +15186786153 → End
    │     └─ (default / no-press / invalid) → Forward +15186786153 → End
    └─ During closed hours → Forward +15186786153 → End
```

Flip confirmed live during the session — calls landed on Claire and persisted to `tz_agent_conversations` with `channel='voice'`. Default flow remains scaffolded with the remaining 3 numbers as instant rollback.

#### 2. CRITICAL: Vapi tool-call payload parser bug (commit `e95fe2d`)

Tyler reported voice calls were landing but no leads were routing to HCP, no office notifications were firing, and Claire was promising things that never happened. Investigation via `/switchboard/call-logs` + direct DB read of `tz_agent_messages`:

```sql
SELECT COUNT(*) FILTER (WHERE tool_name IS NULL) AS null_names,
       COUNT(*) FILTER (WHERE tool_name IS NOT NULL) AS named
  FROM tz_agent_messages m
  JOIN tz_agent_conversations c ON c.id = m.conversation_id
 WHERE c.channel = 'voice' AND m.role IN ('tool_use','tool_result');
-- 46 NULL, 0 named.
```

**Every voice tool call since launch on 2026-05-13 had failed silently.** Claire was reaching the tool-use step (the model was making the right decisions), but our parser couldn't extract the tool name from the Vapi payload, so `executeVapiToolCall` returned `{ok:false, error:"Unknown tool: undefined"}` to the model every time. The model treated that as "tool not available, keep talking" and the conversation continued without any real action.

**Root cause:** Vapi sends tool calls in OpenAI's nested function-tool format:

```json
{
  "id": "call_abc",
  "type": "function",
  "function": {
    "name": "create_lead_with_estimate",
    "arguments": "{\"first_name\":\"Marina\",...}"
  }
}
```

But `src/lib/vapi-tools.ts` was reading `call.name` (undefined) and `call.arguments` (undefined). The arguments string also needed `JSON.parse()` since Vapi sends args as a string, not a parsed object.

**Fix:** new exported `extractVapiCall(call)` helper that unwraps either the nested function shape or the legacy top-level shape, and JSON-parses the arguments string. Wired into both:

1. `executeVapiToolCall` — so tools actually run with the right name + args
2. The `tool_use` `appendMessage` call in `src/app/api/agents/voice/server/route.ts` — so `/switchboard/call-logs` shows the real tool name and parsed input going forward instead of NULL/`{}`

Backwards-compatible — the legacy top-level fallback path preserved in case Vapi's payload shape changes again. Type system updated: `VapiToolCall` now includes an optional `function: { name?, arguments?: string | Record }`.

**Stranded callers:** the 46 historical failed calls cannot be retroactively executed (tools never ran, so we can't reconstruct what they should have done). Six specific callers identified from today's transcripts (12:59 PM – 1:30 PM ET, ~30 min window before the fix shipped) need manual office callback:

- **Marina Long** — 310-962-6382 (called 3x asking for status on a prior estimate)
- **Alex Sadeh** — 917-576-7433 (electrical work at 72 Squirrel Hill Rd, Haines Falls)
- **Abigail @ Central Hudson** — 845-452-2010 (service upgrade at 301 Platte Clove Rd)
- Billing caller — 518-567-1275 (asked for invoice transfer)
- "Trying to reach Tyler" caller — 845-541-6754 (billing/invoice help)
- 845-452-2000 (called 17:24, transcript in call-logs)

Full transcripts viewable in `/switchboard/call-logs`. Logged in MEMORY + this doc; office team should follow up before Monday.

#### 3. Voice prompt v1: brevity + voicemail intent + no-fake-transfers (commit `e95fe2d`, same commit as the parser fix)

Reviewing the transcripts also surfaced three conversational failure modes worth fixing now that tools actually work:

- **Wordiness.** Claire was responding in 3-5 sentences per turn for every question, reciting the office phone number and business hours multiple times per call, summarizing what the caller just told her back to them, and pre-emptively explaining policies nobody asked about. Added a "Brevity (CRITICAL)" section to the voice channel framing: match reply length to question size, one-word questions get one-sentence answers, hard ceiling 15 seconds of speech per reply, don't volunteer office number / hours / "in the meantime" filler, don't summarize.

- **Voicemail intent.** Abigail @ Central Hudson explicitly said "can I leave a message?" — Claire responded by reciting business hours instead of taking the message. Added a "Voicemail intent" section: when caller signals message-leaving intent, Claire says "Of course. Go ahead and leave your message — we're picking up everything you say…" then **stays quiet** so the Vapi recording captures the message, then fires `flag_for_office_review` with the summary so the office gets the email AND can play back the audio from `/switchboard/call-logs`.

- **Fake transfers.** Claire was saying "please hold while I transfer you now" on billing requests — but no warm-transfer mechanism exists in the system. Added an explicit "You cannot transfer calls. Do not promise transfers." section: for billing / specific-person requests, take the name + phone, call `flag_for_office_review`, set expectation of callback. For after-hours genuine emergencies use `dispatch_after_hours_emergency`. For business-hours genuine emergencies use `escalate_emergency`.

#### 4. Voice prompt v2: one-piece intake + name confirmation + voicemail hang-up cue (commit `b647bb7`)

Tyler did a test call after the v1 fix landed and reported three more issues:

- **Multi-piece responses stumble her.** When callers gave name + phone in one breath, transcription + the model sometimes whiffed. Added a "Collecting structured information one piece at a time (CRITICAL)" section: NEVER bundle "name and phone" or "name, address, and phone." Ask for ONE piece per turn, wait, process, confirm if needed, then move on. If the caller volunteers multiple pieces anyway, accept what they gave and continue with the next piece — don't re-ask.

- **Voicemail hang-up uncertainty.** Callers were staying on the line after Claire invited them to leave a message, not sure when to stop. Updated the voicemail script: "Of course. Go ahead and leave your message — we're picking up everything you say. Once you're finished with your message, you can hang up, and the office will get back to you. Take as long as you need." Plus the post-message close adds "you can hang up whenever you're ready."

- **Name misheard.** Speech-to-text was substituting letters on unusual names (Leung → Lung, Sadeh → Sade). Added a "Confirming names + when to ask for spelling" section: always repeat the name back. For common clearly-heard names (John, Sarah, Mike) just confirm briefly. For ambiguous / multi-syllable / foreign-origin / had-to-repeat names, ask the caller to spell it. Rule of thumb: if Claire would bet twenty dollars she heard it right, just confirm; if she'd hesitate, ask to spell. Concrete examples in the prompt: Sadeh / Leung / Catherine vs Kathryn → spell; John / Sarah / Mike → confirm.

#### 5. After-hours emergency routing safety net (commit `035830d`)

Tyler tested an after-hours emergency at 4:51 PM ET with a "downed wires" scenario. Claire collected name + phone + address correctly using the new one-piece intake rule, then called the WRONG emergency tool — `escalate_emergency` (which only sends an email to the office) instead of `dispatch_after_hours_emergency` (which fires the Twilio SMS + voice cascade to the on-call tech). Tyler heard nothing on his phone because the cascade never ran. Office got an email but Tyler expected the SMS+call ping as supervisor.

Two-pronged fix so emergency routing never strands an after-hours caller again:

- **Prompt rewrite** in `src/lib/agent-prompt.ts` mission section. Claire MUST call `lookup_business_hours` as her FIRST action on any identified emergency, then branch explicitly:
  - `business_hours` → `escalate_emergency`
  - `standard_after_hours` → `dispatch_after_hours_emergency`
  - `overnight` → `dispatch_after_hours_emergency` (tool handles overnight window internally)
  
  The dispatch tool is called out in the prompt as the ONLY tool that actually pages a human after-hours, with the SOP cascade ladder spelled out (T+0 / T+15 / T+30 supervisor / T+60 / T+65 customer fallback).

- **Code safety net** in `src/lib/agent-tools.ts`. Even when Claire picks `escalate_emergency` by mistake after-hours, the tool body now detects the window via `classifyWindow()` and ALSO triggers `dispatchAfterHoursEmergencyImpl` with mapped args (`issueDescription` from `reason`; `customerAcknowledgedFees: true` forced — documented choice, life-safety overrides the fee gate, tech sorts pricing on site). Both actions fire belt-and-suspenders: email goes out for office visibility AND the on-call cascade runs. Auto-dispatch failure is non-fatal and logged; email still fires regardless.

  `classifyWindow()` is now exported from `src/lib/after-hours-dispatch.ts` so the safety net uses the same DST-safe local-time logic as the primary dispatch path.

On-call rotation verified correct in DB:
- This week's tech (5/25–5/31): Jimmy Neville, 518-947-9861 ✓ matches KB section 3
- Supervisor chain seeded: Sam Tigges → Ty Stein → Tyler Zitz (Tyler is `supervisors[2]` — at T+60 final ping only)

**Important for Tyler's retest:** Jimmy's phone is the one that rings first on after-hours emergencies, not Tyler's. Tyler should verify success via `/switchboard/call-logs` (look for `dispatch_after_hours_emergency` tool-call rows) or by querying `tz_emergency_dispatches` directly. Tyler should also give Jimmy a heads-up before the next test so Jimmy doesn't think the downed-wires scenario is real.

#### 6. Users page audit + Switchboard team rollout still pending

Verified `/switchboard/users` end-to-end against the live audit log. Page is solid and battle-tested:

- Owner-only access enforced at page render and on every API route (`canManageUsers(role)` check)
- Domain allowlist enforced on invite (`@tzelectricinc.com` + `@creativequalitymarketing.com` only)
- Self-demotion blocked (an owner can't accidentally lock themselves out)
- Disabled users kicked out next request (session reads role from DB on every hit)
- Idempotent invites (re-inviting clears `disabled_at`, updates role)
- Audit log captures every action with actor + target + metadata

Audit log shows Tyler personally used the page on 2026-05-17 (invites for Mike, Ty Stein, Terry; role change for Mike) and again 35 min ago at 2:24 PM ET (permission customizations for Mike + Terry). Working in production.

Current `tz_users` state (5 active):

| email | role | logins | status |
|---|---|---|---|
| `tyler@tzelectricinc.com` | owner | 3 | active |
| `cesar@creativequalitymarketing.com` | owner | 5 | active |
| `terry@tzelectricinc.com` | office ← *should be owner per OWNER_EMAILS in code* | 1 | signed in once |
| `tstein@tzelectricinc.com` (Ty Stein) | office | 0 | invited, never signed in |
| `mike@tzelectricinc.com` | office | 0 | invited, never signed in |

**Three open follow-ups for next session:**
1. Promote Terry from "office" to "owner" to match the OWNER_EMAILS allowlist in `src/lib/auth-config.ts`. His role stayed at "office" because his row was created via invite before the OWNER_EMAILS flag took effect, and `upsertUserOnSignIn` deliberately doesn't overwrite roles on conflict.
2. Nudge Mike + Ty Stein to actually sign in at `/switchboard/login` — they have pending invites from 10 days ago that they've never activated.
3. Roll out the rest of the team. Cesar needs to send the list (names + `@tzelectricinc.com` emails + roles). Most office staff → `office`; supervisors / right-hands → `admin`. Anyone TZ wants on the Switchboard must have an `@tzelectricinc.com` Google Workspace email first (personal Gmail won't work).

#### 7. Vercel CLI auth gotcha — Cesar's account is on the OLD team

Discovered while pulling env vars on the home laptop. The current `.vercel/project.json` links to project ID `prj_wtBcaXPS6KOeXJniJroHRYnxiDtm` on `team_nSvXagrumMTVvAjEfQW5vPnw` (the original CQ Marketing team). But the live production project (post the 2026-04-28 handoff to Tyler) lives on Tyler's TZ Electric team (`team_rgs4fNAHW2dNT1fCPsjf5aVg`, owned by `tzelectricoffice@gmail.com`). The Vercel CLI logged in as `cqdesignsny` returns "No Environment Variables found" because there's an empty pre-handoff project shell still under the CQ team.

**Workaround used this session:** the SSD copy's `.env.local` at `/Volumes/CQ-PRO-4TB/CQ Marketing/TZ-Electric/TZ-Site-2026/tz-site/.env.local` still has the full env (DATABASE_URL, Twilio keys, Vapi keys, Resend, HCP) — sourced from there in shell sessions to access the live production database for transcript queries.

**Real fix for next session:** Cesar needs to be invited to Tyler's Vercel team (`tzelectricoffice@gmail.com` team) so `vercel link` + `vercel env pull` from his account both work against the live project. Until then, the SSD copy is the source of truth for env vars on Cesar's machines.

#### 8. Tasks closed + tasks carried forward

Closed: voice flip planning + execution, Vapi parser diagnosis + fix, voice prompt v1+v2, emergency routing hotfix, DB env access, users page audit.

Carried forward to next session:
- **Verify the v2 + emergency-routing hotfix on Tyler's next test call** once deploy lands. Confirm `dispatch_after_hours_emergency` actually fires after-hours (not just `escalate_emergency`), check `tz_emergency_dispatches` for new rows, confirm Jimmy gets paged.
- **Office: manually call the 6 stranded callers** before Monday (Marina Long, Alex Sadeh, Abigail, billing caller, "for Tyler" caller, 845-452-2000).
- **Switchboard team rollout** — waiting on Cesar's list.
- **Terry's role promotion** (office → owner) — quick DB update or click-through.
- **Mike + Ty Stein sign-in nudge** — they have pending invites.
- **Cesar Vercel team migration** — ask Tyler to invite Cesar to TZ Electric's Vercel team so the CLI works locally.

---

### Session 21 (2026-05-26, voice routing flip prep + Claire web outage triage)

Picked up on the SSD mid-day; paused to continue on home laptop. No code shipped this session, docs-only commit. The plan to actually flip the routing is at the end of this section ("Pick-up plan for the home laptop"). Below is what changed in our understanding and what's been staged.

#### 1. Web Chat Claire outage — Vercel AI Gateway credits exhausted

Cesar reported "Claire is not working" around 10 AM ET. Reproduced by POSTing a real conversation payload to `https://tzelectricinc.com/api/agents/web-chat/stream`. Stream returned:

```
data: {"type":"start"}
data: {"type":"error","errorText":"Free tier users do not have access to this model. Upgrade to paid credits at https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dtop-up for unrestricted access."}
data: [DONE]
```

**Root cause:** Vercel AI Gateway billing layer on the TZ Electric team rejected the request. Anthropic Sonnet 4.6 is a paid-only model on the gateway; the team's credit balance went to zero. Web chat dies on every request until credits are topped up.

**Scope:** web chat Claire only. Voice Claire at `+15186786153` was unaffected because Vapi uses Tyler's own Anthropic key on Vapi BYOK, not the AI Gateway. Public site, lead form, TZ Switchboard, Reports, Call Logs, HCP routing all unaffected.

**Fix path (no code, dashboard only):**
1. https://vercel.com → switch to TZ Electric team → AI → AI Gateway.
2. Billing → Top up. Even a small amount restores service immediately on the next request.
3. Recommended: enable auto-top-up + low-credit email alert so this doesn't recur silently.

Cesar topped up mid-session; web chat back online immediately, verified by re-running the same probe POST. The session 21 audit and routing work continued on top of the restored web chat.

**Three follow-ups carried forward (none blocking):**
- **Friendlier failure UI.** When the gateway 402s, the chat just shows the generic error UI and dies. Could fall back to "Claire is offline for a moment, call (518) 678-1230 or use the quote form" so customers get a useful message instead of a console-style error.
- **Health monitor cron.** Hourly POST to Claire that emails Tyler/Cesar on error. Catches credit dry-up from a monitor instead of from Tyler texting Cesar.
- **Vercel AI Gateway low-credit email alert.** Toggle in dashboard. Pings before zero, not after.

#### 2. HCP Phone Pro is the carrier — the original routing assumption was wrong

Original 2026-05-01 plan (still documented in the "Phone-number routing strategy" section above) assumed (518) 678-1230 lived on an outside carrier (RingCentral / Vonage / Spectrum Business / a local SIP provider) and that Tyler would log into that carrier's portal to forward calls to `+15186786153` on no-answer + after-hours.

**That plan is wrong.** Cesar opened HCP Phone Pro this session and confirmed the number lives inside HCP's own call-flow system. The current Default call flow uses HCP-native step types: `Incoming call` → `Call hours` (open vs closed branches) → `Call menu` (press tree) → `Simul-Ring` (specific staff member's mobile app / web phone) → `Send to voicemail` (HCP-internal named voicemail boxes).

**Current Default call flow (from Cesar's HCP screenshot, 2026-05-26):**

- **Open hours (M-F 7:30 AM – 4:00 PM):** 5-option press tree.
  - Press 1 → Simul-Ring Molly Slater (web phone) → voicemail `ClientCareServices_DuringB...`
  - Press 2 → Simul-Ring Samuel Tigges (mobile app) → voicemail `Sam_vmOutbound_030526`
  - Press 3 → Simul-Ring Ty Stein (mobile app) → voicemail `TyS_vmOutbound_1`
  - Press 4 → Simul-Ring Terry Evanson (mobile app) → voicemail `Terry_vmOutbound_1`
  - Press 5 → Simul-Ring Tyler Zitz (mobile app) → voicemail `Tyler_vmOutbound_1`
- **Closed hours:** 2-option press tree.
  - Press 1 → Simul-Ring Jimmy Neville (mobile app) → voicemail `OnCallTech_vmOutbound_1`
  - Press 2 → voicemail `ClientCareSercices_AfterHrs` (typo: "Sercices" not "Services" — fix while editing)
- All paths → End call.
- Total numbers attached to Default call flow: **4** (the main published number plus 3 others; identity of the other 3 TBD on home laptop).

**Implication:** every routing change is an edit inside HCP Phone Pro, not a third-party carrier portal. Cesar has HCP access; Tyler doesn't need to do anything HCP-side. This shrinks Tyler's plate dramatically.

#### 3. "Forward to external number" step type exists in HCP Phone Pro

Cesar opened `Add step` inside the new flow and confirmed HCP Phone Pro exposes a `Forward to: Forward to an employee or external number` step type. This is what unblocks all three routing options. Visible step types in HCP Phone Pro:

- `Play a greeting` (audio file or text-to-speech)
- `Forward to` (employee or external number) ← the one we need
- `Call menu` (IVR press tree)
- `Simul-Ring` (ring multiple endpoints)
- `Call queue` (place callers in queue)
- `Send to voicemail` (HCP-internal named voicemail boxes)
- (Plus `Call hours` and `Incoming call` from the flow entry-point side)

Whether `Forward to` exposes a ring-timeout knob is TBD until Cesar clicks into the step on his laptop. If yes, set 25-30 seconds. If no, the fallback voicemail still works for the case where Vapi explicitly rejects the call.

#### 4. New "Claire call flow" scaffolded in HCP (incomplete, needs rework)

Cesar started a separate flow called "Claire call flow" (not the Default call flow). Current structure per screenshot:

- Incoming call (**0 phone numbers assigned** — good, build first then attach)
- Call hours: All hours
- Simul-Ring: All available web phones ← **delete this for Option 3**
- Send to voicemail: "Thank you for calling. We ar..." (truncated)
- End call

**For Option 3 (Claire-first, recommended and chosen), the correct structure is:**

```
1. Incoming call
2. Call hours: All hours
   (Claire handles open vs closed internally via lookup_business_hours,
   so HCP doesn't need to branch)
3. Forward to: +1 (518) 678-6153
   Label: "Forward to Claire (Vapi)"
   Ring timeout: 25-30 seconds if HCP exposes the knob
4. Send to voicemail (only fires if step 3 fails, i.e. Vapi unreachable)
   Existing "Thank you for calling..." message is fine as the fallback
5. End call
```

The Simul-Ring step needs to go. If Simul-Ring fires before Forward, office phones ring before Claire ever sees the call, which is the press-tree behavior in disguise.

#### 5. Voicemail concern (Cesar flagged) — verified real, reframed as a non-issue

Cesar specifically asked whether the previous "Claire can't push callers back to HCP voicemail" concern still applied. **It does.** Vapi/Claire cannot transfer a caller back into one of HCP's named voicemail boxes (`Tyler_vmOutbound_1`, `Sam_vmOutbound_030526`, `ClientCareSercices_AfterHrs`, etc.). Those boxes are HCP-internal and not addressable by an external phone number. Once a call leaves HCP for Vapi, the audio-voicemail path is gone for that call.

**Reframe (why this is fine and arguably better):** Claire IS the voicemail upgrade. Instead of a customer leaving a rambling audio recording that someone has to play back, transcribe, and turn into an HCP record by hand, Claire holds a real conversation, captures name + phone + address + service + urgency + qualification answers, and writes the HCP estimate + Job Inbox card herself. Office still gets the same "Lead for X" notification they get today, just with structured data behind it instead of audio. The only thin case is "leave Sam a personal message" — Claire takes the same message conversationally and writes it onto the lead notes for Sam to see. v2 could add a `transfer_to_staff` tool using Vapi `transferCall` to dial the specific staff member's mobile (~2 hours of work, doesn't block launch).

#### 6. Three routing options — Option 3 (Claire-first) chosen

1. **Conservative.** Keep the press tree exactly as it is today. Replace each `Send to voicemail` step with `Forward to external number` pointing at `+1 (518) 678-6153`. Customers still press 1 through 5 for a specific person. If that person doesn't pick up, Claire catches the call instead of a voicemail recording. Pros: smallest change, press-tree muscle memory preserved. Cons: friction stays, five separate Forward-to-Claire steps to maintain, Claire doesn't know which extension the customer tried.

2. **Balanced.** Keep the press tree, but replace only the Press 1 (Client Care, Molly) path with Claire. Press 2-5 still ring Sam, Ty, Terry, Tyler directly with their individual voicemails. Closed hours: both paths to Claire. Pros: existing customers who know "Press 4 for Terry" keep that working, Client Care path (highest-volume bucket for new leads) gets the Claire upgrade. Cons: press tree friction stays.

3. **Claire-first (chosen).** Drop the press tree entirely. Every inbound call goes straight to Claire. She greets, qualifies, books leads, takes messages for specific staff if asked. Closed hours: same, plus the after-hours emergency cascade. Pros: zero friction, sounds like a smart receptionist (because she is), every call becomes a structured record. Cons: customers used to "Press 4 for Terry" can't direct-dial through the published number anymore (v2 fix available via `transfer_to_staff` tool).

#### 7. After-hours behavior audit — all green, no blockers

Re-verified end-to-end before flipping so we're not flipping Claire into an after-hours path she can't actually execute. Audit results:

| Layer | Status | Detail |
|---|---|---|
| KB SOP | ✓ Locked | `docs/agent-training-answers.md` section 3 has the full SOP: Standard After-Hours (4 PM – 10 PM, 5 AM – 7:30 AM, full cascade), Overnight (10 PM – 5 AM, single text only), non-emergency reassurance script, privacy rule, on-call rotation through Jan 2027. |
| Business hours classifier | ✓ Correct | `classifyWindow()` in `src/lib/after-hours-dispatch.ts` returns `business_hours` Mon-Fri 7:30 AM – 4 PM ET, `overnight` 10 PM – 5 AM, `standard_after_hours` for everything else. Matches SOP exactly. |
| Agent prompt | ✓ Clear | Explicit rule in `src/lib/agent-prompt.ts`: "Call lookup_business_hours first. If office_open is false AND the issue is a real emergency, use dispatch_after_hours_emergency instead of escalate_emergency." Tool selection logic is unambiguous. |
| Dispatch tool | ✓ Correct | Overnight = one SMS each to tech + supervisor, no calls, no follow-ups. Standard = T+0 SMS + voice to tech, T+15 retry, T+30 add supervisor, T+60 final, T+65 customer callback. Cron worker advances every 5 min. |
| On-call schedule DB | ✓ Live and current | Queried production Neon directly. This week (5/25 – 5/31) on-call tech: **Jimmy Neville (518-947-9861)** — matches HCP Default flow's closed-hours Press 1 exactly. Supervisors: Sam Tigges, Ty Stein, Tyler Zitz. HVAC emergency: Christopher Weiner. Plumbing emergency: Tyler Plaugher. **53 weekly tech slots seeded** through 2027-01-03. |
| Twilio env | ✓ Set | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` all encrypted in Vercel production since 13 days ago. |
| Cron worker | ✓ Scheduled | `vercel.json` has `/api/cron/dispatch-escalation` running every 5 min in production. |
| Office notification email | ✓ Wired | Every dispatch fires branded Resend email to Tyler/Terry/service@/cesar@ immediately. |

**Upgrade vs current HCP closed-hours flow:** today Press 1 rings Jimmy's HCP **mobile app** (depends on app open + notifications on); Claire calls Jimmy's actual cell number, more reliable. Today nothing escalates beyond Jimmy; Claire pulls Ty + Tyler in at T+30 if no response. Today customer decides Press 1 (urgent) vs Press 2 (not urgent) and can pick wrong; Claire triages based on what they actually describe.

#### 8. SMS deliverability concern (real, low-medium risk until A2P clears)

A2P 10DLC is in vendor review at Twilio (Cesar kicked off registration earlier this session). Pre-vetting, US carriers may throttle SMS from our Twilio 10-digit long code to consumer cells. Voice calls are unaffected (regular PSTN, not subject to A2P).

Where this matters in the cascade:
- **Standard after-hours (4 PM – 10 PM, 5 AM – 7:30 AM):** dispatch fires SMS AND voice at T+0. Even if SMS is throttled, voice rings Jimmy. Risk: low.
- **Overnight (10 PM – 5 AM):** per Tyler's SOP, ONLY SMS fires (to avoid waking the team for things that can wait until morning). If SMS is throttled, the tech might not hear anything until morning. Risk: medium-to-high until A2P clears.

**Mitigations (pick one before flipping the main number):**
1. **Smoke test.** Run `scripts/test-twilio-outbound.mjs` from `.env.local` and send a real SMS from our Twilio number to Cesar's cell. Already passed once on 2026-05-18 (SMS 201 OK, voice 201 OK). Re-running confirms current state. If it lands within 5 seconds, ship as-is.
2. **Temporarily relax overnight rule.** Add a voice call to the overnight cascade alongside the SMS, just until A2P clears. Deliberate SOP violation; text Tyler first.
3. **Add Tyler as a third overnight recipient.** Three carriers, three chances of SMS landing. Code change in `dispatchAfterHoursEmergencyImpl` overnight branch.

**Recommended:** do #1 right now. If it lands, ship as-is.

#### 9. Tyler's plate is nearly empty

Per session 20 "What Cesar wants next" list, Tyler still owed (a) HCP Business Unit UUIDs, (b) A2P 10DLC kickoff, (c) drain cleaning rate, (d) carrier-side forwarding on 518-678-1230.

Status as of session 21:
- **(a) HCP Business Unit UUIDs** — Off Tyler's plate. Cesar can grab them himself from his own HCP browser DevTools, Network tab, on any estimate-edit page's Business Unit dropdown click. Drop into Vercel env vars `HCP_BU_PLUMBING_UUID`, `HCP_BU_HVAC_UUID`, `HCP_BU_ELECTRICAL_UUID`. From then on, every Claire-booked lead auto-tags to the right department.
- **(b) A2P 10DLC kickoff** — Off Tyler's plate. Cesar kicked off registration this session. Now waiting on Twilio's 1-2 week vendor review clock. When clear, SMS Claire wire-up is ~30 minutes per the existing scaffolding.
- **(c) Drain cleaning rate** — Still open. NOT blocking voice go-live. KB has the "OPEN — answer was cut off" placeholder; Claire hand-waves with "let me have a tech get back to you on exact drain cleaning pricing".
- **(d) Carrier-side forwarding** — Moot. Number lives in HCP Phone Pro, not on an external carrier. Off Tyler's plate.

**Only Tyler-side items remaining:**
- Drain cleaning rate (content gap, low priority, can chase whenever).
- Heads-up courtesy FYI that Cesar is flipping (518) 678-1230 to Claire. Draft in Cesar's working notes (short version: "Flipping (518) 678-1230 onto Claire today via HCP Phone Pro. Press tree goes away. Direct-dial still works through HCP mobile app + individual cells. Keeping Default flow intact for 48 hr rollback. Drain cleaning rate when you have 2 min: what's the typical charge?").

---

### Pick-up plan for the home laptop (session 21, continued)

Read this first when picking up on the laptop. All work is on Cesar's plate; nothing is blocked on Tyler. Order matters for safety (smoke tests before flipping the live number).

**Environment refresher.** On the laptop, home directory is `cqmarketing` not `cqstudio`. Dropbox path becomes `/Users/cqmarketing/Library/CloudStorage/Dropbox/TZ Electric Inc/TZ-Site-2026/tz-site` (or whatever the local Dropbox root is). The SSD is on the desktop and not relevant from the laptop. The laptop just clones / pulls from GitHub or works directly out of Dropbox.

```bash
# Pull latest first
git -C "<repo path>" pull
# Or fresh clone
git clone https://github.com/cqdesignsny/tz-electric.git
cd tz-electric
npm install
vercel link        # pick TZ Electric team → tz-electric project
vercel env pull .env.local --yes
```

**Step 1. Run Twilio SMS smoke test.** Confirms outbound SMS works pre-A2P. Sub-minute task.

```bash
cd tz-site
# Confirm the exact filename and flags first:
ls scripts/ | grep -i twilio
# Then run with Cesar's own cell as target. Example:
node scripts/test-twilio-outbound.mjs --to "+1XXXXXXXXXX"
```

Expected: SMS lands within 5 seconds, voice call rings shortly after. If both land, ship the overnight branch as-is. If SMS doesn't land, apply mitigation #2 or #3 from "SMS deliverability concern" above before flipping.

**Step 2. Finish building Claire call flow in HCP Phone Pro.**
1. Open the Claire call flow in HCP Phone Pro.
2. **Delete the Simul-Ring step** ("All available web phones").
3. **Add a `Forward to` step** between `Call hours` and `Send to voicemail`. Target: `+1 (518) 678-6153`. Label: "Forward to Claire (Vapi)". Ring timeout: 25-30 seconds if exposed.
4. **Keep the Send to voicemail step** behind Forward as the fallback (only fires if Vapi unreachable). Existing "Thank you for calling..." message is fine.
5. Save.

**Step 3. Identify and reserve a test number.** Default call flow has 4 numbers attached. Almost certainly one is (518) 678-1230 published and the other 3 are some combination of: fax line, tracking number, department line, second location number. From the HCP number-management UI, identify the lowest-traffic one and confirm with Tyler if unsure. That's the test target.

**Step 4. Detach test number from Default call flow, attach to Claire call flow.** Atomic operation in HCP. Takes seconds.

**Step 5. Smoke test the test number from Cesar's cell.** Walk through a realistic booking conversation:
- Greet, ask about a service ("Hi, I need help with my electrical panel").
- Provide name + address when Claire asks.
- Confirm interest in a free estimate.
- Hang up.

Within 60 seconds, verify all four landing spots:
- New row in `/switchboard/lead-pipeline` for Cesar's name.
- HCP `Estimate for Cesar` appears with `lead_source: "CSR AI"` and full option notes.
- HCP `/leads` inbox card appears.
- Office Resend email fires to the configured recipients.

**Step 6. Smoke test after-hours emergency on the test number.** This is the critical leg before flipping the main number. Call the test number after 4 PM ET (or before 7:30 AM ET). Pretend to be a customer with a real emergency: "Hi, I have no heat and it's freezing in the house, my kids are home." Listen for Claire to:
- Classify as standard_after_hours (or overnight if late enough).
- Ask SOP intake questions (name, address, callback phone, brief description, safety concerns, who's home).
- Confirm the after-hours dispatch fee with you.
- Read back "I've alerted Jimmy, he should be calling you within 10 to 15 minutes" (or the overnight version).

Then verify within 60 seconds:
- Jimmy (518-947-9861) actually received both an SMS AND a voice call from our Twilio number.
- New row in `tz_emergency_dispatches` with `status = open` and `next_attempt_at` set 15 minutes out.
- Office email fires with red emergency styling.

If yes, all four legs confirmed working in production (web chat, voice booking, voice emergency standard, voice emergency overnight). If you only have time to test one window, test standard_after_hours (4-10 PM); overnight is the same code path with a different branch.

**Step 7. Flip (518) 678-1230 from Default call flow to Claire call flow.** Same atomic detach + attach as step 4. After this, the published main number is on Claire.

**Step 8. Text Tyler the FYI.** Draft in Cesar's working notes from earlier this session. Short version:

> Flipping (518) 678-1230 onto Claire today via HCP Phone Pro. Press tree goes away. Every inbound call goes straight to Claire (smart receptionist), she greets, qualifies, books leads into HCP, and dispatches after-hours emergencies through the on-call cascade we wired in May. Direct office reachability for known customers still works through the HCP mobile app and team's individual cells. Keeping Default call flow intact for 48 hr as one-click rollback. Drain cleaning rate when you have 2 min: what's the typical charge?

**Step 9. Leave Default call flow intact for 48 hours.** One-click rollback: detach (518) 678-1230 from Claire call flow, reattach to Default. ~30 seconds. Only delete the Default flow once we have 48 hours of clean traffic on Claire.

**Step 10. Fix HCP typo while in HCP.** `ClientCareSercices_AfterHrs` → `ClientCareServices_AfterHrs`. Two-second edit, free win.

**Step 11. Grab HCP Business Unit UUIDs.** Cesar's own HCP browser DevTools. Path:
1. Open any estimate in HCP, click Edit.
2. Right-click anywhere → Inspect → Network tab.
3. Click the Business Unit dropdown on the estimate.
4. Look for a request like `/business_units` (or similar in the same domain). The response body has the UUIDs for Plumbing / HVAC / Electrical.
5. Drop into Vercel:
   ```bash
   vercel env add HCP_BU_PLUMBING_UUID production --value '<uuid>' --yes
   vercel env add HCP_BU_HVAC_UUID production --value '<uuid>' --yes
   vercel env add HCP_BU_ELECTRICAL_UUID production --value '<uuid>' --yes
   ```
6. Trigger a redeploy (auto-fires on env-var change). From then on every Claire-booked lead auto-tags to the right department in HCP.

**Step 12. End-of-session sync.** Update HANDOFF + MEMORY with what shipped today and any new gotchas discovered. Commit. The post-commit hook will propagate to GitHub + the other mirror.

**Optional follow-ups (not blocking):**
- Friendlier web-chat failure UI for AI Gateway credit-exhaustion case.
- Health monitor cron that POSTs to Claire hourly and emails on error.
- Vercel AI Gateway low-credit email alert toggle.
- v2 `transfer_to_staff` Vapi tool so Claire can direct-dial Sam / Ty / Terry / Tyler when callers ask for them by name.

---

### Session 20 deliverables (2026-05-18, pre-launch Claire fixes + after-hours dispatch + architecture lock-in)

Big sweep covering everything Tyler flagged from his first round of voice test calls (2026-05-13/14 Slack messages), his new after-hours SOP (`TZ_Electric_After_Hours_SOP.md` in the shared Drive, dated today), and the 2026-05-15 marketing meeting where Tyler outlined the full "Claire as TZ AI" wishlist. Shipped:

- [x] **Voice content fixes — Tyler's feedback batch (commit `b38bcb6`).** Seven discrete edits land in one sweep: (1) Voice channel framing in `agent-prompt.ts` now has an explicit "How to say numbers out loud (CRITICAL)" block that forces natural reading for BTUs, dollar amounts, ranges, quantities, square footage, ages, model years, and service amperage. Digit-by-digit is reserved for phone numbers, email addresses, and PO-box style addresses. (2) Mini-split single-zone install range added to KB section 1 at `$5,500–$9,000` (Claire was hallucinating `$3,500–$9k` because there was no range in the KB at all). (3) New "Small-Repair Pricing Disclosure (Critical)" rule in agent-prompt: never quote a flat number for a known small repair (light fixture swap, outlet, GFCI, smoke detector, breaker). Always disclose the Field Assessment or Diagnostic fee + parts on top, then offer the free estimate. (4) New "Same-Day Priority Dispatch ($275, Critical)" rule for non-emergency urgent jobs during business hours, distinct from after-hours emergency. (5) Business hours canonicalized to **7:30 AM – 4:00 PM** per the new SOP — `lookupBusinessHoursImpl` rewritten with minute resolution + after-hours-window classifier (`business_hours` / `standard_after_hours` / `overnight`). Section 7 of KB clarifies office hours vs estimate-appointment hours (estimates still 9 AM earliest per the scheduling policy). (6) New "Hiring & Career Inquiries" rule in agent-prompt + new KB section: warm redirect to `/careers`, never `create_lead_with_estimate`, never escalate. (7) New "Accept I Don't Know Without Drilling" rule: customers can say "not sure" to any qualification question and Claire moves on, no re-asking in different words. Form-config simplified for overhead/underground: second question always shows for Panel upgrade scope, includes "No preference / not sure" option.

- [x] **After-hours emergency dispatch built end-to-end (commit `b38bcb6`, schema-hotfix `4c13a46`).** Implements Tyler's 2026-05-18 SOP doc as a real cascade, not just an email notification:
  - Migration `010_add_after_hours_dispatch.sql` adds three tables: `tz_on_call_schedule` (date-bound tech + always-on supervisor chain), `tz_emergency_dispatches` (each open emergency with `time_window` + `next_attempt_at` + `next_attempt_no`), `tz_dispatch_attempts` (per-attempt audit log with unique index for idempotency).
  - `src/lib/twilio-outbound.ts` wraps Twilio Messages + Calls REST endpoints (no SDK dep, basic auth via existing env vars). Voice calls use inline TwiML `<Say>` with Amazon Polly Joanna-Neural.
  - `src/lib/on-call.ts` exposes `getOnCall(role, at)` (date-bound lookup, falls back to null if rotation not seeded for the date) and `getSupervisorChain()` (always-on Ty / Sam / Tyler chain ordered by row id).
  - `src/lib/after-hours-dispatch.ts` implements two things. `dispatchAfterHoursEmergencyImpl()` is the new Claire tool body — classifies the window from local NY time, rejects business-hours calls, opens the dispatch row, fires T+0 SMS + voice to the on-call tech (overnight: one text each to tech + supervisor with no follow-ups), returns a customer-facing confirmation message Claire reads back. `runEscalationTick()` is the cron worker body — walks open dispatches with `next_attempt_at <= now`, fires the next-due step (T+15 retry, T+30 add supervisor, T+60 final, T+65 customer "team tied up" callback), closes the dispatch as `closed_no_response` if nothing resolved.
  - `dispatch_after_hours_emergency` registered in `agent-tools.ts`. Vapi automatically picks it up via the existing `vapi-tools.ts` adapter, so voice Claire gets it on the next call without Vapi-side config.
  - `/api/cron/dispatch-escalation` cron handler runs `runEscalationTick()`. Wired into `vercel.json` at `*/5 * * * *` (every 5 minutes; Vercel Pro plan supports sub-daily cron frequency).
  - `scripts/seed-on-call-schedule.mjs` parses the KB calendar in section 3 and inserts rows into `tz_on_call_schedule`. Run once after migration. Reseed after any rotation swap by editing the KB calendar and re-running.
  - **Reserved-keyword hotfix:** initial migration used `window` as a column name, which is a PostgreSQL reserved keyword (for window functions). Migration failed on apply, renamed to `time_window` across the schema + dispatch impl + cascade worker + HANDOFF reference, applied cleanly on the second attempt.
  - Migration applied against production Neon. Seed script ran successfully: 3 supervisors (Sam Tigges, Ty Stein, Tyler Zitz), 53 weekly tech rotation slots covering the full year, 2 HVAC/plumbing emergency contacts (Christopher Weiner, Tyler Plaugher). This week (5/18–5/24) on-call is **Nick Neville**.

- [x] **Twilio outbound smoke test (commit `9830b9f`).** New `scripts/test-twilio-outbound.mjs` fires a single SMS (and optionally a voice call) to verify outbound integration is live before the first real dispatch. Ran against Cesar's cell 2026-05-18: SMS 201 OK, Voice 201 OK. The real dispatch path will fire successfully on day one of routing.

- [x] **Claire-as-TZ-AI architecture lock-in (HANDOFF + memory).** New section in this doc (above) captures the strategic shift from "customer-facing booking agent" to "TZ AI" with multiple surfaces (customer, admin, office staff, tech SMS, training mode), role-gated tool registry, right-side slide-out chat in the TZ Switchboard. MCP wrapper deferred until after in-app surfaces stabilize. Decision drivers: (1) Tyler is the bottleneck — solving his admin-chat use case unlocks the most velocity; (2) hard work is the tool layer and the in-app surfaces stress-test it harder than a Tyler-only MCP; (3) Tyler doesn't use Claude Code currently so MCP would require Cesar-side setup. Four new auto-memory entries: `project_claire_as_tz_ai.md`, `project_after_hours_dispatch.md`, `feedback_business_hours_canonical.md`, `feedback_voice_number_reading.md`.

- [x] **Tyler outbound message sent.** Cesar wrote Tyler with the full list of fixes, the after-hours SOP build, what he needs to do for go-live (carrier-side forwarding), and the still-pending items from his plate (HCP Business Unit UUIDs, A2P 10DLC kickoff, drain cleaning rate confirmation). Tyler also flagged this morning that the team Switchboard invite emails aren't landing — that's the next thing to investigate when sessions resume.

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

### Next on deck (post session 20)

1. ~~**Web chat Claire**~~ — **DONE** (2026-05-01). Live at `/claire`.
2. ~~**Voice Claire via Vapi**~~ — **DONE** (2026-05-13). Live at `+15186786153`.
3. ~~**After-hours emergency dispatch cascade**~~ — **DONE** (2026-05-18). Real Twilio SMS + voice cascade per Tyler's SOP, T+0/15/30/60 escalation, overnight short-circuit, customer fallback at T+60. Verified live via smoke test.
4. **Switchboard invite emails investigation (small, next session opener).** Tyler flagged 2026-05-18 morning that team invites aren't landing. Resend log check + verify domain auth + fix the trigger. Probably 20-30 minutes once the dashboard is open.
5. **In-app Claire (the major arc).** Refactor `agent-prompt.ts` from per-channel branching to layered `buildPrompt({ surface, role, user, context })`. Build a proper tool registry abstraction with role-gating and destructive-action confirmation. Ship the right-side slide-out chat panel in the TZ Switchboard. Wire the admin chat surface first (`update_kb_section`, `set_on_call_today` are the two starter tools — Tyler is the bottleneck, admin chat unblocks him most). Office chat surface second. Tech SMS third. Training mode fourth. Multimodal fifth. QC auditor sixth. MCP wrapper seventh. See "Claire as TZ AI (architecture direction)" section above for the full plan.
6. **SMS Claire (still vendor-blocked).** Scaffolding fully shipped end of session 14. Only A2P 10DLC carrier review remains (1-2 weeks once Tyler kicks it off in his Twilio console). **Cutover when vendor unblocks**: replace one TODO block in `src/app/api/agents/sms/webhook/route.ts` with a `generateText({...})` call (mirror the web-chat route's pattern: gateway() wrapper, prompt caching, system prompt as `SystemModelMessage` with Anthropic ephemeral cache, `MAX_OUTPUT_TOKENS` cap, gateway user/tags). Point Twilio messaging webhook at the existing route (already done). Cost expectation: ~$120-150/mo SMS + per-conversation tokens.
7. **Tech response acknowledgment on after-hours dispatch.** Right now the cron worker blindly escalates through the cascade. Add inbound-SMS handling so a tech reply like "ON IT" or "OK" marks the dispatch `status='resolved_tech_responded'` and stops further escalation. Twilio webhook scaffolding already exists at `/api/agents/sms/webhook` — reuse it.
8. **Vapi `<Dial>` bridge for tech-customer call.** Today the privacy rule is honored by having the tech call the customer outbound. A bridge dial would let the tech accept the inbound dispatch call from Twilio and be live with the customer in one step, still without exposing their personal number.
9. **Blogs back on the site.** Code is ready, nav was hidden during the agent push. Cesar flagged this in the 2026-05-15 meeting.
10. **Reports R2/R3/R4.** Phase R1 reports already shipped. R2 = HCP Won/Lost integration (close rates by channel), R3 = ad-cost integration via Google/Meta APIs (CPL / CPA / ROAS), R4 = per-channel agent reporting.

**Reusable across channels:** voice, SMS, and web chat share `agent-prompt.ts` (KB + persona + voice + security + mission + per-channel framing), `agent-tools.ts`, and `agent-conversations.ts`. The web-chat route is the reference implementation for AI Gateway wiring + prompt caching + abuse guardrails — copy its shape for the SMS model wire-up.

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

Original launch list + the voice routing flip are all checked off as of session 22 (2026-05-27). New priorities in order:

1. **Verify the session-22 hotfixes on Tyler's next test call.** Three things to confirm once Vercel finishes deploying commit `035830d` (~3 min after push): (a) `dispatch_after_hours_emergency` actually fires after-hours — query `tz_emergency_dispatches` for new rows + verify Jimmy Neville's phone gets paged at T+0; (b) brevity rule is taking effect — Claire's replies are noticeably shorter, no more reciting hours/office number multiple times; (c) voicemail intent works — caller asks "can I leave a message?" → Claire invites + stays quiet for the recording + fires `flag_for_office_review` afterward. Use `/switchboard/call-logs` (tool-call rows now show real tool names + parsed args thanks to the parser fix) or direct DB query.
2. **Office: manually call the 6 stranded callers** before Monday. They got broken promises from Claire because of the parser bug. List with phone numbers in session 22 deliverables above. Full transcripts in `/switchboard/call-logs`.
3. **Switchboard team rollout.** Cesar needs to send Tyler the list of remaining team members to invite (names + `@tzelectricinc.com` emails + roles). Users page is verified working. Most office staff → `office` role; supervisors → `admin`. Anyone TZ wants on the Switchboard needs an `@tzelectricinc.com` Google Workspace email first.
4. **Terry's role promotion** (office → owner). Quick task: he's in OWNER_EMAILS but his DB row is still `office` from when he was first invited.
5. **Mike + Ty Stein invite nudge.** They have pending invites from 10 days ago and haven't signed in. Text them the `/switchboard/login` URL.
6. **Cesar to Vercel team migration.** Cesar's CLI is on `cq-marketings-projects` (old, pre-handoff). Ask Tyler to invite `cqdesignsny@gmail.com` to TZ Electric's Vercel team so `vercel link` + `vercel env pull` work from Cesar's machine. Until then the SSD copy's `.env.local` is the source of truth for env on Cesar's side.
7. **Cesar's own follow-throughs from session 21:** grab HCP Business Unit UUIDs from HCP browser DevTools and drop into `HCP_BU_*_UUID` Vercel env vars; fix the `ClientCareSercices` typo in HCP while in there.
8. **Tyler still owes us:** (c) confirm drain cleaning rate (KB has an "OPEN — answer was cut off" placeholder; not blocking anything live). That's it.
9. **AI Gateway credit hardening (session 21 outage follow-up).** Three items: friendlier failure UI on web chat when gateway 402s, hourly health-monitor cron that emails on Claire-down, enable the Vercel AI Gateway low-credit email alert in the dashboard. Cheap wins, prevent silent re-occurrence.
10. **In-app Claire (the major arc).** Strategic shift locked in session 20. Refactor agent-prompt.ts into a layered builder, build the tool registry abstraction, ship the right-side slide-out chat in the TZ Switchboard, wire the admin chat surface first. See "Claire as TZ AI (architecture direction)" section above. Tyler is the bottleneck and admin chat unblocks him most.
11. **SMS Claire model wire-up** once A2P 10DLC clears (1-2 weeks from session 21's kickoff). One TODO block to replace, ~30 minutes of work plus a smoke test.
12. **Tech response acknowledgment + Vapi `<Dial>` bridge** as post-launch polish on the after-hours cascade once it's seen real traffic.
13. **v2 Claire voice tool: `transfer_to_staff`** so when a caller asks "I need Sam directly" Claire can dial Sam's mobile via Vapi `transferCall`. ~2 hours of work. Worth doing after a few weeks of Option 3 traffic to see if customer demand for direct-dial is real.
14. **Blogs back on the site.** Code is ready, just need to flip the nav back on after the agent push lands.
15. **Reports R2/R3/R4.** HCP Won/Lost integration → close rates by channel, ad-cost integration → CPL/CPA/ROAS, per-channel agent reporting.

The TZ Switchboard is Tyler's permanent operational backend. Every future agent (email assistant, office ops, warehouse, sales, marketing) ships as a new module — or, increasingly, as a new Claire surface inside the existing slide-out chat. The customer-facing persona stays Claire across voice, SMS, web chat. Internal Claire (admin, office, tech, training) uses the same persona to keep one trust signal.
