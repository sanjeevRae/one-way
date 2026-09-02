/**
 * Database abstraction layer.
 *
 * Uses MySQL when DATABASE_HOST / DATABASE_USER are configured.
 * Falls back to the local JSON file when MySQL is not configured.
 */

import type {
  BlogPost,
  Career,
  Faq,
  LegalPageData,
  SiteContent,
  Testimonial,
} from "./content";

/* ------------------------------------------------------------------ */
/* Database configuration                                             */
/* ------------------------------------------------------------------ */

function getPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL exists, this version does not use it.
  // Individual DATABASE_* variables are used below.
  if (databaseUrl) {
    return null;
  }

  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;

  if (!host || !user) {
    return null;
  }

  return {
    host,
    user,
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "oneway_nepal",
    port: process.env.DATABASE_PORT
      ? Number(process.env.DATABASE_PORT)
      : 3306,
  };
}

/* ------------------------------------------------------------------ */
/* MySQL pool                                                         */
/* ------------------------------------------------------------------ */

let _pool: any = null;

function getPool(): any | null {
  if (_pool) {
    return _pool;
  }

  const config = getPoolConfig();

  if (!config) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mysql = require("mysql2/promise");

    _pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,

      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    return _pool;
  } catch (error) {
    console.error("[db] Failed to create MySQL pool:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Row converters                                                     */
/* ------------------------------------------------------------------ */

function rowToBlog(row: any): BlogPost {
  return {
    id: row.id != null ? String(row.id) : "",
    slug: row.slug ?? "",
    title: row.title ?? "",
    excerpt: row.excerpt ?? "",
    date:
      typeof row.date === "string"
        ? row.date.slice(0, 10)
        : "",
    image: row.image ?? undefined,
    content: row.content ?? "",
  };
}

function rowToCareer(row: any): Career {
  return {
    id: row.id != null ? String(row.id) : "",
    title: row.title ?? "",
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

function rowToTestimonial(row: any): Testimonial {
  return {
    id: row.id != null ? String(row.id) : "",
    quote: row.quote ?? "",
    name: row.name ?? "",
    role: row.role ?? "",
    image: row.image ?? undefined,
  };
}

function rowToFaq(row: any): Faq {
  return {
    id: row.id != null ? String(row.id) : "",
    question: row.question ?? "",
    answer: row.answer ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Get content                                                        */
/* ------------------------------------------------------------------ */

export async function getContentStore(): Promise<SiteContent> {
  const pool = getPool();

  if (pool) {
    const [blogRows] = await pool.query(
      "SELECT * FROM blogs ORDER BY date DESC, id DESC"
    );

    const [careerRows] = await pool.query(
      "SELECT * FROM careers ORDER BY id DESC"
    );

    const [legalRows] = await pool.query(
      "SELECT * FROM legal_pages WHERE slug IN ('privacy', 'terms')"
    );

    const [testimonialRows] = await pool.query(
      "SELECT * FROM testimonials ORDER BY id ASC"
    );

    const [faqRows] = await pool.query(
      "SELECT * FROM faqs ORDER BY id ASC"
    );

    const [settingRows] = await pool.query(
      "SELECT `key`, `value` FROM site_settings WHERE `key` = 'hero_logo'"
    );

    const heroLogo =
      (settingRows as any[]).find((r) => r.key === "hero_logo")?.value ?? "";

    const legalMap = new Map<string, LegalPageData>();

    for (const row of legalRows as any[]) {
      const legal = rowToLegal(row);

      if (legal.slug) {
        legalMap.set(legal.slug, legal);
      }
    }

    return {
      blogs: (blogRows as any[]).map(rowToBlog),

      careers: (careerRows as any[]).map(rowToCareer),

      testimonials: (testimonialRows as any[]).map(rowToTestimonial),

      faqs: (faqRows as any[]).map(rowToFaq),

      heroLogo,

      privacyPolicy:
        legalMap.get("privacy") ?? {
          id: "",
          slug: "privacy",
          title: "Privacy Policy",
          content: "",
        },

      terms:
        legalMap.get("terms") ?? {
          id: "",
          slug: "terms",
          title: "Terms & Conditions",
          content: "",
        },
    };
  }

  /* JSON fallback */

  const { readContent } = await import("./content");

  return readContent();
}

/* ------------------------------------------------------------------ */
/* Save content                                                       */
/* ------------------------------------------------------------------ */

export async function saveContentStore(
  content: SiteContent
): Promise<void> {
  const pool = getPool();

  if (!pool) {
    const { writeContent } = await import("./content");

    await writeContent(content);

    return;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    /* -------------------------------------------------------------- */
    /* Blogs                                                           */
    /* -------------------------------------------------------------- */

    const existing = (
      await conn.query(
        "SELECT id, slug FROM blogs"
      )
    )[0] as any[];

    const existingMap = new Map(
      existing.map((row) => [
        row.slug,
        row.id,
      ])
    );

    for (const blog of content.blogs) {
      if (existingMap.has(blog.slug)) {
        await conn.query(
          `
          UPDATE blogs
          SET
            title = ?,
            excerpt = ?,
            date = ?,
            image = ?,
            content = ?
          WHERE slug = ?
          `,
          [
            blog.title,
            blog.excerpt,
            blog.date || null,
            blog.image || null,
            blog.content,
            blog.slug,
          ]
        );
      } else {
        await conn.query(
          `
          INSERT INTO blogs
          (slug, title, excerpt, date, image, content)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            blog.slug,
            blog.title,
            blog.excerpt,
            blog.date || null,
            blog.image || null,
            blog.content,
          ]
        );
      }
    }

    /* Delete blogs removed from the CMS */

    const storeSlugs = new Set(
      content.blogs.map(
        (blog) => blog.slug
      )
    );

    for (const row of existing) {
      if (!storeSlugs.has(row.slug)) {
        await conn.query(
          "DELETE FROM blogs WHERE id = ?",
          [row.id]
        );
      }
    }

    /* -------------------------------------------------------------- */
    /* Careers                                                        */
    /* -------------------------------------------------------------- */

    await conn.query(
      "DELETE FROM careers"
    );

    for (const career of content.careers) {
      await conn.query(
        `
        INSERT INTO careers
        (title, location, type, description)
        VALUES (?, ?, ?, ?)
        `,
        [
          career.title,
          career.location,
          career.type,
          career.description,
        ]
      );
    }

    /* -------------------------------------------------------------- */
    /* Legal pages                                                    */
    /* -------------------------------------------------------------- */

    const legalPages: LegalPageData[] = [
      content.privacyPolicy,
      content.terms,
    ];

    for (const legal of legalPages) {
      if (!legal.slug) {
        continue;
      }

      await conn.query(
        `
        UPDATE legal_pages
        SET
          title = ?,
          content = ?
        WHERE slug = ?
        `,
        [
          legal.title,
          legal.content,
          legal.slug,
        ]
      );
    }

    /* -------------------------------------------------------------- */
    /* Testimonials                                                   */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM testimonials");

    for (const t of content.testimonials ?? []) {
      await conn.query(
        `
        INSERT INTO testimonials
        (quote, name, role, image)
        VALUES (?, ?, ?, ?)
        `,
        [t.quote, t.name, t.role, t.image || null]
      );
    }

    /* -------------------------------------------------------------- */
    /* FAQs                                                           */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM faqs");

    for (const f of content.faqs ?? []) {
      await conn.query(
        `
        INSERT INTO faqs
        (question, answer)
        VALUES (?, ?)
        `,
        [f.question, f.answer]
      );
    }

    /* -------------------------------------------------------------- */
    /* Site settings (hero logo)                                      */
    /* -------------------------------------------------------------- */

    await conn.query(
      `
      INSERT INTO site_settings (`+"`key`"+`, `+"`value`"+`)
      VALUES ('hero_logo', ?)
      ON DUPLICATE KEY UPDATE `+"`value`"+` = ?
      `,
      [content.heroLogo || "", content.heroLogo || ""]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();

    console.error(
      "[db] Failed to save content:",
      error
    );

    throw error;
  } finally {
    conn.release();
  }
}

/* ------------------------------------------------------------------ */
/* Backend information                                                */
/* ------------------------------------------------------------------ */

export async function getBackendInfo(): Promise<{
  backend: "mysql" | "json";
  configured: boolean;
}> {
  const config = getPoolConfig();

  return {
    backend: getPool()
      ? "mysql"
      : "json",

    configured: Boolean(config),
  };
}