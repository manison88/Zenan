import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { repairTypes } from "@/db/schema";

export async function GET() {
  const db = await getDb();
  const types = await db.select().from(repairTypes).orderBy(repairTypes.name);
  return NextResponse.json(types);
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = await db
    .insert(repairTypes)
    .values({ name: body.name.trim(), isDefault: 0 })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
