import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customFixedCosts } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const results = await db
    .select()
    .from(customFixedCosts)
    .where(eq(customFixedCosts.truckId, Number(truckId)))
    .orderBy(customFixedCosts.name);

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();
  const body = await request.json();

  if (!body.truckId || !body.name?.trim() || body.amount == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const truck = await ownTruck(auth.tenantId, Number(body.truckId));
  if (truck instanceof NextResponse) return truck;

  const result = await db
    .insert(customFixedCosts)
    .values({
      truckId: Number(body.truckId),
      name: body.name.trim(),
      amount: Number(body.amount),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
