import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  deltaPct: number;
  className?: string;
  withSuffix?: boolean;
  invertSign?: boolean;
  onAccent?: boolean;
};

export function DeltaPill({ deltaPct, className, withSuffix, invertSign, onAccent }: Props) {
  const flat = !Number.isFinite(deltaPct) || Math.abs(deltaPct) < 0.5;
  const positive = deltaPct > 0;
  const isGood = invertSign ? !positive : positive;

  const Icon = flat ? Minus : positive ? ArrowUp : ArrowDown;
  const formatted = flat
    ? "flat"
    : `${positive ? "+" : ""}${deltaPct.toFixed(1)}%`;

  // On the solid brand-blue highlight tile, the normal text/tint washes out.
  // Use white text on a translucent white pill for contrast instead.
  if (onAccent) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white",
          className,
        )}
      >
        <Icon className="size-3" />
        <span>{formatted}</span>
        {withSuffix ? <span className="opacity-70">vs prior</span> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
        flat
          ? "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
          : isGood
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        className,
      )}
    >
      <Icon className="size-3" />
      <span>{formatted}</span>
      {withSuffix ? <span className="opacity-60">vs prior</span> : null}
    </span>
  );
}
