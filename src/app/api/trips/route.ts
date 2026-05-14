import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips } from "@/db/schema";
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
  const conditions = [eq(trips.truckId, Number(truckId))];
  if (startDate) conditions.push(gte(trips.date, startDate));
  if (endDate) conditions.push(lte(trips.date, endDate));

  const results = await db
    .select()
    .from(trips)
    .where(and(...conditions))
    .orderBy(desc(trips.date));

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
    !body.fromCity ||
    !body.fromState ||
    !body.toCity ||
    !body.toState
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const truck = await ownTruck(auth.tenantId, Number(body.truckId));
  if (truck instanceof NextResponse) return truck;

  const result = await db
    .insert(trips)
    .values({
      truckId: Number(body.truckId),
      date: body.date,
      fromCity: body.fromCity,
      fromState: body.fromState,
      toCity: body.toCity,
      toState: body.toState,
      trailer: body.trailer || null,
      billNumber: body.billNumber || null,
      amount: Number(body.amount) || 0,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
