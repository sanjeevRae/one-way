import { NextResponse } from "next/server";
import { getContentStore, saveContentStore } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  ValidationError,
  normalizeSectionVisibility,
  normalizeSocialVisibility,
} from "@/lib/site";

export const dynamic = "force-dynamic";

/** A request field counts as a patch only when it is a plain object. */
function asPatch(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Updates ONLY visibility switches: homepage sections and/or footer social
 * icons.
 *
 * The admin toggles call this instead of the full-content PUT, so a toggle
 * can never overwrite other content with a stale snapshot: the current
 * stored content is loaded fresh here, each provided visibility object is
 * merged key-by-key over the stored values (an unmentioned key keeps its
 * stored value), and the result is saved through the same validated save
 * path as every other write. At least one of the two objects is required.
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
      socialVisibility?: unknown;
    } | null;
    const hasSection =
      !!body && typeof body === "object" && "sectionVisibility" in body;
    const hasSocial =
      !!body && typeof body === "object" && "socialVisibility" in body;
    if (!hasSection && !hasSocial) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const current = await getContentStore();
    const sectionVisibility = hasSection
      ? normalizeSectionVisibility({
          ...current.sectionVisibility,
          ...asPatch(body?.sectionVisibility),
        })
      : current.sectionVisibility;
    const socialVisibility = hasSocial
      ? normalizeSocialVisibility({
          ...current.socialVisibility,
          ...asPatch(body?.socialVisibility),
        })
      : current.socialVisibility;

    await saveContentStore({ ...current, sectionVisibility, socialVisibility });
    return NextResponse.json({ ok: true, sectionVisibility, socialVisibility });
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
