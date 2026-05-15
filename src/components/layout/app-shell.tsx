"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeaderProvider } from "@/components/layout/page-header";

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname === "/onboarding") return true;
  if (pathname.startsWith("/onboarding/")) return true;
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const isPublic = isPublicPath(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isPublic) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [isPublic, status, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
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
