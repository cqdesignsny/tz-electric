import Link from 'next/link'
import { NAV_SECTIONS } from '@/components/switchboard/nav-config'

export default function DashboardHome() {
  const allItems = NAV_SECTIONS.flatMap((s) => s.items)
  const activeModules = allItems.filter((i) => i.status === 'active' && i.href)
  const soonModules = allItems.filter((i) => i.status === 'soon')
  const plannedModules = allItems.filter((i) => i.status === 'planned')

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-gray-500 font-mono mb-1">
          Overview
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">
          Welcome back
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          The Switchboard is the operational backend for TZ Electric. Active
          sections work today. Others come online as we build them out.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        <StatCard label="Calls (today)" value="—" note="Voice agent not live" />
        <StatCard label="SMS (today)" value="—" note="SMS agent not live" />
        <StatCard label="Web leads" value="—" note="Form pending" />
        <StatCard label="Reviews requested" value="—" note="Workflow pending" />
      </div>

      {/* Active modules */}
      <section className="mb-12">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">
          Active Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeModules.map((m) => (
            <Link
              key={m.label}
              href={m.href!}
              className="group bg-white border border-blue/20 hover:border-blue rounded-xl p-6 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 block"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-navy">{m.label}</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-success/10 text-success px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {m.description}
              </p>
              <div className="text-sm font-semibold text-blue group-hover:text-blue-dark flex items-center gap-1">
                Open
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="mb-12">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {soonModules.map((m) => (
            <div
              key={m.label}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-charcoal">
                  {m.label}
                </h3>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-warning/10 text-warning px-1.5 py-0.5 rounded flex-shrink-0">
                  Soon
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Planned */}
      <section>
        <h2 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">
          Planned
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plannedModules.map((m) => (
            <div
              key={m.label}
              className="bg-gray-100/60 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-700">
                  {m.label}
                </h3>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">
                  Planned
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-navy tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-gray-400 mt-1">{note}</div>
    </div>
  )
}
