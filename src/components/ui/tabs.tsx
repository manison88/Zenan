"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Tab {
  label: string;
  href: string;
}

interface TabNavProps {
  tabs: Tab[];
  className?: string;
}

export function TabNav({ tabs, className }: TabNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const stripRef = React.useRef<HTMLElement>(null);

  const activeTab = tabs.find(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/")
  );

  React.useEffect(() => {
    if (!activeTab || !stripRef.current) return;
    const el = stripRef.current.querySelector<HTMLAnchorElement>(
      `[data-href="${activeTab.href}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  return (
    <div className={cn("border-b", className)}>
      <div className="md:hidden p-2">
        <select
          value={activeTab?.href ?? tabs[0]?.href}
          onChange={(e) => router.push(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-base font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {tabs.map((tab) => (
            <option key={tab.href} value={tab.href}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <nav
        ref={stripRef}
        className="-mb-px hidden md:flex space-x-6 overflow-x-auto"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
