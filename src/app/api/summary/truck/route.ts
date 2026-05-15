import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips, fuelLogs, repairs, fixedCosts, customFixedCosts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { countMonthsInRange } from "@/lib/date-utils";
import { requireTenant, isAuthError } from "@/lib/auth/session";
import { ownTruck } from "@/lib/auth/tenant-scope";

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const truckId = searchParams.get("truckId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!truckId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "truckId, startDate, endDate required" },
      { status: 400 }
    );
  }

  const truck = await ownTruck(auth.tenantId, Number(truckId));
  if (truck instanceof NextResponse) return truck;

  const db = await getDb();
  const tid = Number(truckId);

  const grossResult = await db
    .select({ total: sql<number>`coalesce(sum(${trips.amount}), 0)` })
    .from(trips)
    .where(and(eq(trips.truckId, tid), gte(trips.date, startDate), lte(trips.date, endDate)))
    .get();

  const fuelResult = await db
    .select({ total: sql<number>`coalesce(sum(${fuelLogs.amount}), 0)` })
    .from(fuelLogs)
    .where(and(eq(fuelLogs.truckId, tid), gte(fuelLogs.date, startDate), lte(fuelLogs.date, endDate)))
    .get();

  const repairsResult = await db
    .select({ total: sql<number>`coalesce(sum(${repairs.amount}), 0)` })
    .from(repairs)
    .where(and(eq(repairs.truckId, tid), gte(repairs.date, startDate), lte(repairs.date, endDate)))
    .get();

  const fc = await db
    .select()
    .from(fixedCosts)
    .where(eq(fixedCosts.truckId, tid))
    .get();

  const customCosts = await db
    .select()
    .from(customFixedCosts)
    .where(eq(customFixedCosts.truckId, tid));

  const months = countMonthsInRange(startDate, endDate);
  const insurance = (fc?.insurance || 0) * months;
  const parking = (fc?.parking || 0) * months;
  const eld = (fc?.eld || 0) * months;
  const tolls = (fc?.tolls || 0) * months;
  const customFixedTotal =
    customCosts.reduce((sum, c) => sum + c.amount, 0) * months;

  const grossPay = grossResult?.total || 0;
  const fuelTotal = fuelResult?.total || 0;
  const repairsTotal = repairsResult?.total || 0;
  const fixedTotal = insurance + parking + eld + tolls + customFixedTotal;
  const totalDeductions = fuelTotal + repairsTotal + fixedTotal;
  const netPay = grossPay - totalDeductions;

  return NextResponse.json({
    grossPay,
    fuelTotal,
    repairsTotal,
    insurance,
    parking,
    eld,
    tolls,
    customFixedTotal,
    customCosts: customCosts.map((c) => ({ name: c.name, total: c.amount * months })),
    fixedTotal,
    totalDeductions,
    netPay,
    months,
  });
}
