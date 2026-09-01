import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const mysqlUrl = process.env.DATABASE_URL;
  const cfg = {
    DATABASE_URL: mysqlUrl || "(unset)",
    DATABASE_HOST: process.env.DATABASE_HOST || "(unset)",
    DATABASE_USER: process.env.DATABASE_USER || "(unset)",
    DATABASE_PORT: process.env.DATABASE_PORT || "3306 (default)",
    DATABASE_NAME: process.env.DATABASE_NAME || "(unset)",
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? "****" : "(unset)",
  };

  const result: Record<string, unknown> = { config: cfg, connection: {}, tables: [] };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || "localhost",
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
    });
    result.connection = { ok: true };
    const [rows] = await conn.query(
      "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DATABASE_NAME]
    );
    result.tables = (rows as { name: string }[]).map((r) => r.name);
    await conn.end();
  } catch (e) {
    result.connection = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  return NextResponse.json(result);
}
