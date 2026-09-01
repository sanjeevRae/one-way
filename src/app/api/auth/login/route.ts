import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Brute-force guard: simple in-memory per-IP limiter. */
const IP_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return fwd || "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const existing = IP_ATTEMPTS.get(ip);
  if (existing && existing.resetAt > now && existing.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password required." },
        { status: 400 }
      );
    }

    const host = process.env.DATABASE_HOST;
    const user = process.env.DATABASE_USER;
    if (!host || !user) {
      return NextResponse.json(
        { ok: false, error: "Database is not configured." },
        { status: 500 }
      );
    }

    // Parameterized query → SQL-injection safe.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      host,
      user,
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
    });

    let rows: any[] = [];
    try {
      const [result] = (await conn.execute(
        "SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1",
        [username]
      )) as [any[]];
      rows = result;
    } finally {
      await conn.end();
    }

    const record = rows[0];
    if (!record || !verifyPassword(password, record.password_hash)) {
      const rec = IP_ATTEMPTS.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
      rec.count += 1;
      if (rec.resetAt <= now) rec.resetAt = now + WINDOW_MS;
      IP_ATTEMPTS.set(ip, rec);
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: SESSION_COOKIE,
      value: createSessionToken(record.username),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    });
    return res;
  } catch (error) {
    console.error("[auth/login] failed:", error);
    return NextResponse.json(
      { ok: false, error: "Login failed. Check server logs." },
      { status: 500 }
    );
  }
}