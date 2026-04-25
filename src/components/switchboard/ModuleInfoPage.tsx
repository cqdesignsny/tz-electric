import Link from 'next/link'
import { findItemBySlug, type NavItem } from './nav-config'
import { notFound } from 'next/navigation'

export default function ModuleInfoPage({ slug }: { slug: string }) {
  const item = findItemBySlug(slug)
  if (!item || !item.overview) {
    notFound()
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusChip status={item.status} />
          <CategoryHint slug={item.slug} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          {item.label}
        </h1>
        <p className="text-lg md:text-xl text-blue dark:text-blue-light mt-2 font-medium">
          {item.tagline}
        </p>
      </header>

      {/* Overview */}
      <section className="mb-10">
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {item.overview}
        </p>
      </section>

      {/* What it will do */}
      {item.willDo && item.willDo.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-gray-500 dark:text-gray-400 mb-4">
            What it will do
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {item.willDo.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white dark:bg-[#0F1C3F] border border-blue/20 dark:border-blue-light/30 rounded-lg p-4"
              >
                <CheckIcon />
                <span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Needs */}
      {item.needs && item.needs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-gray-500 dark:text-gray-400 mb-4">
            What we need to build it
          </h2>
          <ul className="space-y-2">
            {item.needs.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer note */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-navy-light/40 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        This module isn&apos;t live yet. When it ships, this page becomes
        the working interface — the description above is the plan.
      </div>
    </div>
  )
}

function StatusChip({ status }: { status: NavItem['status'] }) {
  if (status === 'soon') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning dark:bg-warning/20 dark:text-amber-300 px-2 py-1 rounded-full">
        Coming Soon
      </span>
    )
  }
  if (status === 'planned') {
    return (
      <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 dark:bg-navy-light/50 dark:text-gray-300 px-2 py-1 rounded-full">
        Planned
      </span>
    )
  }
  return null
}

function CategoryHint({ slug }: { slug: string }) {
  const operationsSlugs = ['lead-pipeline', 'reports', 'employee-training']
  const aiAgentsSlugs = [
    'knowledge-base',
    'call-logs',
    'sms-conversations',
    'web-chat',
  ]
  const futureSlugs = [
    'email-assistant',
    'office-operations',
    'warehouse-inventory',
    'sales-outbound',
  ]

  let label = ''
  if (operationsSlugs.includes(slug)) label = 'Operations'
  else if (aiAgentsSlugs.includes(slug)) label = 'AI Agents'
  else if (futureSlugs.includes(slug)) label = 'Future Agents'
  if (!label) return null

  return (
    <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400">
      {label}
    </span>
  )
}

function CheckIcon() {
  return (
    <span
      aria-hidden
      className="flex-shrink-0 w-5 h-5 rounded-full bg-blue/10 dark:bg-blue-light/20 text-blue dark:text-blue-light flex items-center justify-center"
    >
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}
