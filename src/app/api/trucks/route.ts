import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const excludeDemo = searchParams.get("excludeDemo") === "1";

  const db = await getDb();

  let query = db.select().from(trucks);
  if (excludeDemo) {
    query = query.where(eq(trucks.isDemo, 0)) as typeof query;
  }

  const allTrucks = await query.orderBy(trucks.truckNumber);
  return NextResponse.json(allTrucks);
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json();

  if (!body.truckNumber?.trim()) {
    return NextResponse.json({ error: "Truck number is required" }, { status: 400 });
  }

  const result = await db
    .insert(trucks)
    .values({ truckNumber: body.truckNumber.trim() })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
