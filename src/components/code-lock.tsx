import { Delete } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CODE = "282013";
const CODE_LENGTH = CODE.length;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "delete", "0", ""];

export function CodeLock({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  const press = useCallback((key: string) => {
    setError(false);
    if (key === "delete") {
      setEntry((e) => e.slice(0, -1));
      return;
    }
    setEntry((e) => (e.length >= CODE_LENGTH ? e : e + key));
  }, []);

  useEffect(() => {
    if (entry.length < CODE_LENGTH) return;
    if (entry === CODE) {
      const t = setTimeout(() => setUnlocked(true), 180);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setError(true);
      setTimeout(() => setEntry(""), 260);
    }, 180);
    return () => clearTimeout(t);
  }, [entry]);

  useEffect(() => {
    if (unlocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("delete");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, press]);

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-foreground">
      <div
        className={cn(
          "spare-rise flex w-full max-w-xs flex-col items-center gap-8",
          error && "spare-shake",
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-display italic text-4xl leading-none tracking-tight">
            Spare
          </span>
          <p className="text-sm text-muted-foreground">Enter your code</p>
        </div>

        <div
          className="flex items-center gap-3"
          aria-label={error ? "Wrong code" : `${entry.length} of ${CODE_LENGTH} digits`}
          role="status"
        >
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-3 rounded-full transition-colors duration-150",
                i < entry.length
                  ? error
                    ? "bg-rust"
                    : "bg-sage"
                  : "shadow-border bg-card",
              )}
            />
          ))}
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          {KEYS.map((key, i) => {
            if (key === "") {
              return <span key={`spacer-${i}`} aria-hidden />;
            }
            if (key === "delete") {
              return (
                <button
                  key="delete"
                  type="button"
                  aria-label="Delete"
                  onClick={() => press("delete")}
                  className="flex h-16 items-center justify-center rounded-xl bg-card text-foreground shadow-border transition-transform duration-150 active:scale-95 hover:bg-accent"
                >
                  <Delete className="size-5 text-muted-foreground" />
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                className={cn(
                  "h-16 rounded-xl font-display text-2xl font-medium shadow-border transition-transform duration-150 active:scale-95",
                  error ? "text-rust" : "text-foreground",
                  "bg-card hover:bg-accent",
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
