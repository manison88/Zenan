import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks } from "@/db/schema";

/**
 * Verify that a single truck belongs to the tenant.
 * Returns the truck row, or a 404 NextResponse if not found / not owned.
 */
export async function ownTruck(tenantId: string, truckId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(trucks)
    .where(and(eq(trucks.id, truckId), eq(trucks.tenantId, tenantId)))
    .limit(1);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Truck not found" }, { status: 404 });
  }
  return rows[0];
}

/**
 * Returns the list of truck ids that belong to the tenant.
 * Useful for scoping queries on child tables by truckId.
 */
export async function tenantTruckIds(tenantId: string): Promise<number[]> {
  const db = await getDb();
  const rows = await db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, tenantId));
  return rows.map((r) => r.id);
}

export function inTenantTrucks(truckIds: number[]) {
  if (truckIds.length === 0) {
    // inArray with an empty list errors on some drivers; use an impossible id.
    return inArray(trucks.id, [-1]);
  }
  return inArray(trucks.id, truckIds);
}
