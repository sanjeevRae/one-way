import { promises as fs } from "fs";
import path from "path";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  content: string;
}

export interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export interface LegalPageData {
  id?: string;
  slug?: string;
  title: string;
  content: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  image?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface SiteContent {
  blogs: BlogPost[];
  privacyPolicy: LegalPageData;
  terms: LegalPageData;
  careers: Career[];
  testimonials: Testimonial[];
  faqs: Faq[];
  heroLogo: string;
  heroImage: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  blogs: [],
  privacyPolicy: { title: "Privacy Policy", content: "" },
  terms: { title: "Terms & Conditions", content: "" },
  careers: [],
  testimonials: [],
  faqs: [],
  heroLogo: "",
  heroImage: "",
};

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

/** Reads the content store from disk. Falls back to empty defaults if missing/corrupt. */
export async function readContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      blogs: Array.isArray(parsed.blogs) ? parsed.blogs : [],
      privacyPolicy: parsed.privacyPolicy ?? DEFAULT_CONTENT.privacyPolicy,
      terms: parsed.terms ?? DEFAULT_CONTENT.terms,
      careers: Array.isArray(parsed.careers) ? parsed.careers : [],
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
      heroLogo: typeof parsed.heroLogo === "string" ? parsed.heroLogo : "",
      heroImage: typeof parsed.heroImage === "string" ? parsed.heroImage : "",
    };
  } catch {
    return {
      blogs: [],
      privacyPolicy: { ...DEFAULT_CONTENT.privacyPolicy },
      terms: { ...DEFAULT_CONTENT.terms },
      careers: [],
      testimonials: [],
      faqs: [],
      heroLogo: "",
      heroImage: "",
    };
  }
}

/** Writes the content store to disk. */
export async function writeContent(content: SiteContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), "utf-8");
}