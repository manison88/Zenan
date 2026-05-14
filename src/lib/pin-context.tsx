"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const DEFAULT_PIN = "122008";
const PIN_KEY = "zenan-pin";
const ONBOARDED_KEY = "zenan-onboarded";
const FLEET_NAME_KEY = "zenan-fleet-name";

interface PinContextValue {
  isUnlocked: boolean;
  isOnboarded: boolean;
  fleetName: string;
  unlock: (pin: string) => boolean;
  updatePin: (currentPin: string, newPin: string) => boolean;
  setInitialPin: (newPin: string) => void;
  completeOnboarding: (fleetName: string) => void;
}

const PinContext = createContext<PinContextValue>({
  isUnlocked: false,
  isOnboarded: false,
  fleetName: "",
  unlock: () => false,
  updatePin: () => false,
  setInitialPin: () => {},
  completeOnboarding: () => {},
});

export function usePin() {
  return useContext(PinContext);
}

function readLocal(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export function PinProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [storedPin, setStoredPin] = useState(() => readLocal(PIN_KEY, DEFAULT_PIN));
  const [isOnboarded, setIsOnboarded] = useState(() => readLocal(ONBOARDED_KEY) === "true");
  const [fleetName, setFleetName] = useState(() => readLocal(FLEET_NAME_KEY));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
      localStorage.setItem(PIN_KEY, newPin);
      return true;
    },
    [storedPin]
  );

  const setInitialPin = useCallback((newPin: string) => {
    setStoredPin(newPin);
    localStorage.setItem(PIN_KEY, newPin);
    setIsUnlocked(true);
  }, []);

  const completeOnboarding = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem(FLEET_NAME_KEY, trimmed);
      setFleetName(trimmed);
    }
    localStorage.setItem(ONBOARDED_KEY, "true");
    setIsOnboarded(true);
  }, []);

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted) return null;

  return (
    <PinContext.Provider
      value={{
        isUnlocked,
        isOnboarded,
        fleetName,
        unlock,
        updatePin,
        setInitialPin,
        completeOnboarding,
      }}
    >
      {children}
    </PinContext.Provider>
  );
}
