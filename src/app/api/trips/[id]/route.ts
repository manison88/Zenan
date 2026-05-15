import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips, trucks } from "@/db/schema";
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
    .update(trips)
    .set({
      date: body.date,
      fromCity: body.fromCity,
      fromState: body.fromState,
      toCity: body.toCity,
      toState: body.toState,
      trailer: body.trailer || null,
      billNumber: body.billNumber || null,
      amount: Number(body.amount) || 0,
    })
    .where(and(eq(trips.id, Number(id)), inArray(trips.truckId, ownedTrucks)))
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
    .delete(trips)
    .where(and(eq(trips.id, Number(id)), inArray(trips.truckId, ownedTrucks)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
