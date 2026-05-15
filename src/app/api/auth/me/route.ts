import { NextRequest, NextResponse } from "next/server";
import { getTenant } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const tenant = await getTenant(request);
  if (!tenant) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    tenant: {
      id: tenant.tenantId,
      email: tenant.email,
      fleetName: tenant.fleetName,
    },
  });
}
