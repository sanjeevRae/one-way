import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg","image/png","image/webp","image/avif","image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif","image/gif":"gif",
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok:false, error:"No file" }, { status:400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ ok:false, error:"Type not allowed" }, { status:400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ ok:false, error:"Too large" }, { status:400 });
    const ext = EXT[file.type] ?? "png";
    const base = (file.name || "image").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"").slice(0,40) || "image";
    const fileName = `${Date.now()}-${base}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok:true, path:`/uploads/${fileName}` });
  } catch (e) {
    console.error("[api/upload] failed:", e);
    return NextResponse.json({ ok:false, error:(e as Error).message }, { status:500 });
  }
}
