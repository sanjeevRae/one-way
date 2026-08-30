/**
 * Database abstraction layer.
 *
 * When DATABASE_URL (or individual env vars) is set, uses mysql2 to talk to
 * a real MySQL database. Otherwise falls back to the local JSON file
 * (src/data/content.json) — so every feature works in local dev without DB setup.
 *
 * Usage:
 *   import { getContentStore, saveContentStore } from "@/lib/db";
 *   const store = await getContentStore();
 *   await saveContentStore(store);
 *
 * The store shape always matches SiteContent from "@/lib/content".
 */

import type { BlogPost, Career, LegalPageData, SiteContent } from "./content";

/* ------------------------------------------------------------------ */
/*  Configuration                                                     */
/* ------------------------------------------------------------------ */

const DATABASE_URL = process.env.DATABASE_URL;

const poolConfig: { host: string; user: string; password: string; database: string; port?: number } | null =
  DATABASE_URL
    ? null
    : process.env.DATABASE_HOST && process.env.DATABASE_USER
      ? {
          host: process.env.DATABASE_HOST,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD || "",
          database: process.env.DATABASE_NAME || "oneway_nepal",
          port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
        }
      : null;

/* ------------------------------------------------------------------ */
/*  Lazy-load mysql2 only when needed                                  */
/* ------------------------------------------------------------------ */

let _pool: any = null;

function getPool(): any | null {
  if (!poolConfig) return null;
  if (_pool) return _pool;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require("mysql2/promise");
    _pool = mysql.createPool({
      host: poolConfig.host,
      user: poolConfig.user,
      password: poolConfig.password,
      database: poolConfig.database,
      port: poolConfig.port,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
    return _pool;
  } catch {
    return null;
  }
}


/* ------------------------------------------------------------------ */
/*  Row converters                                                      */
/* ------------------------------------------------------------------ */

function rowToBlog(row: any): BlogPost {
  return {
    id: row.id != null ? String(row.id) : "",
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    date: typeof row.date === "string" ? row.date.slice(0, 10) : "",
    image: row.image ?? undefined,
    content: row.content ?? "",
  };
}

function rowToCareer(row: any): Career {
  return {
    id: row.id != null ? String(row.id) : "",
    title: row.title,
    location: row.location ?? "",
    type: row.type ?? "",
    description: row.description ?? "",
  };
}

function rowToLegal(row: any): LegalPageData {
  return {
    id: row.id != null ? String(row.id) : "",
    slug: row.slug ?? "",
    title: row.title ?? "",
    content: row.content ?? "",
  };
}

/* ------------------------------------------------------------------ */
/*  Public API — returns/saves the unified SiteContent shape           */
/* ------------------------------------------------------------------ */

/** Fetch all content from the active backend (DB or JSON). */
export async function getContentStore(): Promise<SiteContent> {
  const pool = getPool();
  if (pool) {
    const [blogRows] = await pool.query("SELECT * FROM blogs ORDER BY date DESC, id DESC");
    const [careerRows] = await pool.query("SELECT * FROM careers ORDER BY id DESC");
    const [legalRows] = await pool.query("SELECT * FROM legal_pages WHERE slug IN ('privacy','terms')");

    const legalMap = new Map<string, LegalPageData>();
    for (const row of legalRows as any[]) {
      const l = rowToLegal(row);
      legalMap.set(l.slug || "", l);
    }

    return {
      blogs: (blogRows as any[]).map(rowToBlog),
      careers: (careerRows as any[]).map(rowToCareer),
      privacyPolicy: legalMap.get("privacy") ?? { id: "", slug: "privacy", title: "Privacy Policy", content: "" },
      terms: legalMap.get("terms") ?? { id: "", slug: "terms", title: "Terms & Conditions", content: "" },
    };
  }

  // JSON fallback
  const { readContent } = await import("./content");
  return readContent();
}

/** Persist the entire content store. */
export async function saveContentStore(content: SiteContent): Promise<void> {
  const pool = getPool();
  if (pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // --- Blogs ---
      const existing = (await conn.query("SELECT id, slug FROM blogs"))[0] as any[];
      const existingMap = new Map(existing.map((r) => [r.slug, r.id]));

      for (const blog of content.blogs) {
        if (existingMap.has(blog.slug)) {
          await conn.query(
            "UPDATE blogs SET title=?, excerpt=?, date=?, image=?, content=? WHERE slug=?",
            [blog.title, blog.excerpt, blog.date || null, blog.image || null, blog.content, blog.slug]
          );
        } else {
          await conn.query(
            "INSERT INTO blogs (slug, title, excerpt, date, image, content) VALUES (?, ?, ?, ?, ?, ?)",
            [blog.slug, blog.title, blog.excerpt, blog.date || null, blog.image || null, blog.content]
          );
        }
      }

      // Delete removed blogs
      const storeSlugs = new Set(content.blogs.map((b) => b.slug));
      for (const row of existing.filter((r) => !storeSlugs.has(r.slug))) {
        await conn.query("DELETE FROM blogs WHERE id = ?", [row.id]);
      }

      // --- Careers ---
      await conn.query("DELETE FROM careers");
      for (const career of content.careers) {
        await conn.query(
          "INSERT INTO careers (title, location, type, description) VALUES (?, ?, ?, ?)",
          [career.title, career.location, career.type, career.description]
        );
      }

      // --- Legal pages ---
      for (const legal of [content.privacyPolicy, content.terms] as LegalPageData[]) {
        await conn.query(
          "UPDATE legal_pages SET title = ?, content = ? WHERE slug = ?",
          [legal.title, legal.content, legal.slug]
        );
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } else {
    // JSON fallback
    const { writeContent } = await import("./content");
    await writeContent(content);
  }
}

/**
 * Detect which backend is currently active. Useful for admin UI / logs.
 */
export async function getBackendInfo(): Promise<{
  backend: "mysql" | "json";
  configured: boolean;
}> {
  return {
    backend: getPool() ? "mysql" : "json",
    configured: Boolean(poolConfig),
  };
}