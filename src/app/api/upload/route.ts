import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * File storage: saves an uploaded image to <project>/public/uploads/
 * and returns its public path (e.g. /uploads/1690000000-photo.webp).
 * Admin session required.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Only JPG, PNG, WebP, AVIF or GIF images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image is too large (max 4 MB)." },
        { status: 400 }
      );
    }

    const ext = EXT[file.type] ?? "png";
    // Sanitize the original name: keep letters/numbers/dashes only.
    const base = (file.name || "image")
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";

    const fileName = `${Date.now()}-${base}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ ok: true, path: `/uploads/${fileName}` });
  } catch (error) {
    console.error("[api/upload] failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
