"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils";

interface UpcomingItem {
  id: number;
  truckId: number;
  truckNumber: string;
  isDemo: number;
  repairTypeId: number;
  repairTypeName: string | null;
  serviceDate: string | null;
  nextDueDate: string | null;
  nextDueOdometer: number | null;
  currentOdometer: number | null;
  daysUntilDue: number | null;
  milesUntilDue: number | null;
  urgency: "overdue" | "due_soon" | "upcoming";
}

const MAX_ITEMS = 6;

export function UpcomingMaintenanceCard() {
  const { demoVisible } = useDemo();
  const [items, setItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = demoVisible ? "" : "?excludeDemo=1";
    fetch(`/api/maintenance/upcoming${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [demoVisible]);

  const overdueCount = items.filter((i) => i.urgency === "overdue").length;
  const dueSoonCount = items.filter((i) => i.urgency === "due_soon").length;
  const visible = items.slice(0, MAX_ITEMS);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Upcoming Maintenance</CardTitle>
        </div>
        {!loading && items.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {overdueCount > 0 && (
              <span className="font-medium text-destructive">
                {overdueCount} overdue
              </span>
            )}
            {overdueCount > 0 && dueSoonCount > 0 && " · "}
            {dueSoonCount > 0 && (
              <span className="font-medium text-amber-700">
                {dueSoonCount} due soon
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Nothing scheduled. Add maintenance under any truck&apos;s Repairs
            tab to start tracking due dates.
          </div>
        ) : (
          <ul className="divide-y">
            {visible.map((item) => (
              <UpcomingRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {!loading && items.length > MAX_ITEMS && (
          <p className="pt-3 text-xs text-muted-foreground">
            Showing {MAX_ITEMS} of {items.length}. Open a truck for the full list.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingRow({ item }: { item: UpcomingItem }) {
  const Icon =
    item.urgency === "overdue"
      ? AlertTriangle
      : item.urgency === "due_soon"
        ? Clock
        : CalendarCheck;

  return (
    <li>
      <Link
        href={`/trucks/${item.truckId}/repairs`}
        className="flex items-center gap-3 py-2.5 transition-colors hover:bg-accent/40"
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            item.urgency === "overdue" && "text-destructive",
            item.urgency === "due_soon" && "text-amber-600",
            item.urgency === "upcoming" && "text-muted-foreground"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="truncate font-medium">
              {item.repairTypeName || "Maintenance"}
            </span>
            <span className="text-muted-foreground">
              · Truck #{item.truckNumber}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{whenText(item)}</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

function whenText(item: UpcomingItem): string {
  const parts: string[] = [];
  if (item.nextDueDate) {
    const days = item.daysUntilDue;
    let s = `Due ${formatDate(item.nextDueDate)}`;
    if (days !== null && days < 0) s += ` (${Math.abs(days)}d overdue)`;
    else if (days !== null) s += ` (in ${days}d)`;
    parts.push(s);
  }
  if (item.nextDueOdometer != null) {
    const miles = item.milesUntilDue;
    let s = `At ${item.nextDueOdometer.toLocaleString()} mi`;
    if (miles !== null && miles < 0)
      s += ` (${Math.abs(miles).toLocaleString()} mi past)`;
    else if (miles !== null)
      s += ` (${miles.toLocaleString()} mi to go)`;
    parts.push(s);
  }
  return parts.join(" · ") || "Scheduled";
}
