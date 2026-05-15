"use client";

import { useState } from "react";
import { usePin } from "@/lib/pin-context";
import { PinScreen } from "@/components/layout/pin-screen";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeaderProvider } from "@/components/layout/page-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = usePin();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isUnlocked) {
    return <PinScreen />;
  }

  return (
    <PageHeaderProvider>
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 safe-x">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    </PageHeaderProvider>
  );
}
