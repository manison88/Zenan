import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { odometerLogs } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const truckId = searchParams.get("truckId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!truckId) {
    return NextResponse.json({ error: "truckId is required" }, { status: 400 });
  }

  const db = await getDb();
  const conditions = [eq(odometerLogs.truckId, Number(truckId))];
  if (startDate) conditions.push(gte(odometerLogs.weekStartDate, startDate));
  if (endDate) conditions.push(lte(odometerLogs.weekStartDate, endDate));

  const results = await db
    .select()
    .from(odometerLogs)
    .where(and(...conditions))
    .orderBy(desc(odometerLogs.weekStartDate));

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json();

  if (!body.truckId || !body.weekStartDate || body.startingReading == null || body.endingReading == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await db
    .insert(odometerLogs)
    .values({
      truckId: Number(body.truckId),
      weekStartDate: body.weekStartDate,
      startingReading: Number(body.startingReading),
      endingReading: Number(body.endingReading),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
