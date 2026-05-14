import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { fixedCosts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";
import { ownTruck } from "@/lib/auth/tenant-scope";

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
  const result = await db
    .select()
    .from(fixedCosts)
    .where(eq(fixedCosts.truckId, Number(truckId)))
    .get();

  return NextResponse.json(
    result || { insurance: 0, parking: 0, eld: 0, tolls: 0 }
  );
}

export async function PUT(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();
  const body = await request.json();

  if (!body.truckId) {
    return NextResponse.json({ error: "truckId is required" }, { status: 400 });
  }

  const truckId = Number(body.truckId);
  const truck = await ownTruck(auth.tenantId, truckId);
  if (truck instanceof NextResponse) return truck;

  const values = {
    truckId,
    insurance: Number(body.insurance) || 0,
    parking: Number(body.parking) || 0,
    eld: Number(body.eld) || 0,
    tolls: Number(body.tolls) || 0,
    updatedAt: sql`(current_timestamp)`,
  };

  const existing = await db
    .select()
    .from(fixedCosts)
    .where(eq(fixedCosts.truckId, truckId))
    .get();

  let result;
  if (existing) {
    result = await db
      .update(fixedCosts)
      .set(values)
      .where(eq(fixedCosts.truckId, truckId))
      .returning();
  } else {
    result = await db.insert(fixedCosts).values(values).returning();
  }

  return NextResponse.json(result[0]);
}
