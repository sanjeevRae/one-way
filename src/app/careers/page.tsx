import type { Metadata } from "next";
import ContentShell from "@/components/ContentShell";
import { renderRich } from "@/components/ContentRenderer";
import { getContentStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Careers | One Way Nepal",
  description: "Join the One Way Nepal team — branding, design, development and AI.",
};

export default async function CareersPage() {
  const { careers } = await getContentStore();

  return (
    <ContentShell>
      <section className="page-hero">
        <span className="page-kicker">Join the team</span>
        <h1>Careers</h1>
        <p>We build brands, products and intelligence. Come build with us.</p>
      </section>

      {careers.length === 0 ? (
        <p className="empty-state">
          No open positions right now. Drop us a line at{" "}
          <a href="mailto:info@onewaynepal.com">info@onewaynepal.com</a> for
          future opportunities.
        </p>
      ) : (
        <div className="careers-list">
          {careers.map((job) => {
            const { html } = renderRich(job.description);
            return (
              <article className="career-card" key={job.id}>
                <div className="career-card-head">
                  <div>
                    <h2>{job.title}</h2>
                    <div className="career-meta">
                      <span>{job.type}</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <a
                    className="career-apply"
                    href={`mailto:info@onewaynepal.com?subject=${encodeURIComponent(
                      `Application — ${job.title}`
                    )}`}
                  >
                    Apply
                  </a>
                </div>
                <div
                  className="career-description prose-blocks"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </article>
            );
          })}
        </div>
      )}
    </ContentShell>
  );
}