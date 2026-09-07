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

import {
  DEFAULT_INTRO_HEADING,
  DEFAULT_INTRO_KICKER,
  DEFAULT_INTRO_STATS,
  type IntroStat,
} from "./intro";
import {
  DEFAULT_SERVICES_HEADING,
  DEFAULT_SERVICES_KICKER,
  DEFAULT_SERVICES_MORE,
  DEFAULT_WORK_HEADING,
  DEFAULT_WORK_SUBTEXT,
  type ServiceItem,
  type WorkItem,
} from "./sections";
import { DEFAULT_PRICING_PACKAGES, type PricingPackage } from "./pricing";

export type { IntroStat, ServiceItem, WorkItem, PricingPackage };

export interface SiteContent {
  blogs: BlogPost[];
  privacyPolicy: LegalPageData;
  terms: LegalPageData;
  careers: Career[];
  testimonials: Testimonial[];
  faqs: Faq[];
  heroLogo: string;
  heroImage: string;
  introKicker: string;
  introHeading: string;
  introStats: IntroStat[];
  servicesKicker: string;
  servicesHeading: string;
  servicesMore: number;
  services: ServiceItem[];
  workHeading: string;
  workSubtext: string;
  works: WorkItem[];
  pricingPackages: PricingPackage[];
  pricingHero: string;
  pricingNoteHeading: string;
  pricingNoteText: string;
  pricingNoteContact: string;
}

export const DEFAULT_PRICING_NOTE_HEADING = "Every project includes";
export const DEFAULT_PRICING_NOTE_TEXT =
  "A clear timeline before we start, honest communication throughout, and a handover you fully own — code, assets and accounts. Prices above are starting points in NPR and are confirmed after a short discovery call.";
export const DEFAULT_PRICING_NOTE_CONTACT = "info@onewaynepal.com";

