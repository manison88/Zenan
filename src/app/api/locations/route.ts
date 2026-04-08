import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips, fuelLogs } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const db = await getDb();

  // Get distinct city/state combos from trips and fuel_logs
  const tripLocations = await db
    .selectDistinct({
      city: trips.fromCity,
      state: trips.fromState,
    })
    .from(trips);

  const tripToLocations = await db
    .selectDistinct({
      city: trips.toCity,
      state: trips.toState,
    })
    .from(trips);

  const fuelLocations = await db
    .selectDistinct({
      city: fuelLogs.city,
      state: fuelLogs.state,
    })
    .from(fuelLogs);

  // Combine and deduplicate
  const allLocations = [...tripLocations, ...tripToLocations, ...fuelLocations];
  const uniqueMap = new Map<string, { city: string; state: string }>();
  for (const loc of allLocations) {
    const key = `${loc.city.toLowerCase()},${loc.state.toLowerCase()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, loc);
    }
  }

  // Filter by query
  const filtered = Array.from(uniqueMap.values()).filter(
    (loc) =>
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q)
  );

  return NextResponse.json(filtered.slice(0, 10));
}
