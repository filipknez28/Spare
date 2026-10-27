import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Keypad, PinDots } from "@/components/keypad";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  changePin,
  verifyPin,
  type SpareAccount,
} from "@/lib/passcode";
import { cn } from "@/lib/utils";

type PinPrompt = {
  title: string;
  hint: string;
  min: number;
  max: number;
};

type AccountSheetProps = {
  open: boolean;
  account: SpareAccount | null;
  onClose: () => void;
};

export function AccountSheet({ open, account, onClose }: AccountSheetProps) {
  const [view, setView] = useState<"menu" | "pin">("menu");
  const [pinStep, setPinStep] = useState(0);
  const [entry, setEntry] = useState("");
  const [newPin, setNewPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setView("menu");
      setPinStep(0);
      setEntry("");
      setNewPin("");
      setCurrentPin("");
      setError("");
      setBusy(false);
    }
  }, [open]);

  if (!account) return null;

  const prompts: PinPrompt[] = [
    {
      title: "Current passcode",
      hint: "Type the one you use now.",
      min: account.pinLength,
      max: account.pinLength,
    },
    {
      title: "New passcode",
      hint: `${PIN_MIN_LENGTH} to ${PIN_MAX_LENGTH} digits.`,
      min: PIN_MIN_LENGTH,
      max: PIN_MAX_LENGTH,
    },
    {
      title: "Confirm new passcode",
      hint: "Same digits again.",
      min: newPin.length,
      max: newPin.length,
    },
  ];
  const prompt = prompts[pinStep];

  const press = (key: string) => {
    if (key === "delete") {
      setError("");
      setEntry((e) => e.slice(0, -1));
      return;
    }
    if (!key || entry.length >= prompt.max || busy) return;
    setEntry((e) => e + key);
  };

  const advancePin = async () => {
    if (entry.length < prompt.min) return;
    if (pinStep === 0) {
      setBusy(true);
      const ok = await verifyPin(entry);
      setBusy(false);
      if (!ok) {
        setError("That's not your current passcode.");
        setEntry("");
        return;
      }
      setCurrentPin(entry);
      setEntry("");
      setPinStep(1);
      return;
    }
    if (pinStep === 1) {
      setNewPin(entry);
      setEntry("");
      setPinStep(2);
      return;
    }
    if (entry !== newPin) {
      setError("Passcodes don't match.");
      setEntry("");
      return;
    }
    setBusy(true);
    const ok = await changePin(currentPin, newPin);
    setBusy(false);
    if (!ok) {
      setError("Could not update the passcode. Try again.");
      return;
    }
    toast("Passcode updated", { description: "Use it next time you open Spare." });
    onClose();
  };

  const exportData = () => {
    const raw = localStorage.getItem("spare-ledger-v1") ?? "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `spare-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof (parsed as { logs?: unknown }).logs !== "object"
      ) {
        throw new Error("bad shape");
      }
      localStorage.setItem("spare-ledger-v1", JSON.stringify(parsed));
      toast("Backup restored", { description: "Reloading…" });
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      toast("Couldn't read that backup file");
    }
  };

  const signOut = () => {
    sessionStorage.removeItem("spare-gate");
    window.location.reload();
  };

  if (view === "pin") {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <div className="flex flex-col items-center gap-6 overflow-y-auto px-5 pb-6 pt-4">
          <header className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Passcode
            </p>
            <SheetTitle className="font-display text-3xl font-medium tracking-tight">
              {prompt.title}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {prompt.hint}
            </SheetDescription>
          </header>
          <PinDots
            length={prompt.min}
            filled={entry.length}
            wrong={Boolean(error)}
          />
          {error ? <p className="text-sm text-rust">{error}</p> : null}
          <Keypad onPress={press} disabled={busy} />
          <Button
            type="button"
            size="lg"
            className="w-full max-w-[280px]"
            disabled={entry.length < prompt.min || busy}
            onClick={() => void advancePin()}
          >
            {pinStep < 2 ? "Continue" : "Save passcode"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full max-w-[280px]"
            onClick={() => {
              setView("menu");
              setPinStep(0);
              setEntry("");
              setError("");
            }}
          >
            Cancel
          </Button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-6 pt-4">
        <header className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage-soft font-display text-lg font-semibold text-sage">
            {account.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate font-display text-2xl font-medium tracking-tight">
              {account.name}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Passcode protected, stored on this device
            </SheetDescription>
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={() => {
              setView("pin");
              setPinStep(0);
              setEntry("");
            }}
          >
            Change passcode
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={exportData}
          >
            Export data (backup file)
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn("w-full justify-start")}
            onClick={() => fileInput.current?.click()}
          >
            Import data (backup file)
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importData(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={signOut}
          >
            Lock now
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your ledger lives in this browser (and in the app on this phone).
          Export a backup file to carry it to another device.
        </p>
      </div>
    </Sheet>
  );
}
