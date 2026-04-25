import Link from 'next/link'

type Module = {
  title: string
  description: string
  href?: string
  status: 'active' | 'soon' | 'planned'
  group: string
}

const MODULES: Module[] = [
  {
    title: 'Agent Training',
    description:
      'Discovery questionnaire that feeds the AI agent knowledge base. Pricing, routing, intake, voice and SMS preferences.',
    href: '/switchboard/agent-training',
    status: 'active',
    group: 'AI Agents',
  },
  {
    title: 'Knowledge Base',
    description:
      'Editable source of truth the agents read from. Services, brands, warranty, on-call rotation, escalation rules.',
    status: 'soon',
    group: 'AI Agents',
  },
  {
    title: 'Call Logs',
    description:
      'Every voice call the AI handled. Audio recording, transcript, outcome (booked, escalated, dropped).',
    status: 'soon',
    group: 'AI Agents',
  },
  {
    title: 'SMS Conversations',
    description:
      'Inbound texts and AI responses. Search, review, and step in to take over a thread when needed.',
    status: 'soon',
    group: 'AI Agents',
  },
  {
    title: 'Web Chat Sessions',
    description:
      'Chatbot conversations from tzelectricinc.com with lead qualification details captured.',
    status: 'soon',
    group: 'AI Agents',
  },
  {
    title: 'Lead Pipeline',
    description:
      'Every lead the AI captured, who it routed to, conversion status pulled from Housecall Pro.',
    status: 'soon',
    group: 'Operations',
  },
  {
    title: 'Reports',
    description:
      'Calls handled, leads captured, jobs booked, conversion rates. Daily and weekly rollups.',
    status: 'soon',
    group: 'Operations',
  },
  {
    title: 'Email Assistant',
    description:
      "Tyler's personal AI inbox: classifies, routes, drafts replies, and surfaces what needs his eyes.",
    status: 'planned',
    group: 'Future Agents',
  },
  {
    title: 'Office Operations Agent',
    description:
      'Backend agent for office staff: lookups, scheduling helpers, vendor coordination.',
    status: 'planned',
    group: 'Future Agents',
  },
  {
    title: 'Warehouse & Inventory',
    description:
      'Inventory tracking, supplier coordination, parts lookup. Tablet-friendly interface for the bay.',
    status: 'planned',
    group: 'Future Agents',
  },
  {
    title: 'Sales & Outbound',
    description:
      'Outbound sequences for unconverted leads, review request automation, follow-up campaigns.',
    status: 'planned',
    group: 'Future Agents',
  },
  {
    title: 'Employee Training',
    description:
      'Trainiuly integration for onboarding and ongoing training. SOPs, videos, certifications.',
    status: 'planned',
    group: 'Operations',
  },
]

const GROUPS = ['AI Agents', 'Operations', 'Future Agents'] as const

export default function SwitchboardHome() {
  return (
    <div className="container-site py-12 md:py-16">
      <div className="max-w-3xl mb-12">
        <div className="text-xs uppercase tracking-[0.2em] text-blue font-mono mb-3">
          Internal Control Center
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-navy mb-4">
          TZ Switchboard
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Every call, text, chat, and lead at TZ Electric routes through here.
          Modules come online as we build them out. Active sections work today;
          others show what is coming.
        </p>
      </div>

      {GROUPS.map((group) => {
        const modules = MODULES.filter((m) => m.group === group)
        return (
          <section key={group} className="mb-14">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-5">
              {group}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => (
                <ModuleCard key={m.title} module={m} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ModuleCard({ module: m }: { module: Module }) {
  const isActive = m.status === 'active'

  const cardBase =
    'bg-white border rounded-xl p-6 transition-all duration-200 h-full flex flex-col'
  const activeCard =
    'border-blue/30 hover:border-blue hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
  const inactiveCard = 'border-gray-200 opacity-70'

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isActive && m.href ? (
      <Link href={m.href} className={`${cardBase} ${activeCard} group`}>
        {children}
      </Link>
    ) : (
      <div className={`${cardBase} ${inactiveCard}`}>{children}</div>
    )

  return (
    <Wrapper>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-navy leading-tight">
          {m.title}
        </h3>
        <StatusBadge status={m.status} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">
        {m.description}
      </p>
      {isActive && (
        <div className="mt-4 text-sm font-semibold text-blue group-hover:text-blue-dark flex items-center gap-1">
          Open
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      )}
    </Wrapper>
  )
}

function StatusBadge({ status }: { status: Module['status'] }) {
  if (status === 'active') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold bg-success/10 text-success px-2 py-1 rounded">
        Active
      </span>
    )
  }
  if (status === 'soon') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning px-2 py-1 rounded">
        Soon
      </span>
    )
  }
  return (
    <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
      Planned
    </span>
  )
}
