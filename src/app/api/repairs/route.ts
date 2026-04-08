import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { repairs, repairTypes } from "@/db/schema";
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
  const conditions = [eq(repairs.truckId, Number(truckId))];
  if (startDate) conditions.push(gte(repairs.date, startDate));
  if (endDate) conditions.push(lte(repairs.date, endDate));

  const results = await db
    .select({
      id: repairs.id,
      truckId: repairs.truckId,
      date: repairs.date,
      repairTypeId: repairs.repairTypeId,
      repairTypeName: repairTypes.name,
      amount: repairs.amount,
      notes: repairs.notes,
      createdAt: repairs.createdAt,
    })
    .from(repairs)
    .leftJoin(repairTypes, eq(repairs.repairTypeId, repairTypes.id))
    .where(and(...conditions))
    .orderBy(desc(repairs.date));

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json();

  if (!body.truckId || !body.date || !body.repairTypeId || body.amount == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await db
    .insert(repairs)
    .values({
      truckId: Number(body.truckId),
      date: body.date,
      repairTypeId: Number(body.repairTypeId),
      amount: Number(body.amount),
      notes: body.notes || null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
