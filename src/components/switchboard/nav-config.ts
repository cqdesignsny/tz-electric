export type NavStatus = 'active' | 'soon' | 'planned'

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
        label: 'Lead Pipeline',
        slug: 'lead-pipeline',
        status: 'soon',
        tagline: 'Every lead, end to end.',
        overview:
          "A live view of every lead the AI captured — voice calls, SMS, web chat, and form fills — with where it came from and where it ended up. Tyler can see the funnel in real time without logging into HCP.",
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
        status: 'soon',
        tagline: 'Calls, leads, jobs, and conversions at a glance.',
        overview:
          "Plain-English reports on what the agents are doing and how they're performing. Daily, weekly, and monthly views without spreadsheets.",
        willDo: [
          'Calls handled, missed, escalated to a human',
          'Leads captured and converted, by source',
          'Average response time, per channel',
          'Revenue attribution per agent and channel',
        ],
        needs: ['Lead Pipeline live', 'Agent run history stored'],
      },
      {
        label: 'Employee Training',
        slug: 'employee-training',
        status: 'planned',
        tagline: 'Staff onboarding, powered by Trainual.',
        overview:
          "TZ uses Trainual for staff onboarding and ongoing training. The Switchboard ties it in so Tyler can see who's caught up, who's behind, and assign new tracks without bouncing between apps.",
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
        label: 'Agent Training',
        slug: 'agent-training',
        status: 'active',
        tagline: 'Discovery questionnaire that feeds the knowledge base.',
      },
      {
        label: 'Knowledge Base',
        slug: 'knowledge-base',
        status: 'soon',
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
        status: 'soon',
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
        status: 'soon',
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
        status: 'soon',
        tagline: 'Chatbot conversations from tzelectricinc.com.',
        overview:
          'Live chat sessions from the public site. Same takeover-by-human flow as SMS. Replaces the old Podium webchat with a CQ-built version that integrates with the rest of the Switchboard.',
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
          "AI-driven outbound. Service follow-ups, review requests, seasonal reminders, re-engagement campaigns — all running automatically without manual work.",
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
