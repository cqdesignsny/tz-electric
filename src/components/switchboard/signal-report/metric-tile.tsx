import { cn } from "@/lib/utils";
import { DeltaPill } from "./delta-pill";

type Props = {
  label: string;
  value: string;
  deltaPct?: number;
  hint?: string;
  highlight?: boolean;
  invertSign?: boolean;
};

export function MetricTile({ label, value, deltaPct, hint, highlight, invertSign }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        highlight
          ? "border-transparent"
          : "border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0A1128]",
      )}
      style={
        highlight
          ? { borderColor: "#1E40AF", backgroundColor: "#1E40AF" }
          : undefined
      }
    >
      <p
        className={cn(
          "font-mono text-[10px] font-semibold uppercase tracking-[0.22em]",
          highlight ? "text-white/80" : "text-gray-500 dark:text-gray-400",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-semibold text-4xl tracking-tight md:text-5xl",
          highlight ? "text-white" : "text-gray-900 dark:text-white",
        )}
      >
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {typeof deltaPct === "number" ? (
          <DeltaPill deltaPct={deltaPct} invertSign={invertSign} onAccent={highlight} />
        ) : null}
        {hint ? (
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.14em]",
              highlight ? "text-white/70" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
