import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { repairs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const body = await request.json();

  const result = await db
    .update(repairs)
    .set({
      date: body.date,
      repairTypeId: Number(body.repairTypeId),
      amount: Number(body.amount),
      notes: body.notes || null,
    })
    .where(eq(repairs.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await db.delete(repairs).where(eq(repairs.id, Number(id)));
  return NextResponse.json({ success: true });
}
