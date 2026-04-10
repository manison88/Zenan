"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const DEFAULT_PIN = "122008";

interface PinContextValue {
  isUnlocked: boolean;
  unlock: (pin: string) => boolean;
  updatePin: (currentPin: string, newPin: string) => boolean;
}

const PinContext = createContext<PinContextValue>({
  isUnlocked: false,
  unlock: () => false,
  updatePin: () => false,
});

export function usePin() {
  return useContext(PinContext);
}

export function PinProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [storedPin, setStoredPin] = useState(DEFAULT_PIN);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zenan-pin");
    if (saved) {
      setStoredPin(saved);
    }
    setMounted(true);
  }, []);

  const unlock = useCallback(
    (pin: string) => {
      if (pin === storedPin) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    },
    [storedPin]
  );

  const updatePin = useCallback(
    (currentPin: string, newPin: string) => {
      if (currentPin !== storedPin) return false;
      setStoredPin(newPin);
      localStorage.setItem("zenan-pin", newPin);
      return true;
    },
    [storedPin]
  );

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted) return null;

  return (
    <PinContext.Provider value={{ isUnlocked, unlock, updatePin }}>
      {children}
    </PinContext.Provider>
  );
}
