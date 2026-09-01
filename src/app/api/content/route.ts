import { NextResponse } from "next/server";
import { getContentStore, getBackendInfo, saveContentStore } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { SiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const content = await getContentStore();
    const backend = await getBackendInfo();
    return NextResponse.json({ ...content, _backend: backend });
  } catch (error) {
    console.error("[api/content] GET failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Load failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // Only an authenticated admin can write content.

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as SiteContent;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    await saveContentStore(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/content] PUT failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 }
    );
  }
}