import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/lib/signal/types";

type Props = {
  status: IntegrationStatus | "mock";
  className?: string;
};

const LABELS: Record<IntegrationStatus | "mock", string> = {
  live: "Live",
  manual: "Manual",
  empty: "Not connected",
  mock: "Mock data",
};

export function StatusPill({ status, className }: Props) {
  const isLive = status === "live";
  const isMock = status === "mock";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
        isLive
          ? "text-white"
          : isMock
            ? "border border-gray-200 dark:border-navy-light/40 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300"
            : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400",
        className,
      )}
      style={
        isLive
          ? {
              backgroundColor: "#1E40AF",
            }
          : undefined
      }
    >
      <span
        className="size-1.5 rounded-full"
        style={{
          backgroundColor: isLive
            ? "#FFFFFF"
            : isMock
              ? "#1E40AF"
              : "currentColor",
          opacity: isLive ? 1 : isMock ? 0.9 : 0.45,
        }}
      />
      {LABELS[status]}
    </span>
  );
}
