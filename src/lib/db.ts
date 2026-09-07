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
import type { IntroStat } from "./intro";
import type { ServiceItem, WorkItem } from "./sections";
import type { PricingPackage } from "./pricing";
import { DEFAULT_PRICING_PACKAGES } from "./pricing";
import {
  DEFAULT_INTRO_HEADING,
  DEFAULT_INTRO_KICKER,
} from "./intro";
import {
  DEFAULT_SERVICES_HEADING,
  DEFAULT_SERVICES_KICKER,
  DEFAULT_SERVICES_MORE,
  DEFAULT_WORK_HEADING,
  DEFAULT_WORK_SUBTEXT,
} from "./sections";

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
    try {
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
      "SELECT `key`, `value` FROM site_settings WHERE `key` IN ('hero_logo', 'hero_image', 'intro_kicker', 'intro_heading', 'services_kicker', 'services_heading', 'services_more', 'work_heading', 'work_subtext')"
    );

    const [introStatRows] = await pool.query(
      "SELECT * FROM intro_stats ORDER BY sort_order ASC, id ASC"
    );

    const [serviceRows] = await pool.query(
      "SELECT * FROM services ORDER BY sort_order ASC, id ASC"
    );

    const [workRows] = await pool.query(
      "SELECT * FROM works ORDER BY sort_order ASC, id ASC"
    );

    const [pricingPackageRows] = await pool.query(
      "SELECT * FROM pricing_packages ORDER BY sort_order ASC, id ASC"
    );

    const [pricingPlanRows] = await pool.query(
      "SELECT * FROM pricing_plans ORDER BY sort_order ASC, id ASC"
    );

    const settingMap = new Map<string, string>();
    for (const row of settingRows as any[]) {
      settingMap.set(row.key, row.value ?? "");
    }

    const heroLogo = settingMap.get("hero_logo") ?? "";
    const heroImage = settingMap.get("hero_image") ?? "";

    const introKicker =
      settingMap.get("intro_kicker")?.trim() || DEFAULT_INTRO_KICKER;
    const introHeading =
      settingMap.get("intro_heading")?.trim() || DEFAULT_INTRO_HEADING;

    const introStats: IntroStat[] = (introStatRows as any[]).map((row) => ({
      id: String(row.id),
      value: Number(row.stat_value) || 0,
      label: String(row.label ?? ""),
    }));

    const services: ServiceItem[] = (serviceRows as any[]).map((row) => ({
      id: String(row.id),
      label: String(row.label ?? ""),
      icon: String(row.icon ?? "Code2"),
    }));

    const works: WorkItem[] = (workRows as any[]).map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      text: String(row.text ?? ""),
      image: String(row.image ?? ""),
      tags: String(row.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }));

    const servicesKicker =
      settingMap.get("services_kicker")?.trim() || DEFAULT_SERVICES_KICKER;
    const servicesHeading =
      settingMap.get("services_heading")?.trim() || DEFAULT_SERVICES_HEADING;
    const servicesMoreRaw = Number(settingMap.get("services_more"));
    const servicesMore = Number.isFinite(servicesMoreRaw)
      ? servicesMoreRaw
      : DEFAULT_SERVICES_MORE;
    const workHeading = settingMap.get("work_heading")?.trim() || DEFAULT_WORK_HEADING;
    const workSubtext = settingMap.get("work_subtext")?.trim() || DEFAULT_WORK_SUBTEXT;

    let pricingPackages: PricingPackage[] = [];
    if ((pricingPackageRows as any[]).length > 0) {
      const plansByPackage = new Map<number, PricingPackage["plans"]>();
      for (const row of pricingPlanRows as any[]) {
        const pkgId = Number(row.package_id);
        let features: PricingPackage["plans"][number]["features"] = [];
        try {
          const parsed = JSON.parse(String(row.features ?? "[]"));
          if (Array.isArray(parsed)) {
            features = parsed.map((f: any) => ({
              label: String(f?.label ?? ""),
              value: String(f?.value ?? ""),
            }));
          }
        } catch {
          features = [];
        }
        const list = plansByPackage.get(pkgId) ?? [];
        list.push({
          name: String(row.name ?? ""),
          price: String(row.price ?? ""),
          features,
        });
        plansByPackage.set(pkgId, list);
      }

      pricingPackages = (pricingPackageRows as any[]).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        plans: plansByPackage.get(Number(row.id)) ?? [],
      }));
    } else {
      pricingPackages = DEFAULT_PRICING_PACKAGES;
    }

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
      heroImage,

      introKicker,
      introHeading,
      introStats,

      servicesKicker,
      servicesHeading,
      servicesMore,
      services,

      workHeading,
      workSubtext,
      works,

      pricingPackages,

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
    } catch (error) {
      // MySQL is configured but unreachable (e.g. local dev without a running
      // MySQL, or a brief hosting outage). Fall back to the JSON store / built-in
      // defaults instead of crashing the page.
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[db] MySQL unavailable, falling back to JSON store:", message);
    }
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
    /* Site settings (hero logo & hero image)                         */
    /* -------------------------------------------------------------- */

    const settings: Array<[string, string]> = [
      ["hero_logo", content.heroLogo || ""],
      ["hero_image", content.heroImage || ""],
      ["intro_kicker", content.introKicker || ""],
      ["intro_heading", content.introHeading || ""],
      ["services_kicker", content.servicesKicker || ""],
      ["services_heading", content.servicesHeading || ""],
      ["services_more", String(content.servicesMore ?? 4)],
      ["work_heading", content.workHeading || ""],
      ["work_subtext", content.workSubtext || ""],
    ];

    for (const [key, value] of settings) {
      await conn.query(
        `
      INSERT INTO site_settings (`+"`key`"+`, `+"`value`"+`)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE `+"`value`"+` = ?
      `,
        [key, value, value]
      );
    }

    /* -------------------------------------------------------------- */
    /* Intro stats                                                    */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM intro_stats");
    for (let i = 0; i < content.introStats.length; i++) {
      const stat = content.introStats[i];
      await conn.query(
        "INSERT INTO intro_stats (stat_value, label, sort_order) VALUES (?, ?, ?)",
        [Number(stat.value) || 0, String(stat.label ?? ""), i]
      );
    }

    /* -------------------------------------------------------------- */
    /* Services                                                       */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM services");
    for (let i = 0; i < content.services.length; i++) {
      const srv = content.services[i];
      await conn.query(
        "INSERT INTO services (label, icon, sort_order) VALUES (?, ?, ?)",
        [String(srv.label ?? ""), String(srv.icon ?? "Code2"), i]
      );
    }

    /* -------------------------------------------------------------- */
    /* Works                                                          */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM works");
    for (let i = 0; i < content.works.length; i++) {
      const work = content.works[i];
      await conn.query(
        "INSERT INTO works (title, `text`, image, tags, sort_order) VALUES (?, ?, ?, ?, ?)",
        [
          String(work.title ?? ""),
          String(work.text ?? ""),
          String(work.image ?? ""),
          (work.tags ?? []).map((t) => String(t).trim()).filter(Boolean).join(","),
          i,
        ]
      );
    }

    /* -------------------------------------------------------------- */
    /* Pricing packages & plans                                       */
    /* -------------------------------------------------------------- */

    await conn.query("DELETE FROM pricing_plans");
    await conn.query("DELETE FROM pricing_packages");
    for (let i = 0; i < content.pricingPackages.length; i++) {
      const pkg = content.pricingPackages[i];
      const [pkgResult]: any = await conn.query(
        "INSERT INTO pricing_packages (name, sort_order) VALUES (?, ?)",
        [String(pkg.name ?? ""), i]
      );
      const packageId = Number(pkgResult?.insertId) || 0;
      for (let j = 0; j < pkg.plans.length; j++) {
        const pl = pkg.plans[j];
        await conn.query(
          "INSERT INTO pricing_plans (package_id, name, price, features, sort_order) VALUES (?, ?, ?, ?, ?)",
          [
            packageId,
            String(pl.name ?? ""),
            String(pl.price ?? ""),
            JSON.stringify(pl.features ?? []),
            j,
          ]
        );
      }
    }

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