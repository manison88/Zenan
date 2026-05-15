import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions, tenants } from "@/db/schema";

export const SESSION_COOKIE = "zenan_session";
export const SESSION_DURATION_DAYS = 30;
const SESSION_BYTES = 32;

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateSessionId(): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
}

function expiryIso(daysFromNow = SESSION_DURATION_DAYS): string {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString();
}

export interface TenantContext {
  tenantId: string;
  email: string;
  fleetName: string;
}

export async function createSession(tenantId: string): Promise<{
  id: string;
  expiresAt: string;
}> {
  const db = await getDb();
  const id = generateSessionId();
  const expiresAt = expiryIso();
  await db.insert(sessions).values({ id, tenantId, expiresAt });
  return { id, expiresAt };
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, id));
}

export function applySessionCookie(
  response: NextResponse,
  sessionId: string,
  expiresAt: string
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getTenant(
  request?: NextRequest
): Promise<TenantContext | null> {
  const sessionId = request
    ? request.cookies.get(SESSION_COOKIE)?.value
    : (await cookies()).get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const db = await getDb();
  const rows = await db
    .select({
      tenantId: tenants.id,
      email: tenants.email,
      fleetName: tenants.fleetName,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];
  if (new Date(row.expiresAt) < new Date()) {
    await deleteSession(sessionId);
    return null;
  }
  return {
    tenantId: row.tenantId,
    email: row.email,
    fleetName: row.fleetName,
  };
}

export async function requireTenant(
  request: NextRequest
): Promise<TenantContext | NextResponse> {
  const tenant = await getTenant(request);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return tenant;
}

export function isAuthError(
  value: TenantContext | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}
