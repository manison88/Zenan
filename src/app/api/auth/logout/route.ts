import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  deleteSession,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
