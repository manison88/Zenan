"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface DemoContextValue {
  demoVisible: boolean;
  setDemoVisible: (visible: boolean) => void;
  demoReady: boolean;
  seedDemoData: () => Promise<void>;
}

const DemoContext = createContext<DemoContextValue>({
  demoVisible: true,
  setDemoVisible: () => {},
  demoReady: false,
  seedDemoData: async () => {},
});

export function useDemo() {
  return useContext(DemoContext);
}

async function seedIfMissing() {
  const res = await fetch("/api/trucks");
  const allTrucks = await res.json();
  const hasDemo = allTrucks.some((t: { isDemo: number }) => t.isDemo === 1);
  if (!hasDemo) {
    await fetch("/api/seed-demo", { method: "POST" });
  }
}

function readDemoVisible(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("zenan-demo-visible");
  return stored === null ? true : stored === "true";
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoVisible, setDemoVisibleState] = useState(readDemoVisible);
  const [demoReady, setDemoReady] = useState(false);

  // Auto-seed only if user opted into demo during onboarding.
  useEffect(() => {
    let cancelled = false;
    const seedFlag = localStorage.getItem("zenan-seed-demo");
    if (seedFlag !== "true") {
      if (!cancelled) setDemoReady(true);
      return () => {
        cancelled = true;
      };
    }

    seedIfMissing()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDemoReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setDemoVisible = useCallback((visible: boolean) => {
    setDemoVisibleState(visible);
    localStorage.setItem("zenan-demo-visible", String(visible));
  }, []);

  const seedDemoData = useCallback(async () => {
    localStorage.setItem("zenan-seed-demo", "true");
    setDemoVisibleState(true);
    localStorage.setItem("zenan-demo-visible", "true");
    await seedIfMissing().catch(() => {});
    setDemoReady(true);
  }, []);

  return (
    <DemoContext.Provider value={{ demoVisible, demoReady, setDemoVisible, seedDemoData }}>
      {children}
    </DemoContext.Provider>
  );
}
