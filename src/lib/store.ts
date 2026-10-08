import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clampMinutes } from "@/lib/time";

export type DayLog = {
  spentMinutes: number;
  allowanceMinutes: number;
};

type SpareState = {
  dailyAllowanceMinutes: number | null;
  logs: Record<string, DayLog>;
  setAllowance: (minutes: number) => void;
  logDay: (dateKey: string, spentMinutes: number) => void;
  clearDay: (dateKey: string) => void;
  resetAll: () => void;
};

export const useSpareStore = create<SpareState>()(
  persist(
    (set, get) => ({
      dailyAllowanceMinutes: null,
      logs: {},
      setAllowance: (minutes) => {
        set({ dailyAllowanceMinutes: clampMinutes(minutes) });
      },
      logDay: (dateKey, spentMinutes) => {
        const current = get();
        const existing = current.logs[dateKey];
        const allowance =
          existing?.allowanceMinutes ?? current.dailyAllowanceMinutes;
        if (allowance == null) return;
        set({
          logs: {
            ...current.logs,
            [dateKey]: {
              spentMinutes: clampMinutes(spentMinutes),
              allowanceMinutes: allowance,
            },
          },
        });
      },
      clearDay: (dateKey) => {
        const logs = { ...get().logs };
        delete logs[dateKey];
        set({ logs });
      },
      resetAll: () => set({ logs: {}, dailyAllowanceMinutes: null }),
    }),
    {
      name: "spare-ledger-v1",
      skipHydration: true,
      partialize: (state) => ({
        dailyAllowanceMinutes: state.dailyAllowanceMinutes,
        logs: state.logs,
      }),
    },
  ),
);

export function useRehydrateSpare() {
  useEffect(() => {
    void useSpareStore.persist.rehydrate();
  }, []);
}

export type WeekTotals = {
  budget: number;
  spent: number;
  net: number;
  saved: number;
  over: number;
  logged: number;
};

export function totalsForKeys(
  keys: string[],
  logs: Record<string, DayLog>,
): WeekTotals {
  let budget = 0;
  let spent = 0;
  let logged = 0;
  for (const key of keys) {
    const log = logs[key];
    if (!log) continue;
    logged += 1;
    budget += log.allowanceMinutes;
    spent += log.spentMinutes;
  }
  const net = budget - spent;
  return {
    budget,
    spent,
    net,
    saved: Math.max(0, net),
    over: Math.max(0, -net),
    logged,
  };
}
