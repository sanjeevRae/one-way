"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { BlogPost, Career, SiteContent } from "@/lib/content";

type Tab = "blogs" | "privacy" | "terms" | "careers";
type Status = { kind: "success" | "error"; message: string } | null;

const EMPTY_CONTENT: SiteContent = {
  blogs: [],
  privacyPolicy: { title: "Privacy Policy", content: "" },
  terms: { title: "Terms & Conditions", content: "" },
  careers: [],
};

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "blogs", label: "Blogs" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
  { key: "careers", label: "Careers" },
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

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("blogs");
  const [content, setContent] = useState<SiteContent>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [backend, setBackend] = useState<"mysql" | "json">("json");

  const [draftBlog, setDraftBlog] = useState<BlogPost | null>(null);
  const [draftCareer, setDraftCareer] = useState<Career | null>(null);
  const [privacyDraft, setPrivacyDraft] = useState({ title: "", content: "" });
  const [termsDraft, setTermsDraft] = useState({ title: "", content: "" });

  useEffect(() => {
    let active = true;
    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.json() as Promise<SiteContent>;
      })
      .then((data) => {
        if (!active) return;
        const d = data as SiteContent & { _backend?: { backend: "mysql" | "json" } };
        const { _backend, ...clean } = d;
        setContent(clean);
        if (_backend) setBackend(_backend.backend);
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
      const res = await fetch("/api/content", {
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
          <a className="admin-btn" href="/">
            View site
          </a>
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
          </>
        )}
      </div>
    </div>
  );
}