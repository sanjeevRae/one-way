import { NextResponse } from "next/server";
import { getContentStore, saveContentStore } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ValidationError, normalizeSectionVisibility } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Updates ONLY the homepage section-visibility switches.
 *
 * The admin toggles call this instead of the full-content PUT, so a toggle
 * can never overwrite other content with a stale snapshot: the current
 * stored content is loaded fresh here, only its sectionVisibility is
 * replaced (normalized server-side), and the result is saved through the
 * same validated save path as every other write.
 */
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
    const body = (await request.json().catch(() => null)) as {
      sectionVisibility?: unknown;
    } | null;
    if (!body || typeof body !== "object" || !("sectionVisibility" in body)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const sectionVisibility = normalizeSectionVisibility(body.sectionVisibility);
    const current = await getContentStore();
    await saveContentStore({ ...current, sectionVisibility });
    return NextResponse.json({ ok: true, sectionVisibility });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }
    console.error("[api/content/visibility] PUT failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Save failed",
      },
      { status: 500 }
    );
  }
}
