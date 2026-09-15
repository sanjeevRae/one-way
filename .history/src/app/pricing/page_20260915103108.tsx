import type { Metadata } from "next";
import Image from "next/image";
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
  let pricingHero = "";
  let pricingNoteHeading = "Every project includes";
  let pricingNoteText =
    "A clear timeline before we start, honest communication throughout, and a handover you fully own — code, assets and accounts. Prices above are starting points in NPR and are confirmed after a short discovery call.";
  let pricingNoteContact = "info@onewaynepal.com";

  try {
    const store = await getContentStore();
    if (store.pricingPackages.length > 0) {
      pricingPackages = store.pricingPackages;
    }
    if (store.pricingHero) pricingHero = store.pricingHero;
    if (store.pricingNoteHeading) pricingNoteHeading = store.pricingNoteHeading;
    if (store.pricingNoteText) pricingNoteText = store.pricingNoteText;
    if (store.pricingNoteContact) pricingNoteContact = store.pricingNoteContact;
  } catch (error) {
    console.warn("[pricing] content store unavailable, using defaults:", error);
  }

  return (
    <ContentShell showNav>
      {pricingHero && (
        <div className="pricing-hero">
          <Image
            src={pricingHero}
            alt="Pricing banner"
            width={1920}
            height={720}
            priority
            unoptimized
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}

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
        <h2>{pricingNoteHeading}</h2>
        <p>{pricingNoteText}</p>
        <p>
          Have something different in mind?{" "}
          <a href={`mailto:${pricingNoteContact}`}>{pricingNoteContact}</a>
        </p>
      </section>
    </ContentShell>
  );
}