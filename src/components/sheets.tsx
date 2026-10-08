import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DownloadZipButton } from "@/components/download-zip";
import { TimeField } from "@/components/time-field";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useSpareStore } from "@/lib/store";
import { formatDuration, parseDateKey } from "@/lib/time";

type LogSheetProps = {
  dateKey: string | null;
  onClose: () => void;
};

export function LogSheet({ dateKey, onClose }: LogSheetProps) {
  const logs = useSpareStore((s) => s.logs);
  const allowance = useSpareStore((s) => s.dailyAllowanceMinutes);
  const logDay = useSpareStore((s) => s.logDay);
  const clearDay = useSpareStore((s) => s.clearDay);

  const existing = dateKey ? logs[dateKey] : undefined;
  const [spent, setSpent] = useState(existing?.spentMinutes ?? 0);

  useEffect(() => {
    setSpent(existing?.spentMinutes ?? 0);
  }, [dateKey, existing?.spentMinutes]);

  const open = dateKey != null;
  const date = dateKey ? parseDateKey(dateKey) : new Date();
  const budget = existing?.allowanceMinutes ?? allowance ?? 0;

  const save = () => {
    if (!dateKey) return;
    logDay(dateKey, spent);
    toast("Logged", {
      description: `${formatDuration(spent)} on ${format(date, "EEEE d MMM")}`,
    });
    onClose();
  };

  const remove = () => {
    if (!dateKey) return;
    clearDay(dateKey);
    toast("Cleared", { description: format(date, "EEEE d MMM") });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Screen time
          </p>
          <SheetTitle className="font-display text-3xl font-medium tracking-tight">
            {format(date, "EEEE, d MMM")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Daily budget {formatDuration(budget)}. Tap a number to type, or step
            by one minute.
          </SheetDescription>
        </header>
        <TimeField value={spent} onChange={setSpent} presets="spent" />
        <div className="flex flex-col gap-2">
          <Button type="button" size="lg" className="w-full" onClick={save}>
            {existing ? "Update log" : "Save log"}
          </Button>
          {existing ? (
            <Button type="button" variant="ghost" className="w-full" onClick={remove}>
              Remove this day
            </Button>
          ) : (
            <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

type BudgetSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function BudgetSheet({ open, onClose }: BudgetSheetProps) {
  const allowance = useSpareStore((s) => s.dailyAllowanceMinutes) ?? 120;
  const setAllowance = useSpareStore((s) => s.setAllowance);
  const resetAll = useSpareStore((s) => s.resetAll);
  const [value, setValue] = useState(allowance);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(useSpareStore.getState().dailyAllowanceMinutes ?? 120);
      setConfirmReset(false);
    }
  }, [open]);

  const save = () => {
    setAllowance(value);
    toast("Budget updated", {
      description: `${formatDuration(value)} each day. Existing logs keep their original budget.`,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-6 pt-4">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Settings
          </p>
          <SheetTitle className="font-display text-3xl font-medium tracking-tight">
            Daily budget
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Applied when you log a new day. Already-logged days stay as they were.
          </SheetDescription>
        </header>
        <TimeField value={value} onChange={setValue} presets="budget" />
        <div className="flex flex-col gap-2">
          <Button type="button" size="lg" className="w-full" onClick={save}>
            Save budget
          </Button>
          <DownloadZipButton />
          <Button
            type="button"
            variant={confirmReset ? "destructive" : "ghost"}
            className="w-full"
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              resetAll();
              toast("Ledger cleared");
              onClose();
            }}
          >
            {confirmReset ? "Confirm reset" : "Reset all data"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const setAllowance = useSpareStore((s) => s.setAllowance);
  const [value, setValue] = useState(120);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12 lg:justify-center">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="spare-rise max-w-md">
          <p className="font-display italic text-3xl tracking-tight">Spare</p>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            A weekly ledger for the hours you keep. Set a daily screen budget, log
            what you actually used, and watch the remainder add up.
          </p>
        </div>
        <div className="spare-rise spare-rise-3 flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Daily screen budget
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
              How much is enough?
            </h1>
          </div>
          <TimeField value={value} onChange={setValue} presets="budget" />
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => {
              setAllowance(value);
              onDone();
            }}
          >
            Start tracking
          </Button>
          <DownloadZipButton />
        </div>
      </div>
    </main>
  );
}
