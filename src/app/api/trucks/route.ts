import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks } from "@/db/schema";

export async function GET() {
  const db = await getDb();
  const allTrucks = await db.select().from(trucks).orderBy(trucks.truckNumber);
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
