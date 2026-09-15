"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X, Upload, ChevronDown } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { BlogPost, Career, Faq, SiteContent, Testimonial } from "@/lib/content";
import type { IntroStat } from "@/lib/intro";
import type { ServiceItem, WorkItem } from "@/lib/sections";
import { SERVICE_ICONS } from "@/lib/sections";
import type { PricingPackage } from "@/lib/pricing";

type Tab = "blogs" | "privacy" | "terms" | "careers" | "testimonials" | "faqs" | "branding" | "intro" | "services" | "work" | "pricing";
type Status = { kind: "success" | "error"; message: string } | null;

const EMPTY_CONTENT: SiteContent = {
  blogs: [],
  privacyPolicy: { title: "Privacy Policy", content: "" },
  terms: { title: "Terms & Conditions", content: "" },
  careers: [],
  testimonials: [],
  faqs: [],
  heroLogo: "",
  heroImage: "",
  introKicker: "",
  introHeading: "",
  introStats: [],
  servicesKicker: "",
  servicesHeading: "",
  servicesMore: 4,
  services: [],
  workHeading: "",
  workSubtext: "",
  works: [],
  pricingPackages: [],
  pricingHero: "",
  pricingNoteHeading: "",
  pricingNoteText: "",
  pricingNoteContact: "",
};

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "blogs", label: "Blogs" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
  { key: "careers", label: "Careers" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faqs", label: "FAQs" },
  { key: "intro", label: "Intro" },
  { key: "services", label: "Services" },
  { key: "work", label: "Work" },
  { key: "pricing", label: "Pricing" },
  { key: "branding", label: "Branding" },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const blankBlog = (): BlogPost => ({
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  content: "",
});

const blankCareer = (): Career => ({
  id: "",
  title: "",
  location: "",
  type: "Full-time",
  description: "",
});

const blankTestimonial = (): Testimonial => ({
  id: "",
  quote: "",
  name: "",
  role: "Founder",
  image: "",
});

const blankFaq = (): Faq => ({
  id: "",
  question: "",
  answer: "",
});

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/upload`, {
    method: "POST",
    body: form,
  });
  // Parse defensively — the server may return plain text/HTML on errors.
  const raw = await res.text();
  let data: { ok?: boolean; path?: string; error?: string } = {};
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      res.ok
        ? "Unexpected server response."
        : `Upload endpoint not available on the server (HTTP ${res.status}). Redeploy the latest build.`
    );
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data.path as string;
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("blogs");
  const [content, setContent] = useState<SiteContent>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [backend, setBackend] = useState<"mysql" | "json">("json");

  const [draftBlog, setDraftBlog] = useState<BlogPost | null>(null);
  const [draftCareer, setDraftCareer] = useState<Career | null>(null);
  const [draftTestimonial, setDraftTestimonial] = useState<Testimonial | null>(null);
  const [draftFaq, setDraftFaq] = useState<Faq | null>(null);
  const [heroLogoDraft, setHeroLogoDraft] = useState("");
  const [heroImageDraft, setHeroImageDraft] = useState("");
  const [introKickerDraft, setIntroKickerDraft] = useState("");
  const [introHeadingDraft, setIntroHeadingDraft] = useState("");
  const [introStatsDraft, setIntroStatsDraft] = useState<IntroStat[]>([]);
  const [servicesKickerDraft, setServicesKickerDraft] = useState("");
  const [servicesHeadingDraft, setServicesHeadingDraft] = useState("");
  const [servicesMoreDraft, setServicesMoreDraft] = useState(4);
  const [servicesDraft, setServicesDraft] = useState<ServiceItem[]>([]);
  const [workHeadingDraft, setWorkHeadingDraft] = useState("");
  const [workSubtextDraft, setWorkSubtextDraft] = useState("");
  const [worksDraft, setWorksDraft] = useState<WorkItem[]>([]);
  const [pricingDraft, setPricingDraft] = useState<PricingPackage[]>([]);
  const [pricingHeroDraft, setPricingHeroDraft] = useState("");
  const [pricingSettingsOpen, setPricingSettingsOpen] = useState(false);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [pricingNoteHeadingDraft, setPricingNoteHeadingDraft] = useState("");
  const [pricingNoteTextDraft, setPricingNoteTextDraft] = useState("");
  const [pricingNoteContactDraft, setPricingNoteContactDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [privacyDraft, setPrivacyDraft] = useState({ title: "", content: "" });
  const [termsDraft, setTermsDraft] = useState({ title: "", content: "" });

  useEffect(() => {
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/content`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.json() as Promise<SiteContent>;
      })
      .then((data) => {
        if (!active) return;
        const d = data as SiteContent & { _backend?: { backend: "mysql" | "json" } };
        const { _backend, ...clean } = d;
        setContent({
          ...clean,
          testimonials: Array.isArray(clean.testimonials) ? clean.testimonials : [],
          faqs: Array.isArray(clean.faqs) ? clean.faqs : [],
          heroLogo: typeof clean.heroLogo === "string" ? clean.heroLogo : "",
          heroImage: typeof clean.heroImage === "string" ? clean.heroImage : "",
          introKicker: typeof clean.introKicker === "string" ? clean.introKicker : "",
          introHeading: typeof clean.introHeading === "string" ? clean.introHeading : "",
          introStats: Array.isArray(clean.introStats) ? clean.introStats : [],
          servicesKicker: typeof clean.servicesKicker === "string" ? clean.servicesKicker : "",
          servicesHeading: typeof clean.servicesHeading === "string" ? clean.servicesHeading : "",
          servicesMore: Number.isFinite(Number(clean.servicesMore)) ? Number(clean.servicesMore) : 4,
          services: Array.isArray(clean.services) ? clean.services : [],
          workHeading: typeof clean.workHeading === "string" ? clean.workHeading : "",
          workSubtext: typeof clean.workSubtext === "string" ? clean.workSubtext : "",
          works: Array.isArray(clean.works) ? clean.works : [],
          pricingPackages: Array.isArray(clean.pricingPackages) ? clean.pricingPackages : [],
          pricingHero: typeof clean.pricingHero === "string" ? clean.pricingHero : "",
          pricingNoteHeading: typeof clean.pricingNoteHeading === "string" ? clean.pricingNoteHeading : "",
          pricingNoteText: typeof clean.pricingNoteText === "string" ? clean.pricingNoteText : "",
          pricingNoteContact: typeof clean.pricingNoteContact === "string" ? clean.pricingNoteContact : "",
        });
        if (_backend) setBackend(_backend.backend);
        setHeroLogoDraft(typeof clean.heroLogo === "string" ? clean.heroLogo : "");
        setHeroImageDraft(typeof clean.heroImage === "string" ? clean.heroImage : "");
        setIntroKickerDraft(typeof clean.introKicker === "string" ? clean.introKicker : "");
        setIntroHeadingDraft(typeof clean.introHeading === "string" ? clean.introHeading : "");
        setIntroStatsDraft(
          Array.isArray(clean.introStats)
            ? clean.introStats.map((s, i) => ({
                id: typeof s.id === "string" ? s.id : `s${i + 1}`,
                value: Number(s.value) || 0,
                label: String(s.label ?? ""),
              }))
            : []
        );
        setServicesKickerDraft(typeof clean.servicesKicker === "string" ? clean.servicesKicker : "");
        setServicesHeadingDraft(typeof clean.servicesHeading === "string" ? clean.servicesHeading : "");
        setServicesMoreDraft(Number.isFinite(Number(clean.servicesMore)) ? Number(clean.servicesMore) : 4);
        setServicesDraft(
          Array.isArray(clean.services)
            ? clean.services.map((s, i) => ({
                id: typeof s.id === "string" ? s.id : `srv${i + 1}`,
                label: String(s.label ?? ""),
                icon: String(s.icon ?? "Code2"),
              }))
            : []
        );
        setWorkHeadingDraft(typeof clean.workHeading === "string" ? clean.workHeading : "");
        setWorkSubtextDraft(typeof clean.workSubtext === "string" ? clean.workSubtext : "");
        setWorksDraft(
          Array.isArray(clean.works)
            ? clean.works.map((w, i) => ({
                id: typeof w.id === "string" ? w.id : `w${i + 1}`,
                title: String(w.title ?? ""),
                text: String(w.text ?? ""),
                image: String(w.image ?? ""),
                tags: Array.isArray(w.tags) ? w.tags.map(String) : [],
              }))
            : []
        );
        setPricingHeroDraft(typeof clean.pricingHero === "string" ? clean.pricingHero : "");
        setPricingNoteHeadingDraft(typeof clean.pricingNoteHeading === "string" ? clean.pricingNoteHeading : "");
        setPricingNoteTextDraft(typeof clean.pricingNoteText === "string" ? clean.pricingNoteText : "");
        setPricingNoteContactDraft(typeof clean.pricingNoteContact === "string" ? clean.pricingNoteContact : "");
        setPricingDraft(
          Array.isArray(clean.pricingPackages)
            ? clean.pricingPackages.map((p, i) => ({
                id: typeof p.id === "string" ? p.id : `pkg${i + 1}`,
                name: String(p.name ?? ""),
                plans: Array.isArray(p.plans)
                  ? p.plans.map((pl) => ({
                      name: String(pl.name ?? ""),
                      price: String(pl.price ?? ""),
                      features: Array.isArray(pl.features)
                        ? pl.features.map((f: { label: string; value: string }) => ({
                            label: String(f.label ?? ""),
                            value: String(f.value ?? ""),
                          }))
                        : [],
                    }))
                  : [],
              }))
            : []
        );
        setPrivacyDraft({
          title: d.privacyPolicy.title,
          content: d.privacyPolicy.content,
        });
        setTermsDraft({ title: d.terms.title, content: d.terms.content });
      })
      .catch(() => {
        if (active) {
          setStatus({ kind: "error", message: "Could not load content from server." });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function persist(next: SiteContent) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Server rejected the update");
      setContent(next);
      setStatus({ kind: "success", message: "Saved successfully." });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth/logout`, {
        method: "POST",
      });
    } catch {
      // ignore — reload clears the session anyway
    }
    window.location.href = "/";
  }

  /* ---------------- Blogs ---------------- */

  function saveBlog() {
    if (!draftBlog) return;
    if (!draftBlog.title.trim()) {
      setStatus({ kind: "error", message: "Blog title is required." });
      return;
    }
    const final: BlogPost = {
      ...draftBlog,
      slug: draftBlog.slug.trim() || slugify(draftBlog.title),
      id: draftBlog.id || `blog-${Date.now()}`,
    };
    const exists = content.blogs.some((b) => b.id === final.id);
    const blogs = exists
      ? content.blogs.map((b) => (b.id === final.id ? final : b))
      : [...content.blogs, final];
    persist({ ...content, blogs });
    setDraftBlog(null);
  }

  function deleteBlog(id: string) {
    if (!window.confirm("Delete this blog post?")) return;
    persist({ ...content, blogs: content.blogs.filter((b) => b.id !== id) });
  }

  /* ---------------- Careers ---------------- */

  function saveCareer() {
    if (!draftCareer) return;
    if (!draftCareer.title.trim()) {
      setStatus({ kind: "error", message: "Job title is required." });
      return;
    }
    const final: Career = {
      ...draftCareer,
      id: draftCareer.id || `career-${Date.now()}`,
    };
    const exists = content.careers.some((c) => c.id === final.id);
    const careers = exists
      ? content.careers.map((c) => (c.id === final.id ? final : c))
      : [...content.careers, final];
    persist({ ...content, careers });
    setDraftCareer(null);
  }

  function deleteCareer(id: string) {
    if (!window.confirm("Delete this job posting?")) return;
    persist({ ...content, careers: content.careers.filter((c) => c.id !== id) });
  }

  /* ---------------- Testimonials ---------------- */

  function saveTestimonial() {
    if (!draftTestimonial) return;
    if (!draftTestimonial.name.trim() || !draftTestimonial.quote.trim()) {
      setStatus({ kind: "error", message: "Name and review text are required." });
      return;
    }
    const final: Testimonial = {
      ...draftTestimonial,
      id: draftTestimonial.id || `testimonial-${Date.now()}`,
    };
    const exists = (content.testimonials ?? []).some((t) => t.id === final.id);
    const testimonials = exists
      ? content.testimonials.map((t) => (t.id === final.id ? final : t))
      : [...content.testimonials, final];
    persist({ ...content, testimonials });
    setDraftTestimonial(null);
  }

  function deleteTestimonial(id: string) {
    if (!window.confirm("Delete this testimonial?")) return;
    persist({ ...content, testimonials: content.testimonials.filter((t) => t.id !== id) });
  }

  async function handleTestimonialImage(file: File) {
    if (!draftTestimonial) return;
    setUploading(true);
    setStatus(null);
    try {
      const url = await uploadImage(file);
      setDraftTestimonial({ ...draftTestimonial, image: url });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- FAQs ---------------- */

  function saveFaq() {
    if (!draftFaq) return;
    if (!draftFaq.question.trim() || !draftFaq.answer.trim()) {
      setStatus({ kind: "error", message: "Question and answer are required." });
      return;
    }
    const final: Faq = {
      ...draftFaq,
      id: draftFaq.id || `faq-${Date.now()}`,
    };
    const exists = (content.faqs ?? []).some((f) => f.id === final.id);
    const faqs = exists
      ? content.faqs.map((f) => (f.id === final.id ? final : f))
      : [...content.faqs, final];
    persist({ ...content, faqs });
    setDraftFaq(null);
  }

  function deleteFaq(id: string) {
    if (!window.confirm("Delete this FAQ?")) return;
    persist({ ...content, faqs: content.faqs.filter((f) => f.id !== id) });
  }

  /* ---------------- Branding (hero logo) ---------------- */

  async function handleHeroLogoUpload(file: File) {
    setUploading(true);
    setStatus(null);
    try {
      const url = await uploadImage(file);
      setHeroLogoDraft(url);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleHeroImageUpload(file: File) {
    setUploading(true);
    setStatus(null);
    try {
      const url = await uploadImage(file);
      setHeroImageDraft(url);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  function saveBranding() {
    persist({ ...content, heroLogo: heroLogoDraft.trim(), heroImage: heroImageDraft.trim() });
  }

  function saveIntro() {
    persist({
      ...content,
      introKicker: introKickerDraft.trim(),
      introHeading: introHeadingDraft.trim(),
      introStats: introStatsDraft.map((s) => ({
        id: s.id,
        value: Number(s.value) || 0,
        label: s.label.trim(),
      })),
    });
  }

  function updateIntroStat(id: string, patch: Partial<IntroStat>) {
    setIntroStatsDraft((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  function addIntroStat() {
    setIntroStatsDraft((prev) => [
      ...prev,
      { id: `s${Date.now()}`, value: 0, label: "" },
    ]);
  }

  function removeIntroStat(id: string) {
    setIntroStatsDraft((prev) => prev.filter((s) => s.id !== id));
  }

  /* ---------------- Services ---------------- */

  function saveServices() {
    persist({
      ...content,
      servicesKicker: servicesKickerDraft.trim(),
      servicesHeading: servicesHeadingDraft.trim(),
      servicesMore: Number(servicesMoreDraft) || 0,
      services: servicesDraft.map((s) => ({
        id: s.id,
        label: s.label.trim(),
        icon: s.icon,
      })),
    });
  }

  function updateService(id: string, patch: Partial<ServiceItem>) {
    setServicesDraft((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addService() {
    setServicesDraft((prev) => [
      ...prev,
      { id: `srv${Date.now()}`, label: "", icon: "Code2" },
    ]);
  }

  function removeService(id: string) {
    setServicesDraft((prev) => prev.filter((s) => s.id !== id));
  }

  /* ---------------- Work ---------------- */

  function saveWork() {
    persist({
      ...content,
      workHeading: workHeadingDraft.trim(),
      workSubtext: workSubtextDraft.trim(),
      works: worksDraft.map((w) => ({
        id: w.id,
        title: w.title.trim(),
        text: w.text.trim(),
        image: w.image.trim(),
        tags: w.tags.map((t) => t.trim()).filter(Boolean),
      })),
    });
  }

  function updateWork(id: string, patch: Partial<WorkItem>) {
    setWorksDraft((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function addWork() {
    setWorksDraft((prev) => [
      ...prev,
      { id: `w${Date.now()}`, title: "", text: "", image: "", tags: [] },
    ]);
  }

  function removeWork(id: string) {
    setWorksDraft((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleWorkImageUpload(id: string, file: File) {
    setUploading(true);
    setStatus(null);
    try {
      const url = await uploadImage(file);
      updateWork(id, { image: url });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- Pricing ---------------- */

  function savePricing() {
    persist({
      ...content,
      pricingPackages: pricingDraft.map((p) => ({
        id: p.id,
        name: p.name.trim(),
        plans: p.plans.map((pl) => ({
          name: pl.name.trim(),
          price: pl.price.trim(),
          features: pl.features.map((f) => ({
            label: f.label.trim(),
            value: f.value,
          })),
        })),
      })),
      pricingHero: pricingHeroDraft.trim(),
      pricingNoteHeading: pricingNoteHeadingDraft.trim(),
      pricingNoteText: pricingNoteTextDraft.trim(),
      pricingNoteContact: pricingNoteContactDraft.trim(),
    });
  }

  async function handlePricingHeroUpload(file: File) {
    setUploading(true);
    setStatus(null);
    try {
      const url = await uploadImage(file);
      setPricingHeroDraft(url);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  function updatePricingPackage(id: string, patch: Partial<PricingPackage>) {
    setPricingDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addPricingPackage() {
    const id = `pkg${Date.now()}`;
    setPricingDraft((prev) => [
      ...prev,
      {
        id,
        name: "",
        plans: [
          { name: "ECONOMIC", price: "", features: [] },
          { name: "BUDGET", price: "", features: [] },
          { name: "STANDARD", price: "", features: [] },
        ],
      },
    ]);
    setExpandedPackage(id); // open it straight away for editing
  }

  function removePricingPackage(id: string) {
    setPricingDraft((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePricingPlan(
    pkgId: string,
    planIndex: number,
    patch: Partial<PricingPackage["plans"][number]>
  ) {
    setPricingDraft((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? {
              ...p,
              plans: p.plans.map((pl, i) => (i === planIndex ? { ...pl, ...patch } : pl)),
            }
          : p
      )
    );
  }

  function updatePricingFeature(
    pkgId: string,
    planIndex: number,
    featureIndex: number,
    patch: Partial<{ label: string; value: string }>
  ) {
    setPricingDraft((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? {
              ...p,
              plans: p.plans.map((pl, i) =>
                i === planIndex
                  ? {
                      ...pl,
                      features: pl.features.map((f, fi) =>
                        fi === featureIndex ? { ...f, ...patch } : f
                      ),
                    }
                  : pl
              ),
            }
          : p
      )
    );
  }

  function addPricingFeature(pkgId: string, planIndex: number) {
    setPricingDraft((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? {
              ...p,
              plans: p.plans.map((pl, i) =>
                i === planIndex
                  ? { ...pl, features: [...pl.features, { label: "", value: "" }] }
                  : pl
              ),
            }
          : p
      )
    );
  }

  function removePricingFeature(pkgId: string, planIndex: number, featureIndex: number) {
    setPricingDraft((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? {
              ...p,
              plans: p.plans.map((pl, i) =>
                i === planIndex
                  ? { ...pl, features: pl.features.filter((_, fi) => fi !== featureIndex) }
                  : pl
              ),
            }
          : p
      )
    );
  }

  function saveLegal(section: "privacy" | "terms") {
    persist(
      section === "privacy"
        ? { ...content, privacyPolicy: privacyDraft }
        : { ...content, terms: termsDraft }
    );
  }

  /* ---------------- Render: Blogs ---------------- */

  function renderBlogList() {
    if (draftBlog) {
      return (
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>{draftBlog.id ? "Edit blog post" : "New blog post"}</h2>
            <button className="admin-btn" onClick={() => setDraftBlog(null)}>
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="admin-form">
            <div className="admin-field">
              <label>Title *</label>
              <input
                className="admin-input"
                value={draftBlog.title}
                onChange={(e) =>
                  setDraftBlog({
                    ...draftBlog,
                    title: e.target.value,
                    slug: draftBlog.slug || slugify(e.target.value),
                  })
                }
                placeholder="Post title"
              />
            </div>
            <div className="admin-form-row">
              <div className="admin-field">
                <label>Slug (URL)</label>
                <input
                  className="admin-input"
                  value={draftBlog.slug}
                  onChange={(e) => setDraftBlog({ ...draftBlog, slug: e.target.value })}
                  placeholder="auto-from-title"
                />
              </div>
              <div className="admin-field">
                <label>Date</label>
                <input
                  className="admin-input"
                  type="date"
                  value={draftBlog.date}
                  onChange={(e) => setDraftBlog({ ...draftBlog, date: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-field">
              <label>Excerpt</label>
              <textarea
                className="admin-textarea"
                rows={2}
                value={draftBlog.excerpt}
                onChange={(e) => setDraftBlog({ ...draftBlog, excerpt: e.target.value })}
                placeholder="Short summary shown on the blog list"
              />
            </div>
                        <div className="admin-field">
              <label>Image URL (optional)</label>
              <input
                className="admin-input"
                value={draftBlog.image ?? ""}
                onChange={(e) => setDraftBlog({ ...draftBlog, image: e.target.value || undefined })}
                placeholder="/images/blog-preview.png"
              />
              <p className="admin-hint">
                e.g. /images/my-post.png. Leave blank for no image.
              </p>
            </div>
            <div className="admin-field">
              <label>Content</label>
              <MarkdownEditor
                value={draftBlog.content}
                onChange={(v) => setDraftBlog({ ...draftBlog, content: v })}
                rows={12}
                placeholder="Write your post here…"
              />
             
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveBlog} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save blog"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Blog posts ({content.blogs.length})</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setDraftBlog(blankBlog())}>
            <Plus size={14} /> New blog
          </button>
        </div>
        {content.blogs.length === 0 ? (
          <p className="empty-state">No blog posts yet. Click “New blog” to create one.</p>
        ) : (
          <div className="admin-list">
            {content.blogs.map((blog) => (
              <div className="admin-item" key={blog.id}>
                <div className="admin-item-title">
                  <strong>{blog.title}</strong>
                  <span>/{blog.slug} · {blog.date}</span>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-btn" onClick={() => setDraftBlog({ ...blog })}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteBlog(blog.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
/* ---------------- Render: Careers ---------------- */

  function renderCareerList() {
    if (draftCareer) {
      return (
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>{draftCareer.id ? "Edit job posting" : "New job posting"}</h2>
            <button className="admin-btn" onClick={() => setDraftCareer(null)}>
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="admin-form">
            <div className="admin-field">
              <label>Job title *</label>
              <input
                className="admin-input"
                value={draftCareer.title}
                onChange={(e) => setDraftCareer({ ...draftCareer, title: e.target.value })}
                placeholder="e.g. Senior Product Designer"
              />
            </div>
            <div className="admin-form-row">
              <div className="admin-field">
                <label>Location</label>
                <input
                  className="admin-input"
                  value={draftCareer.location}
                  onChange={(e) => setDraftCareer({ ...draftCareer, location: e.target.value })}
                  placeholder="Kathmandu (Hybrid)"
                />
              </div>
              <div className="admin-field">
                <label>Type</label>
                <input
                  className="admin-input"
                  value={draftCareer.type}
                  onChange={(e) => setDraftCareer({ ...draftCareer, type: e.target.value })}
                  placeholder="Full-time"
                />
              </div>
            </div>
            <div className="admin-field">
              <label>Description</label>
              <MarkdownEditor
                value={draftCareer.description}
                onChange={(v) => setDraftCareer({ ...draftCareer, description: v })}
                rows={5}
                placeholder="Describe the role…"
              />
              
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveCareer} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save job"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Careers ({content.careers.length})</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setDraftCareer(blankCareer())}>
            <Plus size={14} /> New job
          </button>
        </div>
        {content.careers.length === 0 ? (
          <p className="empty-state">No job postings yet. Click “New job” to create one.</p>
        ) : (
          <div className="admin-list">
            {content.careers.map((job) => (
              <div className="admin-item" key={job.id}>
                <div className="admin-item-title">
                  <strong>{job.title}</strong>
                  <span>{job.type} · {job.location}</span>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-btn" onClick={() => setDraftCareer({ ...job })}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteCareer(job.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
/* ---------------- Render: Testimonials ---------------- */

  function renderTestimonialList() {
    if (draftTestimonial) {
      return (
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>{draftTestimonial.id ? "Edit testimonial" : "New testimonial"}</h2>
            <button className="admin-btn" onClick={() => setDraftTestimonial(null)}>
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="admin-form">
            <div className="admin-field">
              <label>Review *</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={draftTestimonial.quote}
                onChange={(e) => setDraftTestimonial({ ...draftTestimonial, quote: e.target.value })}
                placeholder="What the client said…"
              />
            </div>
            <div className="admin-form-row">
              <div className="admin-field">
                <label>Name *</label>
                <input
                  className="admin-input"
                  value={draftTestimonial.name}
                  onChange={(e) => setDraftTestimonial({ ...draftTestimonial, name: e.target.value })}
                  placeholder="e.g. Ram Sherpa"
                />
              </div>
              <div className="admin-field">
                <label>Designation</label>
                <input
                  className="admin-input"
                  value={draftTestimonial.role}
                  onChange={(e) => setDraftTestimonial({ ...draftTestimonial, role: e.target.value })}
                  placeholder="e.g. Founder of XYZ Pvt. Ltd."
                />
              </div>
            </div>
            <div className="admin-field">
              <label>Photo</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {draftTestimonial.image && (
                  <Image
                    src={draftTestimonial.image}
                    alt="Preview"
                    width={56}
                    height={56}
                    unoptimized
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                )}
                <label className="admin-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} /> {uploading ? "Uploading…" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTestimonialImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {draftTestimonial.image && (
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => setDraftTestimonial({ ...draftTestimonial, image: "" })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                className="admin-input"
                style={{ marginTop: 10 }}
                value={draftTestimonial.image ?? ""}
                onChange={(e) => setDraftTestimonial({ ...draftTestimonial, image: e.target.value || "" })}
                placeholder="…or paste an image URL (/uploads/photo.webp or https://…)"
              />
              <p className="admin-hint">Upload a square image, up to 4 MB. JPG, PNG, WebP, AVIF or GIF.</p>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveTestimonial} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save testimonial"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Testimonials ({content.testimonials.length})</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setDraftTestimonial(blankTestimonial())}>
            <Plus size={14} /> New testimonial
          </button>
        </div>
        {content.testimonials.length === 0 ? (
          <p className="empty-state">No testimonials yet. Click “New testimonial” to add one.</p>
        ) : (
          <div className="admin-list">
            {content.testimonials.map((t) => (
              <div className="admin-item" key={t.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {t.image && (
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={40}
                      height={40}
                      unoptimized
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  )}
                  <div className="admin-item-title">
                    <strong>{t.name}</strong>
                    <span>{t.role} — “{t.quote.slice(0, 60)}{t.quote.length > 60 ? "…" : ""}”</span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-btn" onClick={() => setDraftTestimonial({ ...t, image: t.image ?? "" })}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteTestimonial(t.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
/* ---------------- Render: FAQs ---------------- */

  function renderFaqList() {
    if (draftFaq) {
      return (
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>{draftFaq.id ? "Edit FAQ" : "New FAQ"}</h2>
            <button className="admin-btn" onClick={() => setDraftFaq(null)}>
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="admin-form">
            <div className="admin-field">
              <label>Question *</label>
              <input
                className="admin-input"
                value={draftFaq.question}
                onChange={(e) => setDraftFaq({ ...draftFaq, question: e.target.value })}
                placeholder="e.g. How long does a project take?"
              />
            </div>
            <div className="admin-field">
              <label>Answer *</label>
              <textarea
                className="admin-textarea"
                rows={5}
                value={draftFaq.answer}
                onChange={(e) => setDraftFaq({ ...draftFaq, answer: e.target.value })}
                placeholder="Write the answer here…"
              />
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveFaq} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save FAQ"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>FAQs ({content.faqs.length})</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setDraftFaq(blankFaq())}>
            <Plus size={14} /> New FAQ
          </button>
        </div>
        {content.faqs.length === 0 ? (
          <p className="empty-state">No FAQs yet. Click “New FAQ” to add one.</p>
        ) : (
          <div className="admin-list">
            {content.faqs.map((f) => (
              <div className="admin-item" key={f.id}>
                <div className="admin-item-title">
                  <strong>{f.question}</strong>
                  <span>{f.answer.slice(0, 80)}{f.answer.length > 80 ? "…" : ""}</span>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-btn" onClick={() => setDraftFaq({ ...f })}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteFaq(f.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
/* ---------------- Render: Branding ---------------- */

  function renderIntro() {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Intro section (We are…)</h2>
        </div>
        <div className="admin-form">
          <div className="admin-field">
            <label>Kicker (small text above the heading)</label>
            <input
              className="admin-input"
              value={introKickerDraft}
              onChange={(e) => setIntroKickerDraft(e.target.value)}
              placeholder="We are…"
            />
          </div>
          <div className="admin-field">
            <label>Heading (the conviction statement)</label>
            <textarea
              className="admin-input"
              rows={5}
              value={introHeadingDraft}
              onChange={(e) => setIntroHeadingDraft(e.target.value)}
              placeholder="A company with a simple conviction…"
            />
          </div>

          <div className="admin-field">
            <label>Stats (counters)</label>
            {introStatsDraft.length === 0 && (
              <p className="admin-hint">No stats yet — add one below.</p>
            )}
            {introStatsDraft.map((stat) => (
              <div
                key={stat.id}
                style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
              >
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  style={{ width: 110 }}
                  value={stat.value}
                  onChange={(e) => updateIntroStat(stat.id, { value: Number(e.target.value) })}
                  aria-label="Stat value"
                />
                <input
                  className="admin-input"
                  value={stat.label}
                  onChange={(e) => updateIntroStat(stat.id, { label: e.target.value })}
                  placeholder="Label (e.g. Digital Ideas)"
                />
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => removeIntroStat(stat.id)}
                  aria-label={`Remove stat ${stat.label || ""}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button className="admin-btn" onClick={addIntroStat}>
              <Plus size={14} /> Add stat
            </button>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={saveIntro}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save intro"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderServices() {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Services section</h2>
        </div>
        <div className="admin-form">
          <div className="admin-field">
            <label>Kicker (small text)</label>
            <input
              className="admin-input"
              value={servicesKickerDraft}
              onChange={(e) => setServicesKickerDraft(e.target.value)}
              placeholder="Our Services"
            />
          </div>
          <div className="admin-field">
            <label>Heading</label>
            <input
              className="admin-input"
              value={servicesHeadingDraft}
              onChange={(e) => setServicesHeadingDraft(e.target.value)}
              placeholder="We aim to provide solutions…"
            />
          </div>

          <div className="admin-field">
            <label>Service items</label>
            {servicesDraft.map((service) => (
              <div
                key={service.id}
                style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
              >
                <select
                  className="admin-input"
                  style={{ width: 150 }}
                  value={service.icon}
                  onChange={(e) => updateService(service.id, { icon: e.target.value })}
                  aria-label="Icon"
                >
                  {SERVICE_ICONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input"
                  value={service.label}
                  onChange={(e) => updateService(service.id, { label: e.target.value })}
                  placeholder="Service name (e.g. Web Development)"
                />
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => removeService(service.id)}
                  aria-label={`Remove service ${service.label || ""}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button className="admin-btn" onClick={addService}>
              <Plus size={14} /> Add service
            </button>
          </div>

          <div className="admin-field">
            <label>"+N More" card</label>
            <input
              className="admin-input"
              type="number"
              min={0}
              style={{ width: 110 }}
              value={servicesMoreDraft}
              onChange={(e) => setServicesMoreDraft(Number(e.target.value))}
            />
            <p className="admin-hint">Set 0 to hide the "+N More" card.</p>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={saveServices}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save services"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderWork() {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Selected work gallery</h2>
        </div>
        <div className="admin-form">
          <div className="admin-field">
            <label>Heading</label>
            <input
              className="admin-input"
              value={workHeadingDraft}
              onChange={(e) => setWorkHeadingDraft(e.target.value)}
              placeholder="Selected work!"
            />
          </div>
          <div className="admin-field">
            <label>Subtext (below the heading)</label>
            <textarea
              className="admin-input"
              rows={2}
              value={workSubtextDraft}
              onChange={(e) => setWorkSubtextDraft(e.target.value)}
              placeholder="A selection of work…"
            />
          </div>

          <div className="admin-field">
            <label>Work items (filters build from tags automatically)</label>
            {worksDraft.map((work) => (
              <div
                key={work.id}
                style={{
                  border: "1px solid #e2e6e2",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <input
                    className="admin-input"
                    value={work.title}
                    onChange={(e) => updateWork(work.id, { title: e.target.value })}
                    placeholder="Project title"
                  />
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => removeWork(work.id)}
                    aria-label={`Remove work ${work.title || ""}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={work.text}
                  onChange={(e) => updateWork(work.id, { text: e.target.value })}
                  placeholder="Short description shown on hover"
                  style={{ marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  {work.image && (
                    <Image
                      src={work.image}
                      alt={work.title || "Work preview"}
                      width={72}
                      height={48}
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  )}
                  <label className="admin-btn" style={{ cursor: "pointer" }}>
                    <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                      style={{ display: "none" }}
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleWorkImageUpload(work.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <input
                  className="admin-input"
                  value={work.image}
                  onChange={(e) => updateWork(work.id, { image: e.target.value })}
                  placeholder="…or paste an image URL (/brand.avif or https://…)"
                  style={{ marginBottom: 8 }}
                />
                <input
                  className="admin-input"
                  value={work.tags.join(", ")}
                  onChange={(e) =>
                    updateWork(work.id, {
                      tags: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  placeholder="Tags, comma-separated (e.g. Branding, Strategy, Creative)"
                />
              </div>
            ))}
            <button className="admin-btn" onClick={addWork}>
              <Plus size={14} /> Add work
            </button>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={saveWork}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save work"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderPricing() {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Pricing packages (interactive selector)</h2>
        </div>
        <div className="admin-form">
          <p className="admin-hint">
            Each package appears in the left sidebar of /pricing with its three plans
            (Economic / Budget / Standard). Click a package to edit it. Tip: use ✅ and
            ❌ as feature values to show ticks and crosses on the site.
          </p>

          <button
            type="button"
            className="admin-btn"
            onClick={() => setPricingSettingsOpen((v) => !v)}
            style={{ marginBottom: 14, justifyContent: "flex-start" }}
          >
            <ChevronDown
              size={14}
              style={{ transform: pricingSettingsOpen ? "rotate(180deg)" : "none" }}
            />
            {pricingSettingsOpen ? "Hide" : "Edit"} page banner & footer text
          </button>

          {pricingSettingsOpen && (
            <>
          <div className="admin-field">
            <label>Top banner image (optional, full-width, 30% of screen height)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {pricingHeroDraft && (
                <Image
                  src={pricingHeroDraft}
                  alt="Pricing banner preview"
                  width={120}
                  height={56}
                  unoptimized
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              )}
              <label className="admin-btn" style={{ cursor: "pointer" }}>
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  style={{ display: "none" }}
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePricingHeroUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {pricingHeroDraft && (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => setPricingHeroDraft("")}
                >
                  Remove image
                </button>
              )}
            </div>
            <input
              className="admin-input"
              style={{ marginTop: 10 }}
              value={pricingHeroDraft}
              onChange={(e) => setPricingHeroDraft(e.target.value)}
              placeholder="…or paste an image URL (/uploads/banner.jpg or https://…)"
            />
            <p className="admin-hint">
              Leave empty to hide the banner completely. A wide image (1920×600 or
              similar) looks best.
            </p>
          </div>

          <div className="admin-field">
            <label>"Every project includes" heading</label>
            <input
              className="admin-input"
              value={pricingNoteHeadingDraft}
              onChange={(e) => setPricingNoteHeadingDraft(e.target.value)}
              placeholder="Every project includes"
            />
          </div>
          <div className="admin-field">
            <label>"Every project includes" text</label>
            <textarea
              className="admin-input"
              rows={3}
              value={pricingNoteTextDraft}
              onChange={(e) => setPricingNoteTextDraft(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Contact email (shown at the bottom)</label>
            <input
              className="admin-input"
              type="email"
              value={pricingNoteContactDraft}
              onChange={(e) => setPricingNoteContactDraft(e.target.value)}
              placeholder="info@onewaynepal.com"
            />
          </div>
            </>
          )}

          <label className="admin-hint" style={{ display: "block", marginBottom: 8 }}>
            {pricingDraft.length} package{pricingDraft.length === 1 ? "" : "s"}
          </label>

          {pricingDraft.map((pkg) => {
            const open = expandedPackage === pkg.id;
            return (
              <div
                key={pkg.id}
                style={{
                  border: `1px solid ${open ? "#0d5b53" : "#e2e6e2"}`,
                  borderRadius: 10,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                {/* Collapsed row — click Edit to open this package */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    padding: 10,
                    background: open ? "#f3f8f7" : "#ffffff",
                  }}
                >
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setExpandedPackage(open ? null : pkg.id)}
                    aria-expanded={open}
                    style={{ flex: "none" }}
                  >
                    <ChevronDown
                      size={14}
                      style={{ transform: open ? "rotate(180deg)" : "none" }}
                    />
                    {open ? "Close" : "Edit"}
                  </button>
                  <input
                    className="admin-input"
                    value={pkg.name}
                    onChange={(e) => updatePricingPackage(pkg.id, { name: e.target.value })}
                    placeholder="Package name (e.g. BUSINESS PACKAGE)"
                    style={{ fontWeight: 700, textTransform: "uppercase" }}
                  />
                  <span className="admin-hint" style={{ flex: "none", margin: 0 }}>
                    {pkg.plans.length} plans
                  </span>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => removePricingPackage(pkg.id)}
                    aria-label={`Remove package ${pkg.name || ""}`}
                    style={{ flex: "none" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {open && (
                  <div style={{ padding: "12px 12px 4px" }}>
                    {pkg.plans.map((plan, planIndex) => (
                      <div
                        key={planIndex}
                        style={{
                          border: "1px solid #eef1ef",
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 12,
                          background: "#fdfdfd",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <input
                            className="admin-input"
                            style={{ width: 150, fontWeight: 600 }}
                            value={plan.name}
                            onChange={(e) =>
                              updatePricingPlan(pkg.id, planIndex, { name: e.target.value })
                            }
                            placeholder="Plan name (e.g. ECONOMIC)"
                          />
                          <input
                            className="admin-input"
                            value={plan.price}
                            onChange={(e) =>
                              updatePricingPlan(pkg.id, planIndex, { price: e.target.value })
                            }
                            placeholder="Price (e.g. Rs. 40,000)"
                          />
                        </div>

                  <div style={{ display: "grid", gap: 6 }}>
                          {plan.features.map((feature, fi) => (
                            <div
                              key={fi}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1fr) 120px auto",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              <input
                                className="admin-input"
                                value={feature.label}
                                onChange={(e) =>
                                  updatePricingFeature(pkg.id, planIndex, fi, {
                                    label: e.target.value,
                                  })
                                }
                                placeholder="Feature (e.g. Hosting)"
                              />
                              <input
                                className="admin-input"
                                value={feature.value}
                                onChange={(e) =>
                                  updatePricingFeature(pkg.id, planIndex, fi, {
                                    value: e.target.value,
                                  })
                                }
                                placeholder="✅ / ❌ / value"
                              />
                              <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => removePricingFeature(pkg.id, planIndex, fi)}
                                aria-label={`Remove ${feature.label || "feature"}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          className="admin-btn"
                          style={{ marginTop: 10 }}
                          onClick={() => addPricingFeature(pkg.id, planIndex)}
                        >
                          <Plus size={13} /> Add feature
                        </button>
                      </div>
                    ))}

                    <p className="admin-hint" style={{ marginTop: 0 }}>
                      Left box = feature name · right box = value (✅ / ❌ or text such as
                      &quot;4 GB&quot;).
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button className="admin-btn" onClick={addPricingPackage}>
              <Plus size={14} /> Add package
            </button>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={savePricing}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save pricing"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderBranding() {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Branding</h2>
        </div>
        <div className="admin-form">
          <div className="admin-field">
            <label>Navbar logo (hero logo)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Image
                src={heroLogoDraft || "/logo-transparent.png"}
                alt="Logo preview"
                width={56}
                height={56}
                unoptimized
                style={{ objectFit: "contain", background: "#fff", borderRadius: 8, padding: 4 }}
              />
              <label className="admin-btn" style={{ cursor: "pointer" }}>
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
                  style={{ display: "none" }}
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleHeroLogoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroLogoDraft && (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => setHeroLogoDraft("")}
                >
                  Reset to default
                </button>
              )}
            </div>
            <input
              className="admin-input"
              style={{ marginTop: 10 }}
              value={heroLogoDraft}
              onChange={(e) => setHeroLogoDraft(e.target.value)}
              placeholder="…or paste an image URL (/uploads/logo.webp or https://…)"
            />
            <p className="admin-hint">
              Leave empty to use the default logo (/logo-transparent.png). A transparent PNG/WebP around
              132×44 px looks best. Shown in the navbar at the top of every page.
            </p>
          </div>
          <div className="admin-field">
            <label>Hero image (building)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {heroImageDraft ? (
                <Image
                  src={heroImageDraft}
                  alt="Hero image preview"
                  width={120}
                  height={80}
                  unoptimized
                  style={{ objectFit: "cover", background: "#fff", borderRadius: 8 }}
                />
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 80,
                    padding: "0 14px",
                    border: "1px dashed #cbd5d0",
                    borderRadius: 8,
                    color: "#6b736f",
                    fontSize: 13,
                  }}
                >
                  No image — hero image hidden
                </span>
              )}
              <label className="admin-btn" style={{ cursor: "pointer" }}>
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  style={{ display: "none" }}
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleHeroImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroImageDraft && (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => setHeroImageDraft("")}
                >
                  Reset to default
                </button>
              )}
            </div>
            <input
              className="admin-input"
              style={{ marginTop: 10 }}
              value={heroImageDraft}
              onChange={(e) => setHeroImageDraft(e.target.value)}
              placeholder="…or paste an image URL (/uploads/hero.webp or https://…)"
            />
            <p className="admin-hint">
              Leave empty to hide the hero image completely — only your uploaded
              image is shown. A wide image (roughly 4:3 ratio) looks best.
            </p>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-primary" onClick={saveBranding} disabled={saving}>
              <Save size={14} /> {saving ? "Saving…" : "Save branding"}
            </button>
          </div>
        </div>
      </div>
    );
  }
/* ---------------- Render: Legal pages ---------------- */

  function renderLegal(
    key: "privacy" | "terms",
    title: string,
    draft: { title: string; content: string },
    setDraft: (d: { title: string; content: string }) => void
  ) {
    return (
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>{title}</h2>
        </div>
        <div className="admin-form">
          <div className="admin-field">
            <label>Page title</label>
            <input
              className="admin-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Content</label>
            <MarkdownEditor
              value={draft.content}
              onChange={(v) => setDraft({ ...draft, content: v })}
              rows={16}
              placeholder="Write the page content here…"
            />
          </div>
          <div className="admin-form-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => saveLegal(key)}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }
/* ---------------- Main return ---------------- */

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-logo">
          <Image src="/icon.png" alt="One Way Nepal" width={34} height={34} />
          <div>
            Admin <span>· One Way Nepal</span>
          </div>
        </div>
        <div className="admin-header-right">
          {backend === "mysql" ? (
            <span className="admin-backend admin-backend-mysql">
              ● MySQL
            </span>
          ) : (
            <span className="admin-backend admin-backend-json" title="No DATABASE_* env vars set — using src/data/content.json">
              ● Local JSON
            </span>
          )}
          <Link className="admin-btn" href="/">
            View site
          </Link>
          <button className="admin-btn admin-btn-danger" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="admin-view">
        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`admin-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {status && (
          <div className={`admin-status ${status.kind}`} role="status">
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Loading content…</div>
        ) : (
          <>
            {tab === "blogs" && renderBlogList()}
            {tab === "privacy" &&
              renderLegal("privacy", "Privacy Policy", privacyDraft, setPrivacyDraft)}
            {tab === "terms" &&
              renderLegal("terms", "Terms & Conditions", termsDraft, setTermsDraft)}
            {tab === "careers" && renderCareerList()}
            {tab === "testimonials" && renderTestimonialList()}
            {tab === "faqs" && renderFaqList()}
            {tab === "intro" && renderIntro()}
            {tab === "services" && renderServices()}
            {tab === "work" && renderWork()}
            {tab === "pricing" && renderPricing()}
            {tab === "branding" && renderBranding()}
          </>
        )}
      </div>
    </div>
  );
}