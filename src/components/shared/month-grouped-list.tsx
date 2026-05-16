"use client";

import { useMemo, type ReactNode } from "react";
import { parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";

interface MonthGroupedListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  getDate: (item: T) => string | null;
  renderItem: (item: T) => ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

/**
 * Renders a chronological card list grouped by month with sticky
 * month headers. Items missing a date go into an "Other" group at top.
 * Used on Trips / Fuel / Repairs / Odometer for cleaner scroll on mobile.
 */
export function MonthGroupedList<T>({
  items,
  getKey,
  getDate,
  renderItem,
  emptyState,
  className,
}: MonthGroupedListProps<T>) {
  const groups = useMemo(() => {
    const byMonth = new Map<string, T[]>();
    for (const item of items) {
      const date = getDate(item);
      const monthKey = date ? format(parseISO(date), "yyyy-MM") : "0000-00";
      const monthLabel = date
        ? format(parseISO(date), "MMMM yyyy")
        : "Other";
      const key = `${monthKey}|${monthLabel}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(item);
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => ({
        label: key.split("|")[1],
        items,
      }));
  }, [items, getDate]);

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((g) => (
        <section key={g.label}>
          <div className="sticky top-14 z-10 -mx-4 mb-2 bg-background/95 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur md:static md:mx-0 md:px-0 md:bg-transparent">
            {g.label}
          </div>
          <div className="space-y-2">
            {g.items.map((item) => (
              <div key={getKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
