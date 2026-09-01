import type { Metadata } from "next";
import ContentShell from "@/components/ContentShell";
import { renderRich } from "@/components/ContentRenderer";
import SmoothToc from "@/components/SmoothToc";
import { getContentStore } from "@/lib/db";

// Server-render per request so admin edits in MySQL show live (CMS behavior).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions | One Way Nepal",
};

export default async function TermsPage() {
  const { terms } = await getContentStore();
  const { toc, html } = renderRich(terms.content);

  return (
    <ContentShell>
      <div className="legal-layout">
        <aside className="legal-toc">
          <SmoothToc items={toc} title="Contents" />
        </aside>
        <article className="legal-page">
          <h1>{terms.title || "Terms & Conditions"}</h1>
          <p className="legal-updated">Last updated: January 2026</p>
          <div
            className="prose-blocks"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </ContentShell>
  );
}