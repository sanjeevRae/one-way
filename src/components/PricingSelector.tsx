"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { PricingPackage, PricingFeature } from "@/lib/pricing";

interface PricingSelectorProps {
  packages: PricingPackage[];
}

function FeatureValue({ value }: { value: string }) {
  const v = value.trim();
  if (v === "✅") {
    return (
      <span className="pricing-yes" aria-label="Included">
        <Check size={16} strokeWidth={3} />
      </span>
    );
  }
  if (v === "❌") {
    return (
      <span className="pricing-no" aria-label="Not included">
        <X size={16} strokeWidth={3} />
      </span>
    );
  }
  return <span className="pricing-value-text">{v || "—"}</span>;
}

export default function PricingSelector({ packages }: PricingSelectorProps) {
  const [activeId, setActiveId] = useState(packages[0]?.id ?? "");
  const active = packages.find((p) => p.id === activeId) ?? packages[0];

  if (!active) {
    return <p className="empty-state">No pricing packages configured yet.</p>;
  }

  return (
    <div className="pricing-selector">
      {/* Left sidebar — package selector */}
      <aside className="pricing-sidebar" role="tablist" aria-label="Package selector">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            role="tab"
            aria-selected={pkg.id === active.id}
            className={`pricing-package-btn${pkg.id === active.id ? " active" : ""}`}
            onClick={() => setActiveId(pkg.id)}
          >
            {pkg.name}
          </button>
        ))}
      </aside>

      {/* Right — dynamic comparison table (replaces content, no page reload) */}
      <div className="pricing-compare" key={active.id}>
        {active.plans.map((plan) => (
          <article className="pricing-plan" key={plan.name}>
            <h3>{plan.name}</h3>
            <div className="pricing-plan-price">{plan.price}</div>
            <ul className="pricing-plan-features">
              {plan.features.map((feature: PricingFeature) => (
                <li key={feature.label}>
                  <span className="pricing-feature-label">{feature.label}</span>
                  <span className="pricing-feature-value">
                    <FeatureValue value={feature.value} />
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}