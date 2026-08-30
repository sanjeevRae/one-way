import { NextResponse } from "next/server";
import { getContentStore, getBackendInfo, saveContentStore } from "@/lib/db";
import type { SiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const content = await getContentStore();
  const backend = await getBackendInfo();
  return NextResponse.json({ ...content, _backend: backend });
}

export async function PUT(request: Request) {
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
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 }
    );
  }
}