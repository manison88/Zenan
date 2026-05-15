import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { fuelLogs } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";
import { ownTruck } from "@/lib/auth/tenant-scope";

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const truckId = searchParams.get("truckId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!truckId) {
    return NextResponse.json({ error: "truckId is required" }, { status: 400 });
  }

  const truck = await ownTruck(auth.tenantId, Number(truckId));
  if (truck instanceof NextResponse) return truck;

  const db = await getDb();
  const conditions = [eq(fuelLogs.truckId, Number(truckId))];
  if (startDate) conditions.push(gte(fuelLogs.date, startDate));
  if (endDate) conditions.push(lte(fuelLogs.date, endDate));

  const results = await db
    .select()
    .from(fuelLogs)
    .where(and(...conditions))
    .orderBy(desc(fuelLogs.date));

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();
  const body = await request.json();

  if (
    !body.truckId ||
    !body.date ||
    !body.city ||
    !body.state ||
    body.gallons == null ||
    body.amount == null
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const truck = await ownTruck(auth.tenantId, Number(body.truckId));
  if (truck instanceof NextResponse) return truck;

  const result = await db
    .insert(fuelLogs)
    .values({
      truckId: Number(body.truckId),
      date: body.date,
      city: body.city,
      state: body.state,
      gallons: Number(body.gallons),
      amount: Number(body.amount),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
