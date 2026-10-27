import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ledger } from "@/components/ledger";
import { LockScreen } from "@/components/lock-screen";
import { AccountOnboarding } from "@/components/onboarding";
import { readAccount, type SpareAccount } from "@/lib/passcode";

export const Route = createFileRoute("/")({ component: Home });

const GATE_KEY = "spare-gate";

type Phase = "loading" | "onboarding" | "locked" | "open";

function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [account, setAccount] = useState<SpareAccount | null>(null);

  useEffect(() => {
    const existing = readAccount();
    setAccount(existing);
    if (!existing) {
      setPhase("onboarding");
      return;
    }
    setPhase(sessionStorage.getItem(GATE_KEY) === "1" ? "open" : "locked");
  }, []);

  if (phase === "loading") return null;

  if (phase === "onboarding") {
    return (
      <AccountOnboarding
        onDone={(created) => {
          setAccount(created);
          sessionStorage.setItem(GATE_KEY, "1");
          setPhase("open");
        }}
      />
    );
  }

  if (phase === "locked") {
    return (
      <LockScreen
        account={account}
        onUnlock={() => {
          sessionStorage.setItem(GATE_KEY, "1");
          setPhase("open");
        }}
      />
    );
  }

  return <Ledger account={account} />;
}
