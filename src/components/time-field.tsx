import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clampMinutes,
  formatDuration,
  joinMinutes,
  parseDuration,
  splitMinutes,
} from "@/lib/time";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "None", minutes: 0 },
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "1h 30", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
  { label: "4h", minutes: 240 },
];

const BUDGET_PRESETS = [
  { label: "1h", minutes: 60 },
  { label: "1h 30", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 30", minutes: 150 },
  { label: "3h", minutes: 180 },
  { label: "4h", minutes: 240 },
  { label: "5h", minutes: 300 },
  { label: "6h", minutes: 360 },
];

type TimeFieldProps = {
  value: number;
  onChange: (minutes: number) => void;
  presets?: "spent" | "budget";
};

export function TimeField({ value, onChange, presets = "spent" }: TimeFieldProps) {
  const { hours, minutes } = splitMinutes(value);
  const chips = presets === "budget" ? BUDGET_PRESETS : PRESETS;

  const setHours = (next: number) => {
    const hoursNext = Math.max(0, Math.min(23, next));
    onChange(joinMinutes(hoursNext, minutes));
  };

  const setMins = (next: number) => {
    if (next >= 60) {
      if (hours >= 23) {
        onChange(joinMinutes(23, 59));
        return;
      }
      onChange(joinMinutes(hours + 1, 0));
      return;
    }
    if (next < 0) {
      if (hours <= 0) {
        onChange(0);
        return;
      }
      onChange(joinMinutes(hours - 1, 59));
      return;
    }
    onChange(joinMinutes(hours, next));
  };

  const applyPasted = (text: string): boolean => {
    const parsed = parseDuration(text);
    if (parsed == null) return false;
    onChange(parsed);
    return true;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Stepper
          label="Hours"
          value={hours}
          min={0}
          max={23}
          onTyped={(next) => setHours(next)}
          onDecrement={() => setHours(hours - 1)}
          onIncrement={() => setHours(hours + 1)}
          onPasteText={applyPasted}
          decrementDisabled={value <= 0}
          incrementDisabled={value >= 23 * 60 + 59}
        />
        <Stepper
          label="Minutes"
          value={minutes}
          min={0}
          max={59}
          pad
          onTyped={(next) => setMins(Math.max(0, Math.min(59, next)))}
          onDecrement={() => setMins(minutes - 1)}
          onIncrement={() => setMins(minutes + 1)}
          onPasteText={applyPasted}
          decrementDisabled={value <= 0}
          incrementDisabled={value >= 23 * 60 + 59}
        />
      </div>
      <PasteField value={value} onChange={onChange} />
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = value === chip.minutes;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange(clampMinutes(chip.minutes))}
              className={cn(
                "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PasteField({
  value,
  onChange,
}: {
  value: number;
  onChange: (minutes: number) => void;
}) {
  const formatted = formatDuration(value);
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(formatted);
  }, [formatted, focused]);

  const commit = (raw: string) => {
    const parsed = parseDuration(raw);
    if (parsed == null) {
      setDraft(formatted);
      return;
    }
    onChange(parsed);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Type or paste
      </span>
      <input
        aria-label="Total time"
        inputMode="text"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="2h 17m  ·  2:17  ·  137"
        value={focused ? draft : formatted}
        onFocus={(event) => {
          setFocused(true);
          setDraft(formatted);
          event.currentTarget.select();
        }}
        onBlur={() => {
          commit(draft);
          setFocused(false);
        }}
        onChange={(event) => setDraft(event.target.value)}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");
          const parsed = parseDuration(text);
          if (parsed == null) return;
          event.preventDefault();
          onChange(parsed);
          setDraft(formatDuration(parsed));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className={cn(
          "h-11 w-full rounded-lg bg-muted px-3 font-medium tabular-nums text-foreground",
          "outline-none ring-offset-background transition-[box-shadow] duration-150",
          "placeholder:text-subtle",
          "focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
      />
      <span className="text-xs leading-relaxed text-muted-foreground">
        One-minute precision. Paste a Screen Time total like 4h 12m — Apple
        doesn’t share Screen Time with other apps.
      </span>
    </label>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  pad,
  onTyped,
  onDecrement,
  onIncrement,
  onPasteText,
  decrementDisabled,
  incrementDisabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  pad?: boolean;
  onTyped: (next: number) => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onPasteText: (text: string) => boolean;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
}) {
  const display = pad ? String(value).padStart(2, "0") : String(value);
  const [draft, setDraft] = useState(display);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(display);
  }, [display, focused]);

  const commit = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      onTyped(min);
      return;
    }
    const parsed = Number(digits);
    if (!Number.isFinite(parsed)) {
      onTyped(min);
      return;
    }
    onTyped(Math.max(min, Math.min(max, parsed)));
  };

  return (
    <div className="flex flex-col rounded-xl bg-muted px-4 pb-3 pt-4">
      <input
        aria-label={label}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        enterKeyHint="done"
        value={focused ? draft : display}
        onFocus={(event) => {
          setFocused(true);
          setDraft(String(value));
          event.currentTarget.select();
        }}
        onBlur={() => {
          commit(draft);
          setFocused(false);
        }}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, 2);
          if (next === "") {
            setDraft("");
            return;
          }
          const parsed = Number(next);
          if (!Number.isFinite(parsed)) {
            setDraft(next);
            return;
          }
          setDraft(parsed > max ? String(max) : next);
          onTyped(Math.max(min, Math.min(max, parsed)));
        }}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");
          if (onPasteText(text)) {
            event.preventDefault();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            onIncrement();
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onDecrement();
          }
        }}
        className="w-full border-b border-foreground/20 bg-transparent pb-1 font-display text-5xl font-medium leading-none tabular-nums tracking-tight text-foreground caret-foreground outline-none transition-colors duration-150 focus:border-foreground"
      />
      <span className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="w-full bg-card"
          aria-label={`Decrease ${label.toLowerCase()} by one`}
          disabled={decrementDisabled}
          onClick={onDecrement}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="w-full bg-card"
          aria-label={`Increase ${label.toLowerCase()} by one`}
          disabled={incrementDisabled}
          onClick={onIncrement}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
