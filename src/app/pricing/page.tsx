import type { Metadata } from "next";
import ContentShell from "@/components/ContentShell";
import PricingSelector from "@/components/PricingSelector";
import { getContentStore } from "@/lib/db";
import { DEFAULT_PRICING_PACKAGES } from "@/lib/pricing";

// Server-render per request so admin edits in MySQL show live (CMS behavior).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing | One Way Nepal",
  description:
    "Compare website, NGO, travel, e-commerce, SEO and hosting packages from One Way Nepal.",
};

export default async function PricingPage() {
  let pricingPackages = DEFAULT_PRICING_PACKAGES;
  try {
    const store = await getContentStore();
    if (store.pricingPackages.length > 0) {
      pricingPackages = store.pricingPackages;
    }
  } catch (error) {
    console.warn("[pricing] content store unavailable, using defaults:", error);
  }

  return (
    <ContentShell>
      <section className="page-hero">
        <span className="page-kicker">Pricing</span>
        <h1>Compare our packages</h1>
        <p>
          Select a package on the left to see its Economic, Budget and Standard
          plans side by side.
        </p>
      </section>

      <PricingSelector packages={pricingPackages} />

      <section className="pricing-note">
        <h2>Every project includes</h2>
        <p>
          A clear timeline before we start, honest communication throughout, and a
          handover you fully own — code, assets and accounts. Prices above are
          starting points in NPR and are confirmed after a short discovery call.
        </p>
        <p>
          Have something different in mind?{" "}
          <a href="mailto:info@onewaynepal.com">info@onewaynepal.com</a>
        </p>
      </section>
    </ContentShell>
  );
}