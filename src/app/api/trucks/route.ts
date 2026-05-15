import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireTenant, isAuthError } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const excludeDemo = searchParams.get("excludeDemo") === "1";

  const db = await getDb();
  const conditions = [eq(trucks.tenantId, auth.tenantId)];
  if (excludeDemo) conditions.push(eq(trucks.isDemo, 0));

  const allTrucks = await db
    .select()
    .from(trucks)
    .where(and(...conditions))
    .orderBy(trucks.truckNumber);
  return NextResponse.json(allTrucks);
}

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const db = await getDb();
  const body = await request.json();

  if (!body.truckNumber?.trim()) {
    return NextResponse.json(
      { error: "Truck number is required" },
      { status: 400 }
    );
  }

  const result = await db
    .insert(trucks)
    .values({
      tenantId: auth.tenantId,
      truckNumber: body.truckNumber.trim(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
