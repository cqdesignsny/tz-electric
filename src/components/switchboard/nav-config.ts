// 'active' = needs the user to act (e.g. fill out a questionnaire)
// 'live' = built and operational, no action required
// 'soon' = next in the buildout queue
// 'planned' = on the roadmap, not yet started
export type NavStatus = 'active' | 'live' | 'soon' | 'planned'

export type NavItem = {
  label: string
  slug: string
  status: NavStatus
  tagline: string
  overview?: string
  willDo?: string[]
  needs?: string[]
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export function navHref(item: NavItem): string {
  return item.slug ? `/switchboard/${item.slug}` : '/switchboard'
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Operations',
    items: [
      {
        label: 'Dashboard',
        slug: '',
        status: 'active',
        tagline: 'Overview, status, and recent activity.',
      },
      {
        label: 'User Access',
        slug: 'users',
        status: 'live',
        tagline: 'Manage who has access to the TZ Switchboard.',
        overview:
          'Owners (Tyler, Terry) can invite, promote, demote, or disable users. Sign-in is via Google Workspace; roles are owner, admin, office, or viewer.',
        willDo: [
          'Invite new users by @tzelectricinc.com email',
          'Promote / demote between owner, admin, office, viewer',
          'Disable accounts immediately on the next page load',
          'Show last sign-in time per user',
        ],
        needs: [],
      },
      {
        label: 'Follow-Ups',
        slug: 'follow-ups',
        status: 'live',
        tagline: 'Everyone Claire flagged for a callback, in one place.',
        overview:
          "The live, always-on version of the end-of-day recap email. Every callback Claire flagged (a message for a specific staffer, or a general office flag) shows here, grouped by who it's for, until someone marks it handled. Anyone with access can open it any time and see who still needs a call back without digging through email. Owner, admin, and office.",
        willDo: [
          'Open callbacks grouped by the person they were flagged for, plus a general office bucket',
          'Customer name, click-to-call number, Claire\'s note, time, and a deep link to the conversation',
          'One-click "Mark done" to clear an item as it gets handled (and reopen if needed)',
          'Pairs with the 6 PM recap email — the email nudges, this board is the live list',
        ],
        needs: [],
      },
      {
        label: 'Lead Pipeline',
        slug: 'lead-pipeline',
        status: 'live',
        tagline: 'Every lead, end to end.',
        overview:
          "A live view of every lead the AI captured across voice calls, SMS, web chat, and form fills, plus where it came from and where it ended up. Tyler sees the funnel in real time without logging into HCP.",
        willDo: [
          'Capture from voice, SMS, web chat, and the native lead form',
          'Tag source (paid, organic, referral, manual)',
          'Push qualified leads into Housecall Pro automatically',
          'Show conversion: lead → quoted → won → installed',
        ],
        needs: ['Voice agent live', 'SMS agent live', 'Web chat live', 'Native lead form built'],
      },
      {
        label: 'Reports',
        slug: 'reports',
        status: 'live',
        tagline: 'Lead volume, channel mix, service mix, and Claire health.',
        overview:
          "Daily, weekly, and monthly view of every lead and every Claire conversation. Reads from Neon (tz_leads + tz_agent_conversations) so it's fast and reflects whatever's in HCP without needing a refresh.",
        willDo: [
          'Lead volume per day, stacked by attribution channel',
          'Channel breakdown: paid, organic, referral, direct (with pipeline value)',
          'Service mix: HVAC, Mini-Split, Electrical, Generator, Plumbing, etc.',
          'Claire conversation health: total, captured contact, booked a lead, no-contact-captured',
          'Conversations to review: visitors who chatted but never shared info, so the office can audit',
          'Daily digest email at 8 AM ET to office team',
          'CSV export of every lead in the period',
        ],
        needs: [],
      },
      {
        label: 'Marketing Reports',
        slug: 'marketing-reports',
        status: 'live',
        tagline: 'CQ marketing performance: traffic, search, ads, social.',
        overview:
          'The marketing report CQ Signal sends, newest first. Website traffic (GA4), Search Console, Google Ads, organic social, Core Web Vitals, and recommendations across 7-day, 30-day, 90-day, and 12-month windows.',
      },
      {
        label: 'Cost Analysis',
        slug: 'cost-analysis',
        status: 'live',
        tagline: 'What Vapi + Claire + 11labs actually cost, and where.',
        overview:
          "Per-call cost breakdown for every voice call, plus daily burn, projected monthly spend, and the top expensive calls. Reads from tz_voice_call_costs (populated from Vapi's end-of-call-report) so the record survives Vapi's 14-day retention window. Owner + admin only.",
        willDo: [
          'Total spend, projected monthly, cost per call, cost per minute',
          'Breakdown by component: Vapi platform fee, LLM, STT, post-call analysis',
          'Daily burn trend',
          'Top 10 most expensive calls with deep links to call logs',
          '11labs TTS character count + estimated cost on Creator vs Pro plan',
        ],
        needs: [],
      },
      {
        label: 'After-Hours Dispatch',
        slug: 'after-hours',
        status: 'live',
        tagline: 'Every after-hours emergency, who we paged, and whether it got through.',
        overview:
          "When a customer reports an emergency after hours, Claire runs the dispatch cascade — texting and calling the on-call tech, escalating to the supervisor, and calling the customer back if no one responds. This page shows each emergency and its full attempt ladder with the REAL delivery status of every text and call (delivered, failed, error code), so the office can confirm the tech was actually reached instead of assuming. Owner + admin only.",
        willDo: [
          'One card per after-hours emergency with customer, issue, and status',
          'Full attempt ladder: T+0 / T+15 / T+30 (supervisor) / T+60 (customer callback)',
          'Real per-attempt delivery status from Twilio (delivered / failed + error code)',
          'Surfaces SMS carrier rejections (e.g. 30034) that used to be invisible',
        ],
        needs: [],
      },
      {
        label: 'Employee Training',
        slug: 'employee-training',
        status: 'planned',
        tagline: 'Staff onboarding, powered by Trainual.',
        overview:
          "TZ uses Trainual for staff onboarding and ongoing training. The TZ Switchboard ties it in so Tyler can see who's caught up, who's behind, and assign new tracks without bouncing between apps.",
        willDo: [
          'Single sign-on or one-click link out to Trainual',
          'Track completion rates per role',
          'Assign training tracks for new hires',
          'Reminders for overdue lessons',
        ],
        needs: ['Trainual account active', 'API or embed access from Trainual'],
      },
    ],
  },
  {
    label: 'AI Agents',
    items: [
      {
        label: 'Talk to Claire',
        slug: 'agent-training',
        status: 'live',
        tagline: 'Chat with Claire to edit the KB and review her daily learning reports.',
        overview:
          'The living interface for keeping Claire sharp. Tyler / Terry / Cesar talk to Claire conversationally to read and edit the knowledge base, browse her nightly self-improvement reports, and look up specific calls. Every KB edit goes through a propose then approve flow so nothing changes without sign-off. Owner + admin only.',
        willDo: [
          'Edit any KB section by asking Claire in plain English',
          'Browse the last 14 nightly self-improvement reports',
          'Search recent conversations by keyword',
          'Apply proposed prompt rules and KB additions with one click',
        ],
        needs: [],
      },
      {
        label: 'Knowledge Base',
        slug: 'knowledge-base',
        status: 'live',
        tagline: 'The brain every AI agent reads from.',
        overview:
          'Editable source of truth that every agent (voice, SMS, chat, email) consults before responding. Built initially from the Agent Training questionnaire, then maintained over time as TZ evolves.',
        willDo: [
          'Search and edit entries: services, pricing, hours, FAQs, escalation rules',
          'Version history with one-click rollback',
          'Test an answer against the live agents before saving',
          'Tag entries by which agent uses them',
        ],
        needs: ['Agent Training questionnaire submitted', 'Anthropic API access'],
      },
      {
        label: 'Call Logs',
        slug: 'call-logs',
        status: 'live',
        tagline: "Every call the AI answered, with audio and transcript.",
        overview:
          "Audio recording, full transcript, and the agent's reasoning for every call. Tyler can spot-check anything that felt off and tune the agent in minutes.",
        willDo: [
          'Recording playback and full transcript',
          'Outcome tagging: booked, transferred, missed, callback',
          'Star or flag calls for review',
          'Search by phone, customer, or outcome',
        ],
        needs: ['Vapi voice agent live', 'Twilio number provisioned'],
      },
      {
        label: 'SMS Conversations',
        slug: 'sms-conversations',
        status: 'active',
        tagline: 'Inbound texts, AI replies, one-click takeover.',
        overview:
          "Every inbound SMS and every AI reply, threaded by phone number. A one-click button lets Tyler or office staff jump in and take over the thread when needed.",
        willDo: [
          'Threaded conversation view',
          'Real-time view of incoming messages',
          'Manual takeover with one click',
          "Auto-handoff on keywords like 'manager' or 'lawsuit'",
        ],
        needs: ['Twilio number with A2P 10DLC registration', 'SMS agent built'],
      },
      {
        label: 'Web Chat',
        slug: 'web-chat',
        status: 'live',
        tagline: 'Chatbot conversations from tzelectricinc.com.',
        overview:
          'Live chat sessions from the public site. Same takeover-by-human flow as SMS. Replaces the old Podium webchat with a CQ-built version that integrates with the rest of the TZ Switchboard.',
        willDo: [
          'Live thread view with visitor context',
          'See what page they came from and what services they viewed',
          'Manual takeover at any time',
          'Lead capture form when the visitor goes idle',
        ],
        needs: ['Web chat widget built', 'Anthropic API key', 'Lead Pipeline integration'],
      },
    ],
  },
  {
    label: 'Future Agents',
    items: [
      {
        label: 'Email Assistant',
        slug: 'email-assistant',
        status: 'planned',
        tagline: "Tyler's AI inbox: classify, draft, route.",
        overview:
          "An AI that reads Tyler's inbound email, classifies it (lead, customer, vendor, internal, junk), drafts a reply in his voice, and routes it to the right person. Tyler approves with one click.",
        willDo: [
          'Auto-classify every email',
          "Draft replies in Tyler's voice",
          'Route customer emails to the office automatically',
          'Flag urgent items and summarize long threads',
        ],
        needs: ['Gmail or Microsoft 365 API access', 'Anthropic API key', "Sample emails for Tyler's voice"],
      },
      {
        label: 'Office Operations',
        slug: 'office-operations',
        status: 'planned',
        tagline: 'AI for the people who run the office.',
        overview:
          'Backend agent for office staff. Quick customer lookups, schedule queries, internal Q&A. Cuts the time staff spend hunting in HCP and email.',
        willDo: [
          'Customer lookup ("everything we have on Sarah Chen")',
          'Schedule queries ("who\'s free Thursday afternoon?")',
          'Quick-quote helpers and policy answers',
          'Internal knowledge: pricing rules, process docs',
        ],
        needs: ['HCP API integration', 'Knowledge Base online'],
      },
      {
        label: 'Warehouse & Inventory',
        slug: 'warehouse-inventory',
        status: 'planned',
        tagline: 'Parts in, parts out, on a phone.',
        overview:
          'Inventory tracking and parts lookup for the bay. Voice or SMS agent for techs in the field who need to check stock or order something without calling the office.',
        willDo: [
          'Live parts inventory by location',
          'Tech-friendly SMS or voice lookups ("do we have a 200-amp panel?")',
          'Reorder triggers when stock drops',
          'Job-to-parts pairing for accurate costing',
        ],
        needs: ['Inventory data source', 'SMS agent live', 'Tech accounts in HCP'],
      },
      {
        label: 'Sales & Outbound',
        slug: 'sales-outbound',
        status: 'planned',
        tagline: 'Outbound sequences, review requests, follow-ups.',
        overview:
          'AI-driven outbound. Service follow-ups, review requests, seasonal reminders, re-engagement campaigns. All running automatically without manual work.',
        willDo: [
          'Auto-trigger review requests after a job closes',
          'Seasonal campaigns (AC tune-up in spring, generator service in fall)',
          'Re-engagement for dormant customers',
          'A/B test message variants',
        ],
        needs: ['SMS agent live', 'Email Assistant live', 'HCP customer sync'],
      },
    ],
  },
]

export function findItemBySlug(slug: string): NavItem | undefined {
  return NAV_SECTIONS.flatMap((s) => s.items).find((item) => item.slug === slug)
}
