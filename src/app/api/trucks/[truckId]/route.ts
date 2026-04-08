import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trucks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ truckId: string }> }) {
  const { truckId } = await params;
  const db = await getDb();
  const truck = await db.select().from(trucks).where(eq(trucks.id, Number(truckId))).get();

  if (!truck) {
    return NextResponse.json({ error: "Truck not found" }, { status: 404 });
  }
  return NextResponse.json(truck);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ truckId: string }> }) {
  const { truckId } = await params;
  const db = await getDb();
  const body = await request.json();

  if (!body.truckNumber?.trim()) {
    return NextResponse.json({ error: "Truck number is required" }, { status: 400 });
  }

  const result = await db
    .update(trucks)
    .set({ truckNumber: body.truckNumber.trim() })
    .where(eq(trucks.id, Number(truckId)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Truck not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ truckId: string }> }) {
  const { truckId } = await params;
  const db = await getDb();
  const result = await db.delete(trucks).where(eq(trucks.id, Number(truckId))).returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Truck not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
