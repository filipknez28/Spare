import { Delete } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CODE = "282013";
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const [shake, setShake] = useState(0);

  const push = (key: string) => {
    if (key === "del") {
      setWrong(false);
      setDigits((current) => current.slice(0, -1));
      return;
    }
    if (!key || digits.length >= CODE.length) return;
    const next = digits + key;
    setDigits(next);
    setWrong(false);
    if (next.length === CODE.length) {
      if (next === CODE) {
        onUnlock();
        return;
      }
      setWrong(true);
      setShake((n) => n + 1);
      window.setTimeout(() => setDigits(""), 420);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-between px-6 py-12">
      <div className="flex w-full flex-col items-center pt-6">
        <p className="font-display italic text-4xl tracking-tight">Spare</p>
        <p className="mt-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Enter code
        </p>
        <div
          key={shake}
          className={cn("mt-6 flex gap-3", wrong && "spare-shake")}
          aria-label="Code"
        >
          {Array.from({ length: CODE.length }, (_, index) => (
            <span
              key={index}
              className={cn(
                "size-2.5 rounded-full transition-colors duration-150",
                digits.length > index
                  ? wrong
                    ? "bg-rust"
                    : "bg-foreground"
                  : "bg-border",
              )}
            />
          ))}
        </div>
        <p
          className={cn(
            "mt-4 h-5 text-sm text-rust transition-opacity duration-150",
            wrong ? "opacity-100" : "opacity-0",
          )}
        >
          Wrong code
        </p>
      </div>

      <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
        {KEYS.map((key) => {
          if (key === "") return <span key="gap" />;
          const label = key === "del" ? "Delete" : key;
          return (
            <button
              key={key}
              type="button"
              aria-label={label}
              onClick={() => push(key)}
              className="flex h-16 items-center justify-center rounded-2xl bg-card text-2xl font-medium tabular-nums text-foreground shadow-border transition-[background-color,transform] duration-150 active:scale-[0.96] active:bg-accent"
            >
              {key === "del" ? <Delete className="size-5" /> : key}
            </button>
          );
        })}
      </div>
    </main>
  );
}
