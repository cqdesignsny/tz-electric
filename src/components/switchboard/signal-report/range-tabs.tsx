"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANGE_OPTIONS, type SignalRange } from "@/lib/signal/types";

type Props = {
  active: SignalRange;
  basePath?: string;
};

export function RangeTabs({ active, basePath = "/switchboard/marketing-reports" }: Props) {
  const [pendingRange, setPendingRange] = useState<SignalRange | null>(null);
  const pendingOption = RANGE_OPTIONS.find((r) => r.key === pendingRange);
  const showPending = Boolean(pendingOption && pendingRange !== active);
  const pendingLabel = showPending ? pendingOption?.label : null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0A1128] p-1 transition-opacity",
          showPending && "opacity-75",
        )}
      >
        {RANGE_OPTIONS.map((r) => {
          const isActive = r.key === active;
          const isLoading = showPending && pendingRange === r.key;
          return (
            <Link
              key={r.key}
              href={`${basePath}?range=${r.key}`}
              scroll={false}
              onClick={() => {
                if (!isActive) setPendingRange(r.key);
              }}
              className={cn(
                "inline-flex min-w-12 items-center justify-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                isActive
                  ? "bg-navy dark:bg-blue-light text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                isLoading && "text-gray-900 dark:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={isLoading ? `Loading ${r.label}` : `Show ${r.label}`}
            >
              <span>{r.shortLabel}</span>
              <LoaderCircle
                aria-hidden="true"
                className={cn(
                  "size-3 shrink-0 animate-spin transition-opacity",
                  isLoading ? "opacity-100" : "hidden opacity-0",
                )}
              />
            </Link>
          );
        })}
      </div>
      <div
        className={cn(
          "min-h-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 transition-opacity",
          showPending ? "opacity-100" : "opacity-0",
        )}
        aria-live="polite"
      >
        {pendingLabel ? `Loading ${pendingLabel}...` : "Range ready"}
      </div>
    </div>
  );
}
