import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks, trips, fuelLogs, repairs, repairTypes, odometerLogs, fixedCosts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { format, subDays, subWeeks, startOfWeek } from "date-fns";
import { requireTenant, isAuthError } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();

  // Delete this tenant's existing demo truck (cascade deletes all related data)
  const existing = await db
    .select()
    .from(trucks)
    .where(and(eq(trucks.tenantId, auth.tenantId), eq(trucks.isDemo, 1)))
    .get();

  if (existing) {
    await db.delete(trucks).where(eq(trucks.id, existing.id));
  }

  // Create demo truck scoped to this tenant
  const [demoTruck] = await db
    .insert(trucks)
    .values({
      tenantId: auth.tenantId,
      truckNumber: "DEMO-100",
      isDemo: 1,
    })
    .returning();

  const truckId = demoTruck.id;
  const today = new Date();

  const allTypes = await db.select().from(repairTypes);
  const typeMap = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

  const tripData = [
    { daysAgo: 52, fromCity: "Chicago", fromState: "IL", toCity: "Detroit", toState: "MI", trailer: "T-4420", billNumber: "BOL-10421", amount: 2800 },
    { daysAgo: 45, fromCity: "Detroit", fromState: "MI", toCity: "Columbus", toState: "OH", trailer: "T-4420", billNumber: "BOL-10435", amount: 1800 },
    { daysAgo: 38, fromCity: "Columbus", fromState: "OH", toCity: "Nashville", toState: "TN", trailer: "T-7718", billNumber: "BOL-10448", amount: 2500 },
    { daysAgo: 31, fromCity: "Nashville", fromState: "TN", toCity: "Atlanta", toState: "GA", trailer: "T-7718", billNumber: "BOL-10462", amount: 2200 },
    { daysAgo: 24, fromCity: "Atlanta", fromState: "GA", toCity: "Jacksonville", toState: "FL", trailer: "T-3305", billNumber: "BOL-10479", amount: 1900 },
    { daysAgo: 17, fromCity: "Jacksonville", fromState: "FL", toCity: "Charlotte", toState: "NC", trailer: "T-3305", billNumber: "BOL-10491", amount: 2100 },
    { daysAgo: 10, fromCity: "Charlotte", fromState: "NC", toCity: "Richmond", toState: "VA", trailer: "T-4420", billNumber: "BOL-10508", amount: 1600 },
    { daysAgo: 3, fromCity: "Richmond", fromState: "VA", toCity: "Chicago", toState: "IL", trailer: "T-4420", billNumber: "BOL-10520", amount: 3200 },
  ];

  await db.insert(trips).values(
    tripData.map((t) => ({
      truckId,
      date: format(subDays(today, t.daysAgo), "yyyy-MM-dd"),
      fromCity: t.fromCity,
      fromState: t.fromState,
      toCity: t.toCity,
      toState: t.toState,
      trailer: t.trailer,
      billNumber: t.billNumber,
      amount: t.amount,
    }))
  );

  const fuelData = [
    { daysAgo: 51, city: "Gary", state: "IN", gallons: 110, amount: 385 },
    { daysAgo: 44, city: "Toledo", state: "OH", gallons: 95, amount: 333 },
    { daysAgo: 36, city: "Louisville", state: "KY", gallons: 105, amount: 368 },
    { daysAgo: 29, city: "Chattanooga", state: "TN", gallons: 88, amount: 308 },
    { daysAgo: 22, city: "Savannah", state: "GA", gallons: 115, amount: 403 },
    { daysAgo: 9, city: "Raleigh", state: "NC", gallons: 92, amount: 322 },
  ];

  await db.insert(fuelLogs).values(
    fuelData.map((f) => ({
      truckId,
      date: format(subDays(today, f.daysAgo), "yyyy-MM-dd"),
      city: f.city,
      state: f.state,
      gallons: f.gallons,
      amount: f.amount,
    }))
  );

  const repairData = [
    { daysAgo: 40, type: "Oil Change", amount: 350, notes: "Full synthetic oil change + filter" },
    { daysAgo: 25, type: "Tires", amount: 1200, notes: "Replaced 4 drive tires" },
    { daysAgo: 8, type: "Brakes", amount: 800, notes: "Front brake pads and rotors" },
  ];

  await db.insert(repairs).values(
    repairData.map((r) => ({
      truckId,
      date: format(subDays(today, r.daysAgo), "yyyy-MM-dd"),
      repairTypeId: typeMap[r.type] || typeMap["Other"] || 1,
      amount: r.amount,
      notes: r.notes,
    }))
  );

  const odometerData = [
    { weeksAgo: 4, start: 145000, end: 147520 },
    { weeksAgo: 3, start: 147520, end: 150180 },
    { weeksAgo: 2, start: 150180, end: 152610 },
    { weeksAgo: 1, start: 152610, end: 155040 },
  ];

  await db.insert(odometerLogs).values(
    odometerData.map((o) => ({
      truckId,
      weekStartDate: format(startOfWeek(subWeeks(today, o.weeksAgo), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      startingReading: o.start,
      endingReading: o.end,
    }))
  );

  await db.insert(fixedCosts).values({
    truckId,
    insurance: 450,
    parking: 150,
    eld: 35,
    tolls: 200,
  });

  return NextResponse.json({ success: true, truckId });
}
