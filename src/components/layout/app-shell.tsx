"use client";

import { usePin } from "@/lib/pin-context";
import { PinScreen } from "@/components/layout/pin-screen";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = usePin();

  if (!isUnlocked) {
    return <PinScreen />;
  }

  return <>{children}</>;
}
