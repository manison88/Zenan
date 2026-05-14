import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { maintenanceLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  if (!body.repairTypeId) {
    return NextResponse.json({ error: "repairTypeId is required" }, { status: 400 });
  }

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
    .where(eq(maintenanceLogs.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, Number(id)));
  return NextResponse.json({ success: true });
}
