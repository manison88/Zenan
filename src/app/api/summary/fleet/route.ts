import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks, trips, fuelLogs, repairs, fixedCosts, customFixedCosts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { countMonthsInRange } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
  }

  const excludeDemo = searchParams.get("excludeDemo") === "1";

  const db = await getDb();

  let trucksQuery = db.select().from(trucks);
  if (excludeDemo) {
    trucksQuery = trucksQuery.where(eq(trucks.isDemo, 0)) as typeof trucksQuery;
  }
  const allTrucks = await trucksQuery.orderBy(trucks.truckNumber);
  const months = countMonthsInRange(startDate, endDate);

  const truckSummaries = await Promise.all(
    allTrucks.map(async (truck) => {
      const grossResult = await db
        .select({ total: sql<number>`coalesce(sum(${trips.amount}), 0)` })
        .from(trips)
        .where(and(eq(trips.truckId, truck.id), gte(trips.date, startDate), lte(trips.date, endDate)))
        .get();

      const fuelResult = await db
        .select({ total: sql<number>`coalesce(sum(${fuelLogs.amount}), 0)` })
        .from(fuelLogs)
        .where(and(eq(fuelLogs.truckId, truck.id), gte(fuelLogs.date, startDate), lte(fuelLogs.date, endDate)))
        .get();

      const repairsResult = await db
        .select({ total: sql<number>`coalesce(sum(${repairs.amount}), 0)` })
        .from(repairs)
        .where(and(eq(repairs.truckId, truck.id), gte(repairs.date, startDate), lte(repairs.date, endDate)))
        .get();

      const fc = await db
        .select()
        .from(fixedCosts)
        .where(eq(fixedCosts.truckId, truck.id))
        .get();

      const customCosts = await db
        .select()
        .from(customFixedCosts)
        .where(eq(customFixedCosts.truckId, truck.id));

      const insurance = (fc?.insurance || 0) * months;
      const parking = (fc?.parking || 0) * months;
      const eld = (fc?.eld || 0) * months;
      const tolls = (fc?.tolls || 0) * months;
      const customFixedTotal = customCosts.reduce((sum, c) => sum + c.amount, 0) * months;
      const grossPay = grossResult?.total || 0;
      const fuelTotal = fuelResult?.total || 0;
      const repairsTotal = repairsResult?.total || 0;
      const fixedTotal = insurance + parking + eld + tolls + customFixedTotal;
      const totalDeductions = fuelTotal + repairsTotal + fixedTotal;
      const netPay = grossPay - totalDeductions;

      return {
        truckId: truck.id,
        truckNumber: truck.truckNumber,
        grossPay,
        fuelTotal,
        repairsTotal,
        insurance,
        parking,
        eld,
        tolls,
        customFixedTotal,
        fixedTotal,
        totalDeductions,
        netPay,
      };
    })
  );

  // Fleet totals
  const totals = truckSummaries.reduce(
    (acc, t) => ({
      grossPay: acc.grossPay + t.grossPay,
      fuelTotal: acc.fuelTotal + t.fuelTotal,
      repairsTotal: acc.repairsTotal + t.repairsTotal,
      insurance: acc.insurance + t.insurance,
      parking: acc.parking + t.parking,
      eld: acc.eld + t.eld,
      tolls: acc.tolls + t.tolls,
      customFixedTotal: acc.customFixedTotal + t.customFixedTotal,
      fixedTotal: acc.fixedTotal + t.fixedTotal,
      totalDeductions: acc.totalDeductions + t.totalDeductions,
      netPay: acc.netPay + t.netPay,
    }),
    { grossPay: 0, fuelTotal: 0, repairsTotal: 0, insurance: 0, parking: 0, eld: 0, tolls: 0, customFixedTotal: 0, fixedTotal: 0, totalDeductions: 0, netPay: 0 }
  );

  return NextResponse.json({ trucks: truckSummaries, totals, months });
}
