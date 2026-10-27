import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "spacer", "0", "delete"] as const;

type KeypadProps = {
  onPress: (key: string) => void;
  className?: string;
  disabled?: boolean;
};

export function Keypad({ onPress, className, disabled }: KeypadProps) {
  return (
    <div className={cn("grid w-full max-w-[280px] grid-cols-3 gap-3", className)}>
      {KEYS.map((key) => {
        if (key === "spacer") return <span key="gap" aria-hidden />;
        const label = key === "delete" ? "Delete" : key;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={() => onPress(key)}
            className="flex h-16 items-center justify-center rounded-2xl bg-card text-2xl font-medium tabular-nums text-foreground shadow-border transition-[background-color,transform] duration-150 active:scale-[0.96] active:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            {key === "delete" ? <Delete className="size-5" /> : key}
          </button>
        );
      })}
    </div>
  );
}

export function PinDots({
  length,
  filled,
  wrong,
  shakeKey,
}: {
  length: number;
  filled: number;
  wrong?: boolean;
  shakeKey?: number;
}) {
  return (
    <div
      key={shakeKey}
      className={cn("flex gap-3", wrong && "spare-shake")}
      aria-label={wrong ? "Wrong passcode" : `${filled} of ${length} digits`}
      role="status"
    >
      {Array.from({ length }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2.5 rounded-full transition-colors duration-150",
            index < filled ? (wrong ? "bg-rust" : "bg-foreground") : "bg-border",
          )}
        />
      ))}
    </div>
  );
}
