import Link from 'next/link'
import { NAV_SECTIONS, navHref, type NavItem } from '@/components/switchboard/nav-config'
import RecentLeadsCard from '@/components/switchboard/RecentLeadsCard'
import { getCurrentUser } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

export default async function DashboardHome() {
  const cu = await getCurrentUser()
  const firstName = (cu?.user?.name || '').trim().split(/\s+/)[0]
  const greetingTarget =
    firstName ||
    (cu?.email ? cu.email.split('@')[0].replace(/\./g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : null)
  const timeGreeting = getTimeGreeting()

  const allItems = NAV_SECTIONS.flatMap((s) => s.items)
  const todoModules = allItems.filter(
    (i) => i.status === 'active' && i.slug !== '',
  )
  const soonModules = allItems.filter((i) => i.status === 'soon')
  const plannedModules = allItems.filter((i) => i.status === 'planned')

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-6xl mx-auto w-full">
      {/* Welcome */}
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          {greetingTarget ? `${timeGreeting}, ${greetingTarget}` : 'Welcome'}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          TZ Switchboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
          The operational backend for TZ Electric. Each AI agent we build
          lives here as its own module, whether that&apos;s voice, SMS,
          web chat, or email. Click any card to see what we&apos;re
          planning to build inside it.
        </p>
        {cu?.source === 'google' && cu.user && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue/5 dark:bg-blue-light/10 border border-blue/15 dark:border-blue-light/20 px-3 py-1 text-xs text-blue dark:text-blue-light">
            <span aria-hidden>●</span>
            Signed in as {cu.user.name || cu.email}
            {cu.user.login_count > 1 && (
              <span className="text-gray-500 dark:text-gray-400">
                · sign-in #{cu.user.login_count}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Things to do */}
      {todoModules.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            label="Things to do"
            note="Action items for you to complete"
          />
          <div className="grid grid-cols-1 gap-4">
            {todoModules.map((m) => (
              <ToDoCard key={m.label} item={m} />
            ))}
          </div>
        </section>
      )}

      {/* Recent leads (live from HCP) */}
      <section className="mb-12">
        <SectionHeading
          label="Recent leads"
          note="Latest 5, live from Housecall Pro"
        />
        <RecentLeadsCard />
      </section>


      {/* Coming Soon */}
      <section className="mb-12">
        <SectionHeading
          label="Coming Soon"
          note="Modules being built next"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {soonModules.map((m) => (
            <ModuleCard key={m.label} item={m} />
          ))}
        </div>
      </section>

      {/* Planned */}
      <section>
        <SectionHeading
          label="Planned"
          note="On the roadmap, not yet started"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plannedModules.map((m) => (
            <ModuleCard key={m.label} item={m} variant="planned" />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeading({ label, note }: { label: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
      <h2 className="text-base md:text-lg font-bold text-navy dark:text-white">
        {label}
      </h2>
      {note && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>
      )}
    </div>
  )
}

function ToDoCard({ item }: { item: NavItem }) {
  return (
    <Link
      href={navHref(item)}
      className="group relative block bg-white dark:bg-[#0F1C3F] border-2 border-blue dark:border-blue-light rounded-2xl p-6 md:p-7 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Accent ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-blue-light to-blue" />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold bg-accent/15 text-accent dark:bg-accent/20 dark:text-accent-light px-2 py-0.5 rounded-full">
              Action required
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-1.5">
            {item.label}
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Fill out the discovery questionnaire so we can build the AI
            agents around how TZ actually operates. About 20 minutes,
            saves as you go.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue dark:bg-blue-light text-white text-sm font-semibold shadow-sm group-hover:shadow-md group-hover:bg-blue-dark dark:group-hover:bg-blue transition-all">
          Start
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}

function ModuleCard({
  item,
  variant = 'soon',
}: {
  item: NavItem
  variant?: 'soon' | 'planned'
}) {
  const isPlanned = variant === 'planned'

  return (
    <Link
      href={navHref(item)}
      className={[
        'group relative block rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        isPlanned
          ? 'bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-navy-light/40 hover:border-gray-300 dark:hover:border-navy-light/60'
          : 'bg-white dark:bg-[#0F1C3F] border border-blue/20 dark:border-blue-light/30 hover:border-blue dark:hover:border-blue-light',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-navy dark:text-white">
          {item.label}
        </h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
        {item.tagline}
      </p>
      <div className="text-xs font-semibold text-blue dark:text-blue-light flex items-center gap-1 group-hover:text-blue-dark dark:group-hover:text-white transition-colors">
        Learn more
        <span className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  )
}

function getTimeGreeting(): string {
  const hourLocal = Number.parseInt(
    new Date().toLocaleString('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'America/New_York',
    }),
    10,
  )
  if (hourLocal < 12) return 'Good morning'
  if (hourLocal < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatusBadge({ status }: { status: NavItem['status'] }) {
  if (status === 'soon') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-warning/10 text-warning dark:bg-warning/20 dark:text-amber-300 px-1.5 py-0.5 rounded flex-shrink-0">
        Soon
      </span>
    )
  }
  if (status === 'planned') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 dark:bg-navy-light/50 dark:text-gray-300 px-1.5 py-0.5 rounded flex-shrink-0">
        Planned
      </span>
    )
  }
  return null
}
