import { format } from "date-fns";
import type { DayLog } from "@/lib/store";
import { totalsForKeys } from "@/lib/store";
import { formatDuration, getWeek, toDateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

type WeekHistoryProps = {
  logs: Record<string, DayLog>;
  currentOffset: number;
  onSelect: (offset: number) => void;
};

const BAR_MAX = 28;

export function WeekHistory({ logs, currentOffset, onSelect }: WeekHistoryProps) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const offset = i - 7;
    const { start, days } = getWeek(offset);
    const totals = totalsForKeys(days.map(toDateKey), logs);
    return { offset, start, totals };
  });

  const maxAbs = Math.max(
    1,
    ...weeks.map((week) => Math.abs(week.totals.net)),
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Last eight weeks
        </h2>
        <p className="text-xs text-subtle">Saved above, over below</p>
      </header>
      <div className="grid grid-cols-8 gap-2">
        {weeks.map((week) => {
          const ratio = Math.abs(week.totals.net) / maxAbs;
          const saved = week.totals.net >= 0;
          const selected = week.offset === currentOffset;
          const empty = week.totals.logged === 0;
          const barPx = empty ? 0 : Math.max(4, Math.round(ratio * BAR_MAX));
          return (
            <button
              key={week.offset}
              type="button"
              onClick={() => onSelect(week.offset)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg py-1 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                selected ? "bg-accent" : "hover:bg-accent/70",
              )}
              aria-label={`${week.offset === 0 ? "This week" : `Week of ${format(week.start, "d MMM")}`}: ${
                empty
                  ? "no logs"
                  : saved
                    ? `${formatDuration(week.totals.net)} spared`
                    : `${formatDuration(week.totals.net)} over`
              }`}
              aria-pressed={selected}
            >
              <span className="flex h-16 w-full flex-col">
                <span className="flex h-8 items-end justify-center">
                  {saved && !empty ? (
                    <span
                      className="w-2.5 rounded-t-sm bg-foreground"
                      style={{ height: `${barPx}px` }}
                    />
                  ) : null}
                </span>
                <span className="h-px w-full bg-border" />
                <span className="flex h-8 items-start justify-center">
                  {!saved && !empty ? (
                    <span
                      className="w-2.5 rounded-b-sm bg-rust"
                      style={{ height: `${barPx}px` }}
                    />
                  ) : null}
                </span>
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {week.offset === 0 ? "Now" : format(week.start, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
