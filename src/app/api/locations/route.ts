import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips, fuelLogs, trucks } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const db = await getDb();

  const ownedTrucks = db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, auth.tenantId));

  const tripLocations = await db
    .selectDistinct({
      city: trips.fromCity,
      state: trips.fromState,
    })
    .from(trips)
    .where(inArray(trips.truckId, ownedTrucks));

  const tripToLocations = await db
    .selectDistinct({
      city: trips.toCity,
      state: trips.toState,
    })
    .from(trips)
    .where(inArray(trips.truckId, ownedTrucks));

  const fuelLocations = await db
    .selectDistinct({
      city: fuelLogs.city,
      state: fuelLogs.state,
    })
    .from(fuelLogs)
    .where(inArray(fuelLogs.truckId, ownedTrucks));

  const allLocations = [...tripLocations, ...tripToLocations, ...fuelLocations];
  const uniqueMap = new Map<string, { city: string; state: string }>();
  for (const loc of allLocations) {
    const key = `${loc.city.toLowerCase()},${loc.state.toLowerCase()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, loc);
    }
  }

  const filtered = Array.from(uniqueMap.values()).filter(
    (loc) =>
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q)
  );

  return NextResponse.json(filtered.slice(0, 10));
}
