import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentShell from "@/components/ContentShell";
import { renderRich } from "@/components/ContentRenderer";
import SmoothToc from "@/components/SmoothToc";
import { getContentStore } from "@/lib/db";
import { formatDate } from "@/lib/format";

// Server-render per request so admin edits in MySQL show live (CMS behavior).
export const dynamic = "force-dynamic";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentStore();
  const blog = content.blogs.find((b) => b.slug === slug);
  return {
    title: blog ? `${blog.title} | One Way Nepal` : "Blog | One Way Nepal",
    description: blog?.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const content = await getContentStore();
  const blog = content.blogs.find((b) => b.slug === slug);

  if (!blog) notFound();

  const { toc, html } = renderRich(blog.content);

  return (
    <ContentShell>
      <article className="article-page">
        <time dateTime={blog.date}>{formatDate(blog.date)}</time>
        <h1>{blog.title}</h1>
        {blog.excerpt && <p className="article-excerpt">{blog.excerpt}</p>}
        {blog.image && (
          <div className="article-image">
            <img src={blog.image} alt={blog.title} loading="lazy" />
          </div>
        )}
        <div className="article-with-toc">
          <aside className="article-toc-side">
            <SmoothToc items={toc} title="In this article" />
          </aside>
          <div
            className="prose-blocks"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </article>
    </ContentShell>
  );
}