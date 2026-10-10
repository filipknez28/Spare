import { ChevronLeft, ChevronRight, Plus, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { DurationHero, DurationInline } from "@/components/duration";
import { BudgetSheet, LogSheet, Onboarding } from "@/components/sheets";
import { Button } from "@/components/ui/button";
import { WeekHistory } from "@/components/week-history";
import { WeekStrip } from "@/components/week-strip";
import { totalsForKeys, useRehydrateSpare, useSpareStore } from "@/lib/store";
import {
  formatDuration,
  getWeek,
  toDateKey,
  today,
  weekLabel,
} from "@/lib/time";
import { cn } from "@/lib/utils";

export function Ledger() {
  useRehydrateSpare();
  const allowance = useSpareStore((s) => s.dailyAllowanceMinutes);
  const logs = useSpareStore((s) => s.logs);

  const [weekOffset, setWeekOffset] = useState(0);
  const [logKey, setLogKey] = useState<string | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const week = useMemo(() => getWeek(weekOffset), [weekOffset]);
  const totals = useMemo(
    () => totalsForKeys(week.days.map(toDateKey), logs),
    [week, logs],
  );
  const lifetime = useMemo(
    () => totalsForKeys(Object.keys(logs), logs),
    [logs],
  );

  const todayKey = toDateKey(today());
  const todayLogged = Boolean(logs[todayKey]);
  const usedRatio =
    totals.budget === 0 ? 0 : Math.min(1.15, totals.spent / totals.budget);

  if (allowance == null) {
    return (
      <>
        <Onboarding onDone={() => setLogKey(todayKey)} />
        <Toaster position="bottom-center" />
      </>
    );
  }

  const over = totals.net < 0 && totals.logged > 0;
  const emptyWeek = totals.logged === 0;

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-28 pt-6 sm:gap-12 sm:px-8 sm:pb-16 sm:pt-10">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display italic text-3xl leading-none tracking-tight">
              Spare
            </p>
            <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
              Weekly screen ledger
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => setBudgetOpen(true)}
            >
              Budget {formatDuration(allowance)}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="sm:hidden"
              aria-label="Budget settings"
              onClick={() => setBudgetOpen(true)}
            >
              <Settings2 />
            </Button>
          </div>
        </header>

        <section className="spare-rise flex flex-col gap-6">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous week"
              onClick={() => setWeekOffset((n) => n - 1)}
            >
              <ChevronLeft />
            </Button>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {weekOffset === 0 ? "This week" : "Week of"}
              </p>
              <p className="mt-1 text-sm font-medium">{weekLabel(week.start, week.end)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next week"
              disabled={weekOffset >= 0}
              onClick={() => setWeekOffset((n) => Math.min(0, n + 1))}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {emptyWeek
                  ? "Nothing logged yet"
                  : over
                    ? "Over budget this week"
                    : "Spared this week"}
              </p>
              {emptyWeek ? (
                <p className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                  Log a day
                </p>
              ) : (
                <DurationHero
                  minutes={over ? totals.over : totals.saved}
                  className={over ? "text-rust" : "text-foreground"}
                />
              )}
              <p className="max-w-md text-sm text-muted-foreground">
                {emptyWeek
                  ? "Days you haven’t logged don’t count as saved. Open a day and enter the time you actually spent."
                  : `${formatDuration(totals.spent)} used of ${formatDuration(totals.budget)} across ${totals.logged} ${totals.logged === 1 ? "day" : "days"}.`}
              </p>
              {weekOffset === 0 ? (
                <div className="hidden pt-1 sm:block">
                  <Button type="button" onClick={() => setLogKey(todayKey)}>
                    <Plus />
                    {todayLogged ? "Update today" : "Log today"}
                  </Button>
                </div>
              ) : null}
            </div>
            {!emptyWeek ? (
              <div className="w-full max-w-sm lg:pb-2">
                <div className="mb-2 flex items-baseline justify-between text-xs text-muted-foreground">
                  <span>Budget used</span>
                  <span className="tabular-nums">
                    {Math.round((totals.spent / Math.max(1, totals.budget)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full origin-left rounded-full transition-transform duration-500 ease-out",
                      over ? "bg-rust" : "bg-foreground",
                    )}
                    style={{ transform: `scaleX(${Math.min(1, usedRatio)})` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="spare-rise spare-rise-3 flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Daily ledger
          </h2>
          <WeekStrip days={week.days} logs={logs} onSelect={setLogKey} />
        </section>

        <section className="spare-rise spare-rise-4">
          <WeekHistory
            logs={logs}
            currentOffset={weekOffset}
            onSelect={setWeekOffset}
          />
        </section>

        {lifetime.logged > 0 ? (
          <footer className="spare-rise spare-rise-5 flex items-baseline justify-between border-t border-border pt-6 text-sm">
            <span className="text-muted-foreground">
              Across {lifetime.logged} logged {lifetime.logged === 1 ? "day" : "days"}
            </span>
            <span
              className={cn(
                "font-medium tabular-nums",
                lifetime.net >= 0 ? "text-sage" : "text-rust",
              )}
            >
              {lifetime.net >= 0 ? (
                <>
                  <DurationInline minutes={lifetime.saved} /> spared
                </>
              ) : (
                <>
                  <DurationInline minutes={lifetime.over} /> over
                </>
              )}
            </span>
          </footer>
        ) : null}
      </div>

      {weekOffset === 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-sm sm:hidden">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => setLogKey(todayKey)}
          >
            <Plus />
            {todayLogged ? "Update today" : "Log today"}
          </Button>
        </div>
      ) : null}

      <LogSheet dateKey={logKey} onClose={() => setLogKey(null)} />
      <BudgetSheet open={budgetOpen} onClose={() => setBudgetOpen(false)} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "bg-card text-foreground shadow-lift border-0 font-sans",
            title: "text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </div>
  );
}
