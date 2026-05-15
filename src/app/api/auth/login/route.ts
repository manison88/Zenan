import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { tenants } from "@/db/schema";
import { verifyPin } from "@/lib/auth/password";
import { applySessionCookie, createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const pin = String(body.pin ?? "");

  if (!email || !pin) {
    return NextResponse.json(
      { error: "Email and PIN are required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.email, email))
    .limit(1);

  const invalid = NextResponse.json(
    { error: "Invalid email or PIN" },
    { status: 401 }
  );

  if (rows.length === 0) return invalid;
  const tenant = rows[0];
  const ok = await verifyPin(pin, tenant.pinHash);
  if (!ok) return invalid;

  const session = await createSession(tenant.id);
  const response = NextResponse.json({
    tenant: {
      id: tenant.id,
      email: tenant.email,
      fleetName: tenant.fleetName,
    },
    session: { expiresAt: session.expiresAt },
  });
  applySessionCookie(response, session.id, session.expiresAt);
  return response;
}
