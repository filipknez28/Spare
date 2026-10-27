import { useState } from "react";
import { Keypad, PinDots } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import {
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  createAccount,
  type SpareAccount,
} from "@/lib/passcode";
import { cn } from "@/lib/utils";

type Step = "welcome" | "name" | "pin" | "confirm";

export function AccountOnboarding({
  onDone,
}: {
  onDone: (account: SpareAccount) => void;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [busy, setBusy] = useState(false);

  const pressPin = (key: string) => {
    if (key === "delete") {
      setMismatch(false);
      if (step === "confirm") setConfirm((c) => c.slice(0, -1));
      else setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key) return;
    if (step === "confirm") {
      if (confirm.length >= pin.length) return;
      const next = confirm + key;
      setConfirm(next);
      setMismatch(false);
      if (next.length === pin.length) {
        if (next === pin) {
          setBusy(true);
          void createAccount(name, pin).then((account) => onDone(account));
        } else {
          setMismatch(true);
          window.setTimeout(() => {
            setConfirm("");
            setMismatch(false);
          }, 550);
        }
      }
      return;
    }
    if (pin.length >= PIN_MAX_LENGTH) return;
    setPin((p) => p + key);
  };

  const header = (
    <p className="font-display italic text-4xl tracking-tight">Spare</p>
  );

  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center px-6 pb-10 pt-16 sm:justify-center sm:pt-8",
      )}
    >
      {step === "welcome" ? (
        <div className="spare-rise flex w-full flex-col items-center gap-6 text-center sm:gap-8">
          <div className="flex flex-col items-center gap-3">
            {header}
            <p className="max-w-xs text-pretty text-base leading-relaxed text-muted-foreground">
              A weekly ledger for your screen time. Set a daily budget, log
              what you used, and watch what you spare add up.
            </p>
          </div>
          <ul className="flex w-full max-w-xs flex-col gap-2 text-left text-sm text-muted-foreground">
            <li className="rounded-xl bg-card px-4 py-3 shadow-border">
              Create your account with a passcode you choose
            </li>
            <li className="rounded-xl bg-card px-4 py-3 shadow-border">
              Your ledger stays on this device, behind that passcode
            </li>
            <li className="rounded-xl bg-card px-4 py-3 shadow-border">
              Works in the browser and on your iPhone
            </li>
          </ul>
          <Button
            type="button"
            size="lg"
            className="w-full max-w-xs"
            onClick={() => setStep("name")}
          >
            Get started
          </Button>
        </div>
      ) : null}

      {step === "name" ? (
        <div className="spare-rise flex w-full flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            {header}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Step 1 of 3
              </p>
              <h1 className="mt-2 font-display text-2xl font-medium tracking-tight">
                What should we call you?
              </h1>
            </div>
          </div>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && name.trim()) setStep("pin");
            }}
            maxLength={24}
            enterKeyHint="done"
            placeholder="Your name"
            aria-label="Your name"
            className="w-full rounded-xl bg-card px-4 py-3.5 text-lg shadow-border outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!name.trim()}
            onClick={() => setStep("pin")}
          >
            Continue
          </Button>
        </div>
      ) : null}

      {step === "pin" || step === "confirm" ? (
        <div className="spare-rise flex w-full flex-col items-center gap-8">
          <div className="flex w-full flex-col items-center gap-3 text-center">
            {header}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Step {step === "pin" ? "2" : "3"} of 3
              </p>
              <h1 className="mt-2 font-display text-2xl font-medium tracking-tight">
                {step === "pin" ? "Choose your passcode" : "Confirm it once more"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === "pin"
                  ? `${PIN_MIN_LENGTH} to ${PIN_MAX_LENGTH} digits. You will type it to open Spare.`
                  : "Same digits again, so a typo cannot lock you out."}
              </p>
            </div>
            <PinDots
              length={step === "pin" ? Math.max(PIN_MIN_LENGTH, pin.length) : pin.length}
              filled={step === "pin" ? pin.length : confirm.length}
              wrong={mismatch}
            />
            <p
              className={cn(
                "h-5 text-sm text-rust transition-opacity duration-150",
                mismatch ? "opacity-100" : "opacity-0",
              )}
            >
              Passcodes don't match
            </p>
          </div>
          <Keypad onPress={pressPin} disabled={busy} />
          {step === "pin" ? (
            <Button
              type="button"
              size="lg"
              className="w-full max-w-[280px]"
              disabled={pin.length < PIN_MIN_LENGTH}
              onClick={() => {
                setStep("confirm");
                setConfirm("");
              }}
            >
              Continue
            </Button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
