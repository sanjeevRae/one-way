import type { Metadata } from "next";
import Link from "next/link";
import ContentShell from "@/components/ContentShell";
import { getContentStore } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blogs | One Way Nepal",
  description: "Ideas on design, development and AI from the One Way Nepal team.",
};

export default async function BlogsPage() {
  const content = await getContentStore();

  return (
    <ContentShell>
      <section className="page-hero">
        <span className="page-kicker">Insights</span>
        <h1>Blogs</h1>
        <p>Ideas on design, development and artificial intelligence from the One Way Nepal team.</p>
      </section>

      {content.blogs.length === 0 ? (
        <p className="empty-state">No blog posts yet. Check back soon.</p>
      ) : (
        <div className="blog-grid">
          {content.blogs.map((blog) => (
            <article className="blog-card" key={blog.id}>
              <time dateTime={blog.date}>{formatDate(blog.date)}</time>
              <h2>
                <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
              </h2>
              <p>{blog.excerpt}</p>
              <Link href={`/blogs/${blog.slug}`} className="blog-read">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </ContentShell>
  );
}