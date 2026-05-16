"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
}

interface TabPillBarProps {
  tabs: Tab[];
  className?: string;
}

/**
 * Horizontal-scrolling pill bar for tab navigation.
 * Active tab gets a gold underline and auto-scrolls into view.
 * Works on every viewport — replaces the previous mobile <select>
 * and desktop scroll-strip with one component.
 */
export function TabPillBar({ tabs, className }: TabPillBarProps) {
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const activeHref = tabs.find(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/")
  )?.href;

  React.useEffect(() => {
    if (!activeHref || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLAnchorElement>(
      `[data-href="${activeHref}"]`
    );
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeHref]);

  return (
    <div className={cn("border-b", className)}>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const isActive = activeHref === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-href={tab.href}
              className={cn(
                "relative whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
