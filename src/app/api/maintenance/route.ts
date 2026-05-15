import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { maintenanceLogs, repairTypes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";
import { ownTruck } from "@/lib/auth/tenant-scope";

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

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const truckId = searchParams.get("truckId");

  if (!truckId) {
    return NextResponse.json({ error: "truckId is required" }, { status: 400 });
  }

  const truck = await ownTruck(auth.tenantId, Number(truckId));
  if (truck instanceof NextResponse) return truck;

  const db = await getDb();
  const results = await db
    .select({
      id: maintenanceLogs.id,
      truckId: maintenanceLogs.truckId,
      repairTypeId: maintenanceLogs.repairTypeId,
      repairTypeName: repairTypes.name,
      serviceDate: maintenanceLogs.serviceDate,
      serviceOdometer: maintenanceLogs.serviceOdometer,
      cost: maintenanceLogs.cost,
      notes: maintenanceLogs.notes,
      nextDueDate: maintenanceLogs.nextDueDate,
      nextDueOdometer: maintenanceLogs.nextDueOdometer,
      createdAt: maintenanceLogs.createdAt,
    })
    .from(maintenanceLogs)
    .leftJoin(repairTypes, eq(maintenanceLogs.repairTypeId, repairTypes.id))
    .where(eq(maintenanceLogs.truckId, Number(truckId)))
    .orderBy(desc(maintenanceLogs.serviceDate), desc(maintenanceLogs.createdAt));

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();
  const body = await request.json();

  if (!body.truckId || !body.repairTypeId) {
    return NextResponse.json(
      { error: "truckId and repairTypeId are required" },
      { status: 400 }
    );
  }

  const truck = await ownTruck(auth.tenantId, Number(body.truckId));
  if (truck instanceof NextResponse) return truck;

  const serviceDate = toStringOrNull(body.serviceDate);
  const nextDueDate = toStringOrNull(body.nextDueDate);
  const nextDueOdometer = toNumberOrNull(body.nextDueOdometer);

  if (!serviceDate && !nextDueDate && nextDueOdometer === null) {
    return NextResponse.json(
      { error: "Provide a service date or a next-due date/odometer" },
      { status: 400 }
    );
  }

  const result = await db
    .insert(maintenanceLogs)
    .values({
      truckId: Number(body.truckId),
      repairTypeId: Number(body.repairTypeId),
      serviceDate,
      serviceOdometer: toNumberOrNull(body.serviceOdometer),
      cost: toNumberOrNull(body.cost) ?? 0,
      notes: toStringOrNull(body.notes),
      nextDueDate,
      nextDueOdometer,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
