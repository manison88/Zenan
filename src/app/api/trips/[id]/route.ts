import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const result = await db
    .update(trips)
    .set({
      date: body.date,
      fromCity: body.fromCity,
      fromState: body.fromState,
      toCity: body.toCity,
      toState: body.toState,
      trailer: body.trailer || null,
      billNumber: body.billNumber || null,
      amount: Number(body.amount) || 0,
    })
    .where(eq(trips.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await db.delete(trips).where(eq(trips.id, Number(id)));
  return NextResponse.json({ success: true });
}
