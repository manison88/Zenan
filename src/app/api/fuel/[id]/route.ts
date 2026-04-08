import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { fuelLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const result = await db
    .update(fuelLogs)
    .set({
      date: body.date,
      city: body.city,
      state: body.state,
      gallons: Number(body.gallons),
      amount: Number(body.amount),
    })
    .where(eq(fuelLogs.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await db.delete(fuelLogs).where(eq(fuelLogs.id, Number(id)));
  return NextResponse.json({ success: true });
}
