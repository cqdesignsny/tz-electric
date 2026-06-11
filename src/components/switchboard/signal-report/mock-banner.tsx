import { AlertCircle } from "lucide-react";

export function MockBanner() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border-2 p-4 bg-blue-50 dark:bg-blue/10 text-gray-900 dark:text-white"
      style={{ borderColor: "#1E40AF" }}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">Showing mock data</p>
        <p className="mt-0.5 text-gray-600 dark:text-gray-300">
          CQ Signal is the source of these reports. Set <code className="rounded bg-gray-100 dark:bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">SIGNAL_PUSH_SECRET</code> and a <code className="rounded bg-gray-100 dark:bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">DATABASE_URL</code> so pushed reports are stored and rendered.
        </p>
      </div>
    </div>
  );
}
