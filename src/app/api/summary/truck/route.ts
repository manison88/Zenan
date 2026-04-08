import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips, fuelLogs, repairs, fixedCosts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { countMonthsInRange } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const truckId = searchParams.get("truckId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!truckId || !startDate || !endDate) {
    return NextResponse.json({ error: "truckId, startDate, endDate required" }, { status: 400 });
  }

  const db = await getDb();
  const tid = Number(truckId);

  // Gross pay = sum of trip amounts
  const grossResult = await db
    .select({ total: sql<number>`coalesce(sum(${trips.amount}), 0)` })
    .from(trips)
    .where(and(eq(trips.truckId, tid), gte(trips.date, startDate), lte(trips.date, endDate)))
    .get();

  // Fuel total
  const fuelResult = await db
    .select({ total: sql<number>`coalesce(sum(${fuelLogs.amount}), 0)` })
    .from(fuelLogs)
    .where(and(eq(fuelLogs.truckId, tid), gte(fuelLogs.date, startDate), lte(fuelLogs.date, endDate)))
    .get();

  // Repairs total
  const repairsResult = await db
    .select({ total: sql<number>`coalesce(sum(${repairs.amount}), 0)` })
    .from(repairs)
    .where(and(eq(repairs.truckId, tid), gte(repairs.date, startDate), lte(repairs.date, endDate)))
    .get();

  // Fixed costs
  const fc = await db
    .select()
    .from(fixedCosts)
    .where(eq(fixedCosts.truckId, tid))
    .get();

  const months = countMonthsInRange(startDate, endDate);
  const insurance = (fc?.insurance || 0) * months;
  const parking = (fc?.parking || 0) * months;
  const eld = (fc?.eld || 0) * months;
  const tolls = (fc?.tolls || 0) * months;

  const grossPay = grossResult?.total || 0;
  const fuelTotal = fuelResult?.total || 0;
  const repairsTotal = repairsResult?.total || 0;
  const fixedTotal = insurance + parking + eld + tolls;
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
    fixedTotal,
    totalDeductions,
    netPay,
    months,
  });
}
