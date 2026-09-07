export interface PricingFeature {
  label: string;
  value: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: PricingFeature[];
}

export interface PricingPackage {
  id: string;
  name: string;
  plans: PricingPlan[];
}

const FEATURE_LABELS = [
  "Website design",
  "Website Pages",
  "Responsive",
  "CMS",
  "Web form",
  "Logo design",
  "Domain",
  "Hosting",
  "Social media",
  "Image and video gallery",
  "Chat integration",
  "Newsletter",
  "Database",
  "Payment Gateway",
  "Google Analytics",
  "Blog design",
];

function plan(
  name: string,
  price: string,
  values: string[]
): PricingPlan {
  return {
    name,
    price,
    features: FEATURE_LABELS.map((label, i) => ({ label, value: values[i] ?? "" })),
  };
}

/* values order: design, pages, responsive, cms, form, logo, domain, hosting,
   social, gallery, chat, newsletter, database, payment, analytics, blog */
export const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  {
    id: "p-startup",
    name: "SPECIAL OFFER - STARTUP",
    plans: [
      plan("ECONOMIC", "Rs. 20,000", ["Choose from our designs", "5", "✅", "✅", "1", "❌", "✅", "1 GB", "✅", "✅", "❌", "❌", "❌", "❌", "✅", "❌"]),
      plan("BUDGET", "Rs. 35,000", ["Bespoke design", "10", "✅", "✅", "2", "✅", "✅", "2 GB", "✅", "✅", "✅", "✅", "❌", "❌", "✅", "✅"]),
      plan("STANDARD", "Rs. 50,000", ["Bespoke design", "15", "✅", "✅", "Unlimited", "✅", "✅", "3 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
    ],
  },
  {
    id: "p-business",
    name: "BUSINESS PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 40,000", ["Choose from our designs", "20", "❌", "✅", "1", "❌", "✅", "2 GB", "✅", "✅", "❌", "❌", "❌", "❌", "✅", "❌"]),
      plan("BUDGET", "Rs. 70,000", ["Bespoke design", "Unlimited", "✅", "✅", "2", "✅", "✅", "4 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
      plan("STANDARD", "Rs. 100,000", ["Bespoke design", "Unlimited", "✅", "✅", "Unlimited", "✅", "✅", "5 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
    ],
  },
  {
    id: "p-ngo",
    name: "NGO/INGO PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 30,000", ["Choose from our designs", "8", "✅", "✅", "1", "✅", "✅", "2 GB", "✅", "✅", "❌", "✅", "❌", "❌", "✅", "❌"]),
      plan("BUDGET", "Rs. 55,000", ["Bespoke design", "Unlimited", "✅", "✅", "3", "✅", "✅", "4 GB", "✅", "✅", "✅", "✅", "✅", "❌", "✅", "✅"]),
      plan("STANDARD", "Rs. 80,000", ["Bespoke design", "Unlimited", "✅", "✅", "Unlimited", "✅", "✅", "5 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
    ],
  },
  {
    id: "p-travel",
    name: "TRAVEL/TREKKING PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 35,000", ["Choose from our designs", "8", "✅", "✅", "1", "✅", "✅", "2 GB", "✅", "✅", "❌", "✅", "❌", "❌", "✅", "❌"]),
      plan("BUDGET", "Rs. 65,000", ["Bespoke design", "Unlimited", "✅", "✅", "Booking form", "✅", "✅", "5 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
      plan("STANDARD", "Rs. 90,000", ["Bespoke design", "Unlimited", "✅", "✅", "Unlimited", "✅", "✅", "8 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
    ],
  },
  {
    id: "p-ecommerce",
    name: "E-COMMERCE PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 80,000", ["Choose from our designs", "Unlimited products", "✅", "✅", "2", "✅", "✅", "5 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "❌"]),
      plan("BUDGET", "Rs. 130,000", ["Bespoke design", "Unlimited products", "✅", "✅", "Unlimited", "✅", "✅", "10 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
      plan("STANDARD", "Rs. 190,000", ["Bespoke design", "Unlimited products", "✅", "✅", "Unlimited", "✅", "✅", "15 GB", "✅", "✅", "✅", "✅", "✅", "✅", "✅", "✅"]),
    ],
  },
  {
    id: "p-seo",
    name: "SEO PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 12,000/mo", ["Audit report", "—", "—", "—", "—", "—", "—", "—", "✅", "—", "❌", "✅", "—", "—", "✅", "—"]),
      plan("BUDGET", "Rs. 22,000/mo", ["Audit + on-page SEO", "—", "—", "—", "—", "—", "—", "—", "✅", "—", "✅", "✅", "—", "—", "✅", "✅"]),
      plan("STANDARD", "Rs. 35,000/mo", ["Full SEO management", "—", "—", "—", "—", "—", "—", "—", "✅", "—", "✅", "✅", "—", "—", "✅", "✅"]),
    ],
  },
  {
    id: "p-hosting",
    name: "HOSTING PACKAGE",
    plans: [
      plan("ECONOMIC", "Rs. 4,000/yr", ["—", "—", "—", "—", "—", "—", "✅", "2 GB", "—", "—", "—", "—", "—", "—", "—", "—"]),
      plan("BUDGET", "Rs. 8,000/yr", ["—", "—", "—", "—", "—", "—", "✅", "5 GB", "—", "—", "—", "✅", "✅", "—", "—", "—"]),
      plan("STANDARD", "Rs. 15,000/yr", ["—", "—", "—", "—", "—", "—", "✅", "10 GB", "—", "—", "✅", "✅", "✅", "✅", "—", "—"]),
    ],
  },
];