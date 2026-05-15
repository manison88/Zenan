import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { fuelLogs, trucks } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const ownedTrucks = db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, auth.tenantId));

  const result = await db
    .update(fuelLogs)
    .set({
      date: body.date,
      city: body.city,
      state: body.state,
      gallons: Number(body.gallons),
      amount: Number(body.amount),
    })
    .where(
      and(eq(fuelLogs.id, Number(id)), inArray(fuelLogs.truckId, ownedTrucks))
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const db = await getDb();

  const ownedTrucks = db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, auth.tenantId));

  const result = await db
    .delete(fuelLogs)
    .where(
      and(eq(fuelLogs.id, Number(id)), inArray(fuelLogs.truckId, ownedTrucks))
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
