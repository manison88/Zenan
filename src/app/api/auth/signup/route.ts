import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { tenants } from "@/db/schema";
import { hashPin } from "@/lib/auth/password";
import { applySessionCookie, createSession } from "@/lib/auth/session";

function generateTenantId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let id = "tenant_";
  for (const b of bytes) id += b.toString(16).padStart(2, "0");
  return id;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const pin = String(body.pin ?? "");
  const fleetName = String(body.fleetName ?? "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!fleetName) {
    return NextResponse.json({ error: "Fleet name is required" }, { status: 400 });
  }
  if (pin.length < 4 || pin.length > 12 || !/^\d+$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4–12 digits" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const existing = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.email, email))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const id = generateTenantId();
  const pinHash = await hashPin(pin);
  await db.insert(tenants).values({ id, email, pinHash, fleetName });

  const session = await createSession(id);
  const response = NextResponse.json(
    {
      tenant: { id, email, fleetName },
      session: { expiresAt: session.expiresAt },
    },
    { status: 201 }
  );
  applySessionCookie(response, session.id, session.expiresAt);
  return response;
}
