export type NavStatus = 'active' | 'soon' | 'planned'

export type NavItem = {
  label: string
  href?: string
  status: NavStatus
  description?: string
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Operations',
    items: [
      {
        label: 'Dashboard',
        href: '/switchboard',
        status: 'active',
        description: 'Overview, status, and recent activity.',
      },
      {
        label: 'Lead Pipeline',
        status: 'soon',
        description: 'Every lead the AI captured, routed, and converted.',
      },
      {
        label: 'Reports',
        status: 'soon',
        description: 'Calls, leads, jobs, and conversion rates.',
      },
      {
        label: 'Employee Training',
        status: 'planned',
        description: 'Trainiuly integration for staff onboarding.',
      },
    ],
  },
  {
    label: 'AI Agents',
    items: [
      {
        label: 'Agent Training',
        href: '/switchboard/agent-training',
        status: 'active',
        description: 'Discovery questionnaire that feeds the knowledge base.',
      },
      {
        label: 'Knowledge Base',
        status: 'soon',
        description: 'Editable source of truth the agents read from.',
      },
      {
        label: 'Call Logs',
        status: 'soon',
        description: 'Voice calls handled by the AI with audio and transcripts.',
      },
      {
        label: 'SMS Conversations',
        status: 'soon',
        description: 'Inbound texts and AI responses, with takeover.',
      },
      {
        label: 'Web Chat',
        status: 'soon',
        description: 'Chatbot conversations from tzelectricinc.com.',
      },
    ],
  },
  {
    label: 'Future Agents',
    items: [
      {
        label: 'Email Assistant',
        status: 'planned',
        description: "Tyler's personal AI inbox with classification and routing.",
      },
      {
        label: 'Office Operations',
        status: 'planned',
        description: 'Backend agent for office staff lookups and coordination.',
      },
      {
        label: 'Warehouse & Inventory',
        status: 'planned',
        description: 'Inventory tracking and parts lookup for the bay.',
      },
      {
        label: 'Sales & Outbound',
        status: 'planned',
        description: 'Outbound sequences, review requests, follow-up campaigns.',
      },
    ],
  },
]
