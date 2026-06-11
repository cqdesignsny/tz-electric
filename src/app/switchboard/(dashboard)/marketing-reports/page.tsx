import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import { listReportSummaries } from "@/lib/signal/report-source";
import { MockBanner } from "@/components/switchboard/signal-report/mock-banner";

export const metadata = { title: "Marketing Reports" };
export const dynamic = "force-dynamic";

// TZ is Eastern; report cards show the pushed date + time in their tz
// (auto EDT/EST per DST). These only ever format a pushed instant.
const EASTERN_TZ = "America/New_York";

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: EASTERN_TZ,
  });
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: EASTERN_TZ,
    timeZoneName: "short",
  });
}

export default async function MarketingReportsIndexPage() {
  const reports = await listReportSummaries();
  const isMock = reports.length > 0 && reports[0].mode === "mock";

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 lg:px-14">
      {/* Header — this is an archive of reports CQ Signal has sent, not a live
          feed. It leads with that framing instead of a "Live" badge. */}
      <header className="space-y-3">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
          Performance · TZ Electric
        </p>
        <h1 className="font-semibold text-4xl leading-tight tracking-tight md:text-5xl text-gray-900 dark:text-white">
          Marketing Reports
        </h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-300">
          Reports CQ Signal sends you, newest first. The most recent is
          highlighted. Open any one to see the full breakdown across 7-day,
          30-day, 90-day, and 12-month windows.
        </p>
      </header>

      {/* This section is an active CQ build — say so plainly so TZ knows some
          marketing channels are still being connected. */}
      <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
        <span className="font-semibold">Build in progress.</span> CQ is still
        wiring up TZ&apos;s marketing data. Jobs &amp; revenue and site speed are
        live now; website analytics, search, and ads will fill in as each
        integration comes online.
      </div>

      {isMock ? (
        <div className="mt-6">
          <MockBanner />
        </div>
      ) : null}

      {reports.length === 0 ? (
        <section className="mt-10 rounded-2xl border border-dashed border-gray-200 dark:border-navy-light/40 p-10 text-center md:p-14">
          <Inbox className="mx-auto size-8 text-gray-500 dark:text-gray-400" />
          <h2 className="mt-4 font-semibold text-2xl tracking-tight text-gray-900 dark:text-white">
            No reports yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            CQ Signal sends a fresh report on a schedule, or when one is triggered
            from Signal. As soon as the first one arrives, it shows up here.
          </p>
        </section>
      ) : (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/switchboard/marketing-reports/${r.id}`}
              className={
                r.isLatest
                  ? "group flex flex-col rounded-2xl border-2 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-[#0A1128]"
                  : "group flex flex-col rounded-2xl border border-gray-200 dark:border-navy-light/40 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-[#0A1128]"
              }
              style={r.isLatest ? { borderColor: "#1E40AF" } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  {r.isLatest ? "Most recent" : "Report"}
                </p>
                {r.isLatest ? (
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: "#1E40AF" }}
                  >
                    Latest
                  </span>
                ) : null}
              </div>

              <h2 className="mt-3 font-semibold text-xl leading-tight tracking-tight text-gray-900 dark:text-white">
                {formatLongDate(r.pushedAt)}
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Pushed {formatTimestamp(r.pushedAt)}
              </p>

              {r.sessions != null ? (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Last 30 days · {formatNumber(r.sessions)} sessions
                </p>
              ) : null}

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                Open report
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
