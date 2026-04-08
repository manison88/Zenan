"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface DemoContextValue {
  demoVisible: boolean;
  setDemoVisible: (visible: boolean) => void;
  demoReady: boolean;
}

const DemoContext = createContext<DemoContextValue>({
  demoVisible: true,
  setDemoVisible: () => {},
  demoReady: false,
});

export function useDemo() {
  return useContext(DemoContext);
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoVisible, setDemoVisibleState] = useState(true);
  const [demoReady, setDemoReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("zenan-demo-visible");
    if (stored !== null) {
      setDemoVisibleState(stored === "true");
    }
    setMounted(true);
  }, []);

  // Auto-seed demo data if it doesn't exist
  useEffect(() => {
    if (!mounted) return;

    async function ensureDemo() {
      try {
        const res = await fetch("/api/trucks");
        const allTrucks = await res.json();
        const hasDemo = allTrucks.some((t: { isDemo: number }) => t.isDemo === 1);

        if (!hasDemo) {
          await fetch("/api/seed-demo", { method: "POST" });
        }
      } catch {
        // Silently fail — demo data is optional
      } finally {
        setDemoReady(true);
      }
    }

    ensureDemo();
  }, [mounted]);

  const setDemoVisible = useCallback((visible: boolean) => {
    setDemoVisibleState(visible);
    localStorage.setItem("zenan-demo-visible", String(visible));
  }, []);

  return (
    <DemoContext.Provider value={{ demoVisible, demoReady, setDemoVisible }}>
      {children}
    </DemoContext.Provider>
  );
}
