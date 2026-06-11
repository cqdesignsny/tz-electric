import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ id, title, eyebrow, action, children, className }: Props) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0A1128] p-6 md:p-8",
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 font-semibold text-2xl tracking-tight md:text-3xl text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
