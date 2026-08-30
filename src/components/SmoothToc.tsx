"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/components/ContentRenderer";

interface SmoothTocProps {
  items: TocEntry[];
  /** Optional heading label above the TOC. */
  title?: string;
}

/**
 * Client-side Table of Contents with smooth scrolling + scroll-spy.
 *
 * - Clicking a link smooth-scrolls to the matching heading (respecting the
 *   sticky topbar via CSS `scroll-margin`).
 * - While scrolling, the currently visible section is highlighted.
 * - If no headings exist, renders nothing.
 */
export default function SmoothToc({ items, title = "On this page" }: SmoothTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the heading closest to the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const current = visible[0];
        if (current) setActiveId(current.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="smooth-toc">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`toc-level-${item.level}`}>
            <a
              href={`#${item.id}`}
              className={activeId === item.id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (target) {
                  const offset = 96; // space below sticky topbar
                  const top =
                    target.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top, behavior: "smooth" });
                  history.replaceState(null, "", `#${item.id}`);
                }
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}