export const DEFAULT_CONTENT: SiteContent = {
  blogs: [],
  privacyPolicy: { title: "Privacy Policy", content: "" },
  terms: { title: "Terms & Conditions", content: "" },
  careers: [],
  testimonials: [],
  faqs: [],
  heroLogo: "",
  heroImage: "",
  introKicker: DEFAULT_INTRO_KICKER,
  introHeading: DEFAULT_INTRO_HEADING,
  introStats: DEFAULT_INTRO_STATS,
  servicesKicker: DEFAULT_SERVICES_KICKER,
  servicesHeading: DEFAULT_SERVICES_HEADING,
  servicesMore: DEFAULT_SERVICES_MORE,
  services: [],
  workHeading: DEFAULT_WORK_HEADING,
  workSubtext: DEFAULT_WORK_SUBTEXT,
  works: [],
  pricingPackages: [],
  pricingHero: "",
  pricingNoteHeading: DEFAULT_PRICING_NOTE_HEADING,
  pricingNoteText: DEFAULT_PRICING_NOTE_TEXT,
  pricingNoteContact: DEFAULT_PRICING_NOTE_CONTACT,
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
      introKicker:
        typeof parsed.introKicker === "string" && parsed.introKicker.trim() !== ""
          ? parsed.introKicker
          : DEFAULT_INTRO_KICKER,
      introHeading:
        typeof parsed.introHeading === "string" && parsed.introHeading.trim() !== ""
          ? parsed.introHeading
          : DEFAULT_INTRO_HEADING,
      introStats: Array.isArray(parsed.introStats)
        ? parsed.introStats.map((s: any, i: number) => ({
            id: typeof s?.id === "string" ? s.id : `s${i + 1}`,
            value: Number.isFinite(Number(s?.value)) ? Number(s.value) : 0,
            label: typeof s?.label === "string" ? s.label : "",
          }))
        : DEFAULT_INTRO_STATS,
      servicesKicker:
        typeof parsed.servicesKicker === "string" && parsed.servicesKicker.trim() !== ""
          ? parsed.servicesKicker
          : DEFAULT_SERVICES_KICKER,
      servicesHeading:
        typeof parsed.servicesHeading === "string" && parsed.servicesHeading.trim() !== ""
          ? parsed.servicesHeading
          : DEFAULT_SERVICES_HEADING,
      servicesMore: Number.isFinite(Number(parsed.servicesMore))
        ? Number(parsed.servicesMore)
        : DEFAULT_SERVICES_MORE,
      services: Array.isArray(parsed.services)
        ? parsed.services.map((s: any, i: number) => ({
            id: typeof s?.id === "string" ? s.id : `srv${i + 1}`,
            label: typeof s?.label === "string" ? s.label : "",
            icon: typeof s?.icon === "string" ? s.icon : "Code2",
          }))
        : [],
      workHeading:
        typeof parsed.workHeading === "string" && parsed.workHeading.trim() !== ""
          ? parsed.workHeading
          : DEFAULT_WORK_HEADING,
      workSubtext:
        typeof parsed.workSubtext === "string" && parsed.workSubtext.trim() !== ""
          ? parsed.workSubtext
          : DEFAULT_WORK_SUBTEXT,
      works: Array.isArray(parsed.works)
        ? parsed.works.map((w: any, i: number) => ({
            id: typeof w?.id === "string" ? w.id : `w${i + 1}`,
            title: typeof w?.title === "string" ? w.title : "",
            text: typeof w?.text === "string" ? w.text : "",
            image: typeof w?.image === "string" ? w.image : "",
            tags: Array.isArray(w?.tags) ? w.tags.map(String) : [],
          }))
        : [],
      pricingPackages: Array.isArray(parsed.pricingPackages)
        ? parsed.pricingPackages.map((p: any, i: number) => ({
            id: typeof p?.id === "string" ? p.id : `pkg${i + 1}`,
            name: typeof p?.name === "string" ? p.name : "",
            plans: Array.isArray(p?.plans)
              ? p.plans.map((pl: any) => ({
                  name: typeof pl?.name === "string" ? pl.name : "",
                  price: typeof pl?.price === "string" ? pl.price : "",
                  features: Array.isArray(pl?.features)
                    ? pl.features.map((f: any) => ({
                        label: typeof f?.label === "string" ? f.label : "",
                        value: typeof f?.value === "string" ? f.value : "",
                      }))
                    : [],
                }))
              : [],
          }))
        : [],
      pricingHero: typeof parsed.pricingHero === "string" ? parsed.pricingHero : "",
      pricingNoteHeading:
        typeof parsed.pricingNoteHeading === "string" && parsed.pricingNoteHeading.trim() !== ""
          ? parsed.pricingNoteHeading
          : DEFAULT_PRICING_NOTE_HEADING,
      pricingNoteText:
        typeof parsed.pricingNoteText === "string" && parsed.pricingNoteText.trim() !== ""
          ? parsed.pricingNoteText
          : DEFAULT_PRICING_NOTE_TEXT,
      pricingNoteContact:
        typeof parsed.pricingNoteContact === "string" && parsed.pricingNoteContact.trim() !== ""
          ? parsed.pricingNoteContact
          : DEFAULT_PRICING_NOTE_CONTACT,
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
      introKicker: DEFAULT_INTRO_KICKER,
      introHeading: DEFAULT_INTRO_HEADING,
      introStats: DEFAULT_INTRO_STATS,
      servicesKicker: DEFAULT_SERVICES_KICKER,
      servicesHeading: DEFAULT_SERVICES_HEADING,
      servicesMore: DEFAULT_SERVICES_MORE,
      services: [],
      workHeading: DEFAULT_WORK_HEADING,
      workSubtext: DEFAULT_WORK_SUBTEXT,
      works: [],
      pricingPackages: DEFAULT_PRICING_PACKAGES,
      pricingHero: "",
      pricingNoteHeading: DEFAULT_PRICING_NOTE_HEADING,
      pricingNoteText: DEFAULT_PRICING_NOTE_TEXT,
      pricingNoteContact: DEFAULT_PRICING_NOTE_CONTACT,
    };
  }
}

/** Writes the content store to disk. */
export async function writeContent(content: SiteContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), "utf-8");
}