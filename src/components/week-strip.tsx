import { format } from "date-fns";
import type { DayLog } from "@/lib/store";
import {
  dayRelation,
  formatDuration,
  formatDurationCompact,
  toDateKey,
} from "@/lib/time";
import { cn } from "@/lib/utils";

type WeekStripProps = {
  days: Date[];
  logs: Record<string, DayLog>;
  onSelect: (dateKey: string) => void;
};

export function WeekStrip({ days, logs, onSelect }: WeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((day) => {
        const key = toDateKey(day);
        const log = logs[key];
        const relation = dayRelation(day);
        const disabled = relation === "future";
        const net = log ? log.allowanceMinutes - log.spentMinutes : null;
        const ratio = log
          ? log.allowanceMinutes === 0
            ? log.spentMinutes > 0
              ? 1
              : 0
            : Math.min(1, log.spentMinutes / log.allowanceMinutes)
          : 0;
        const over = log ? log.spentMinutes > log.allowanceMinutes : false;

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(key)}
            aria-label={
              log
                ? `${format(day, "EEEE d MMMM")}: ${formatDuration(log.spentMinutes)} of ${formatDuration(log.allowanceMinutes)}`
                : relation === "future"
                  ? `${format(day, "EEEE d MMMM")}, upcoming`
                  : `Log ${format(day, "EEEE d MMMM")}`
            }
            className={cn(
              "flex min-h-28 flex-col items-stretch rounded-xl px-1 py-2.5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out sm:px-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              disabled
                ? "cursor-default opacity-40"
                : "hover:bg-accent active:scale-[0.96]",
              relation === "today" && !log && "bg-card shadow-border",
              log && "bg-card shadow-border",
            )}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {format(day, "EEEEE")}
            </span>
            <span
              className={cn(
                "mt-0.5 text-sm tabular-nums",
                relation === "today" ? "font-medium" : "text-muted-foreground",
              )}
            >
              {format(day, "d")}
            </span>
            <span className="mt-3 flex h-10 items-end">
              <span className="relative block h-full w-full overflow-hidden rounded-sm bg-muted">
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 origin-bottom transition-transform duration-200 ease-out",
                    over ? "bg-rust" : "bg-foreground",
                  )}
                  style={{ height: `${Math.max(log ? 8 : 0, ratio * 100)}%` }}
                />
              </span>
            </span>
            <span className="mt-2 truncate text-xs font-medium tabular-nums leading-tight">
              {log ? (
                formatDurationCompact(log.spentMinutes)
              ) : relation === "today" ? (
                <span className="text-muted-foreground">Log</span>
              ) : (
                <span className="text-subtle">—</span>
              )}
            </span>
            <span
              className={cn(
                "mt-0.5 truncate text-xs tabular-nums leading-tight",
                net == null
                  ? "text-subtle"
                  : net >= 0
                    ? "text-sage"
                    : "text-rust",
              )}
            >
              {net == null
                ? "\u00a0"
                : `${net >= 0 ? "+" : ""}${formatDurationCompact(net)}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
