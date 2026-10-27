import { useState } from "react";
import { Keypad, PinDots } from "@/components/keypad";
import {
  clearAccount,
  verifyPin,
  type SpareAccount,
} from "@/lib/passcode";
import { cn } from "@/lib/utils";

type LockScreenProps = {
  account: SpareAccount | null;
  onUnlock: () => void;
};

export function LockScreen({ account, onUnlock }: LockScreenProps) {
  const pinLength = account?.pinLength ?? 6;
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const [shake, setShake] = useState(0);
  const [checking, setChecking] = useState(false);
  const [resetArm, setResetArm] = useState(false);

  const push = (key: string) => {
    if (key === "delete") {
      setWrong(false);
      setDigits((current) => current.slice(0, -1));
      return;
    }
    if (!key || digits.length >= pinLength || checking) return;
    const next = digits + key;
    setDigits(next);
    setWrong(false);
    if (next.length === pinLength) {
      setChecking(true);
      void verifyPin(next).then((ok) => {
        setChecking(false);
        if (ok) {
          onUnlock();
          return;
        }
        setWrong(true);
        setShake((n) => n + 1);
        window.setTimeout(() => {
          setDigits("");
          setWrong(false);
        }, 520);
      });
    }
  };

  const reset = () => {
    if (!resetArm) {
      setResetArm(true);
      return;
    }
    clearAccount();
    try {
      localStorage.removeItem("spare-ledger-v1");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-between px-6 pb-10 pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--color-sage)_14%,transparent),transparent)]"
      />
      <div className="relative flex w-full flex-col items-center pt-4">
        <p className="font-display italic text-4xl tracking-tight">Spare</p>
        <p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {account?.name ? `Welcome back, ${account.name}` : "Enter passcode"}
        </p>
        <div className="mt-6">
          <PinDots
            length={pinLength}
            filled={digits.length}
            wrong={wrong}
            shakeKey={shake}
          />
        </div>
        <p
          className={cn(
            "mt-4 h-5 text-sm text-rust transition-opacity duration-150",
            wrong ? "opacity-100" : "opacity-0",
          )}
        >
          Wrong passcode
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center gap-5">
        <Keypad onPress={push} disabled={checking} />
        <button
          type="button"
          onClick={reset}
          className={cn(
            "text-xs underline-offset-4 transition-colors",
            resetArm
              ? "font-medium text-rust underline"
              : "text-muted-foreground hover:underline",
          )}
        >
          {resetArm
            ? "Forgot passcode? Tap again to reset the app (erases all data)"
            : "Forgot passcode?"}
        </button>
      </div>
    </main>
  );
}
