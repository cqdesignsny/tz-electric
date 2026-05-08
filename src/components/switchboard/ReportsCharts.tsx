/**
 * Lightweight chart primitives for the Reports module. CSS-only, no chart
 * library dependency. v1 covers: stat cards, horizontal bar lists, stacked
 * daily bars (lead volume), and a simple share donut. If we ever need
 * actual interactivity (hover tooltips, axis-aware zoom, etc.) swap to
 * recharts then.
 */

type StatCardProps = {
  label: string
  value: string | number
  sub?: string | null
  tone?: 'default' | 'positive' | 'caution' | 'danger'
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'border-blue/20 bg-blue/5',
  positive: 'border-emerald-200 bg-emerald-50',
  caution: 'border-amber-200 bg-amber-50',
  danger: 'border-red-200 bg-red-50',
}

export function StatCard({ label, value, sub, tone = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border-2 ${TONE[tone]} px-5 py-4 dark:border-white/10 dark:bg-white/5`}>
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-heading font-semibold">
        {label}
      </p>
      <p className="mt-1.5 font-heading font-bold text-navy text-2xl dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{sub}</p>
      )}
    </div>
  )
}

// ============================================================================
// Horizontal bar list — used for channel breakdown + service mix
// ============================================================================

type BarRow = {
  label: string
  count: number
  share: number
  meta?: string | null
}

export function BarList({ rows, emptyMessage }: { rows: BarRow[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 italic">{emptyMessage}</p>
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-navy dark:text-white truncate pr-3">{r.label}</span>
            <span className="text-gray-700 dark:text-gray-300 tabular-nums whitespace-nowrap">
              {r.count}
              {r.meta ? ` · ${r.meta}` : ''}
              {r.share != null ? ` · ${(r.share * 100).toFixed(0)}%` : ''}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue to-blue-dark"
              style={{ width: `${Math.max(2, r.share * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ============================================================================
// Daily volume — stacked bars per day
// ============================================================================

const CHANNEL_COLORS = [
  'bg-blue',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-slate-500',
  'bg-rose-500',
  'bg-lime-500',
]

type DailyVolumeProps = {
  points: Array<{ date: string; total: number; channels: Record<string, number> }>
  channels: string[]
}

export function DailyVolumeBars({ points, channels }: DailyVolumeProps) {
  const max = Math.max(1, ...points.map((p) => p.total))
  const colorFor = (channel: string) =>
    CHANNEL_COLORS[channels.indexOf(channel) % CHANNEL_COLORS.length]

  return (
    <div>
      <div className="flex items-end gap-[2px] h-40 overflow-x-auto pb-1">
        {points.map((p) => {
          const heightPct = (p.total / max) * 100
          return (
            <div
              key={p.date}
              className="flex flex-col-reverse items-stretch w-2 sm:w-2.5 md:w-3 flex-shrink-0"
              style={{ height: '100%' }}
              title={`${p.date}: ${p.total} lead${p.total === 1 ? '' : 's'}`}
            >
              <div className="flex flex-col-reverse" style={{ height: `${heightPct}%` }}>
                {channels.map((c) => {
                  const v = p.channels[c] || 0
                  if (v === 0) return null
                  const seg = (v / p.total) * 100
                  return (
                    <div
                      key={c}
                      className={`${colorFor(c)} first:rounded-t-sm`}
                      style={{ height: `${seg}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {channels.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${colorFor(c)}`} />
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
