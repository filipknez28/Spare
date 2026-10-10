import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ledger } from "@/components/ledger";
import { LockScreen } from "@/components/lock-screen";

export const Route = createFileRoute("/")({ component: Home });

const GATE_KEY = "spare-gate";

function Home() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(GATE_KEY) === "1") setOpen(true);
  }, []);

  if (!open) {
    return (
      <LockScreen
        onUnlock={() => {
          sessionStorage.setItem(GATE_KEY, "1");
          setOpen(true);
        }}
      />
    );
  }

  return <Ledger />;
}
