"use client";

import { usePathname } from "next/navigation";
import { usePin } from "@/lib/pin-context";
import { PinScreen } from "@/components/layout/pin-screen";
import { Sidebar } from "@/components/layout/sidebar";

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/onboarding") return true;
  if (pathname.startsWith("/onboarding/")) return true;
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUnlocked } = usePin();

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (!isUnlocked) {
    return <PinScreen />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
