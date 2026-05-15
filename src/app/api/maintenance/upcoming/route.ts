import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { maintenanceLogs, repairTypes, trucks, odometerLogs } from "@/db/schema";
import { and, eq, inArray, isNotNull, or, desc, sql } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DUE_SOON_DAYS = 14;
const DUE_SOON_MILES = 1000;

type Urgency = "overdue" | "due_soon" | "upcoming";

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
  urgency: Urgency;
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T00:00:00Z").getTime();
  const b = new Date(toIso + "T00:00:00Z").getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function urgencyRank(u: Urgency): number {
  return u === "overdue" ? 0 : u === "due_soon" ? 1 : 2;
}

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const excludeDemo = searchParams.get("excludeDemo") === "1";

  const db = await getDb();

  const rows = await db
    .select({
      id: maintenanceLogs.id,
      truckId: maintenanceLogs.truckId,
      truckNumber: trucks.truckNumber,
      isDemo: trucks.isDemo,
      repairTypeId: maintenanceLogs.repairTypeId,
      repairTypeName: repairTypes.name,
      serviceDate: maintenanceLogs.serviceDate,
      serviceOdometer: maintenanceLogs.serviceOdometer,
      nextDueDate: maintenanceLogs.nextDueDate,
      nextDueOdometer: maintenanceLogs.nextDueOdometer,
      createdAt: maintenanceLogs.createdAt,
    })
    .from(maintenanceLogs)
    .innerJoin(trucks, eq(maintenanceLogs.truckId, trucks.id))
    .leftJoin(repairTypes, eq(maintenanceLogs.repairTypeId, repairTypes.id))
    .where(
      and(
        eq(trucks.tenantId, auth.tenantId),
        or(
          isNotNull(maintenanceLogs.nextDueDate),
          isNotNull(maintenanceLogs.nextDueOdometer)
        )
      )
    )
    .orderBy(desc(maintenanceLogs.serviceDate), desc(maintenanceLogs.createdAt));

  const ownedTrucks = db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, auth.tenantId));

  const odoRows = await db
    .select({
      truckId: odometerLogs.truckId,
      maxOdo: sql<number>`max(${odometerLogs.endingReading})`,
    })
    .from(odometerLogs)
    .where(inArray(odometerLogs.truckId, ownedTrucks))
    .groupBy(odometerLogs.truckId);

  const odoByTruck = new Map<number, number>();
  for (const r of odoRows) {
    if (r.maxOdo != null) odoByTruck.set(r.truckId, r.maxOdo);
  }

  // Keep only the most recent maintenance per (truckId, repairTypeId).
  const seen = new Set<string>();
  const today = todayIso();
  const items: UpcomingItem[] = [];

  for (const r of rows) {
    if (excludeDemo && r.isDemo === 1) continue;
    const key = `${r.truckId}:${r.repairTypeId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const currentOdometer = odoByTruck.get(r.truckId) ?? null;
    const daysUntilDue = r.nextDueDate ? daysBetween(today, r.nextDueDate) : null;
    const milesUntilDue =
      r.nextDueOdometer != null && currentOdometer != null
        ? r.nextDueOdometer - currentOdometer
        : null;

    let urgency: Urgency = "upcoming";
    const dateOverdue = daysUntilDue !== null && daysUntilDue < 0;
    const milesOverdue = milesUntilDue !== null && milesUntilDue < 0;
    const dateSoon =
      daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= DUE_SOON_DAYS;
    const milesSoon =
      milesUntilDue !== null &&
      milesUntilDue >= 0 &&
      milesUntilDue <= DUE_SOON_MILES;

    if (dateOverdue || milesOverdue) urgency = "overdue";
    else if (dateSoon || milesSoon) urgency = "due_soon";

    items.push({
      id: r.id,
      truckId: r.truckId,
      truckNumber: r.truckNumber,
      isDemo: r.isDemo,
      repairTypeId: r.repairTypeId,
      repairTypeName: r.repairTypeName,
      serviceDate: r.serviceDate,
      nextDueDate: r.nextDueDate,
      nextDueOdometer: r.nextDueOdometer,
      currentOdometer,
      daysUntilDue,
      milesUntilDue,
      urgency,
    });
  }

  items.sort((a, b) => {
    const r = urgencyRank(a.urgency) - urgencyRank(b.urgency);
    if (r !== 0) return r;
    const aDays = a.daysUntilDue ?? Number.POSITIVE_INFINITY;
    const bDays = b.daysUntilDue ?? Number.POSITIVE_INFINITY;
    if (aDays !== bDays) return aDays - bDays;
    const aMiles = a.milesUntilDue ?? Number.POSITIVE_INFINITY;
    const bMiles = b.milesUntilDue ?? Number.POSITIVE_INFINITY;
    return aMiles - bMiles;
  });

  return NextResponse.json(items);
}
