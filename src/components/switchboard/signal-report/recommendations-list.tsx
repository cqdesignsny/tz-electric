import { cn } from "@/lib/utils";
import { renderMarkdown } from "./markdown";
import type { Recommendation } from "@/lib/signal/types";

const PRIORITY_LABEL: Record<Recommendation["priority"], string> = {
  high: "High priority",
  medium: "Worth a look",
  low: "Watching",
};

export function RecommendationsList({ items }: { items: Recommendation[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No recommendations for this range yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((rec, i) => (
        <li
          key={rec.id}
          className={cn(
            "rounded-xl border p-5 md:p-6",
            rec.priority === "high"
              ? "border-transparent bg-blue-50 dark:bg-blue/10"
              : "border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0A1128]",
          )}
          style={
            rec.priority === "high"
              ? { borderColor: "#1E40AF" }
              : undefined
          }
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                {PRIORITY_LABEL[rec.priority]} · via {rec.source}
              </p>
              <h3 className="mt-1 font-semibold text-lg leading-tight tracking-tight md:text-xl text-gray-900 dark:text-white">
                {rec.title}
              </h3>
              <div
                className="prose-rec mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(rec.body) }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
