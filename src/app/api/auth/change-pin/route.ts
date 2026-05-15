import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { tenants } from "@/db/schema";
import { hashPin, verifyPin } from "@/lib/auth/password";
import { requireTenant, isAuthError } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const auth = await requireTenant(request);
  if (isAuthError(auth)) return auth;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const currentPin = String(body.currentPin ?? "");
  const newPin = String(body.newPin ?? "");

  if (newPin.length < 4 || newPin.length > 12 || !/^\d+$/.test(newPin)) {
    return NextResponse.json(
      { error: "New PIN must be 4–12 digits" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const rows = await db
    .select({ pinHash: tenants.pinHash })
    .from(tenants)
    .where(eq(tenants.id, auth.tenantId))
    .limit(1);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  const ok = await verifyPin(currentPin, rows[0].pinHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Current PIN is incorrect" },
      { status: 401 }
    );
  }

  const newHash = await hashPin(newPin);
  await db.update(tenants).set({ pinHash: newHash }).where(eq(tenants.id, auth.tenantId));
  return NextResponse.json({ success: true });
}
