import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { maintenanceLogs, trucks } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  if (!body.repairTypeId) {
    return NextResponse.json({ error: "repairTypeId is required" }, { status: 400 });
  }

  const ownedTrucks = db
    .select({ id: trucks.id })
    .from(trucks)
    .where(eq(trucks.tenantId, auth.tenantId));

  const result = await db
    .update(maintenanceLogs)
    .set({
      repairTypeId: Number(body.repairTypeId),
      serviceDate: toStringOrNull(body.serviceDate),
      serviceOdometer: toNumberOrNull(body.serviceOdometer),
      cost: toNumberOrNull(body.cost) ?? 0,
      notes: toStringOrNull(body.notes),
      nextDueDate: toStringOrNull(body.nextDueDate),
      nextDueOdometer: toNumberOrNull(body.nextDueOdometer),
    })
    .where(
      and(
        eq(maintenanceLogs.id, Number(id)),
        inArray(maintenanceLogs.truckId, ownedTrucks)
      )
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
    .delete(maintenanceLogs)
    .where(
      and(
        eq(maintenanceLogs.id, Number(id)),
        inArray(maintenanceLogs.truckId, ownedTrucks)
      )
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
