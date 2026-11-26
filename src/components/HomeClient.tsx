"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ContactSlideOver from "@/components/ContactSlideOver";
import type { IntroStat } from "@/lib/intro";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  ChevronDown,
  X,
  CircleDollarSign,
  Gem,
  Grid2X2,
  Headphones,
  Lightbulb,
  Mail,
  Menu,
  Pen,
  Plus,
  Phone,
  Code2,
  Smartphone,
  Search,
  Palette,
  Bot,
  Megaphone,
  PenTool,
  UsersRound,
  Globe,
  Cloud,
  Database,
  LineChart,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ServiceItem, WorkItem } from "@/lib/sections";
import {
  DEFAULT_SERVICES_HEADING,
  DEFAULT_SERVICES_KICKER,
  DEFAULT_SERVICES_MORE,
  DEFAULT_WORK_HEADING,
  DEFAULT_WORK_SUBTEXT,
  SERVICE_ICONS,
} from "@/lib/sections";
import type { SiteContent } from "@/lib/content";
import {
  DEFAULT_CONTACT_ADDRESS,
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_CONTACT_PHONE,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SOCIAL_VISIBILITY,
  safeSocialUrl,
} from "@/lib/site";

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Smartphone,
  Bot,
  PenTool,
  Palette,
  Gem,
  Megaphone,
  Globe,
  Cloud,
  Database,
  LineChart,
  ShieldCheck,
  Search,
  UsersRound,
};

const processSteps = [
  {
    title: "Discover",
    text: "We understand your business, goals, audience, and what you need to achieve.",
    image: "/discove.png",
  },
  {
    title: "Design",
    text: "We create clean, intuitive designs and refine them with your feedback.",
    image: "/designn.png",
  },
  {
    title: "Build",
    text: "We develop your solution with modern technology, testing, and regular updates.",
    image: "/buildd.png",
  },
  {
    title: "Launch & Support",
    text: "We launch your product and provide ongoing support to keep everything running smoothly.",
    image: "/lunch&supportt.png",
  },
];

function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let startTime = 0;
    const duration = 1500;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function HomeClient({ initialContent }: { initialContent: SiteContent }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workFilter, setWorkFilter] = useState("All");

  // All content arrives server-rendered via initialContent (see
  // src/app/page.tsx). The four CMS lists are used exactly as stored in the
  // database - there is no hardcoded fallback content anymore.
  const testimonials = (
    Array.isArray(initialContent.testimonials) ? initialContent.testimonials : []
  ).map((t, i) => ({
    id: String(t.id ?? i),
    quote: String(t.quote ?? ""),
    name: String(t.name ?? ""),
    role: String(t.role ?? ""),
    image: String(t.image ?? ""),
  }));
  const heroLogo = initialContent.heroLogo?.trim()
    ? initialContent.heroLogo
    : "/logo-transparent.png";
  const heroImage = initialContent.heroImage ?? "";
  const introKicker = initialContent.introKicker ?? "";
  const introHeading = initialContent.introHeading ?? "";
  const introStats: IntroStat[] = (
    Array.isArray(initialContent.introStats) ? initialContent.introStats : []
  ).map((s, i) => ({
    id: String(s.id ?? i),
    value: Number(s.value) || 0,
    label: String(s.label ?? ""),
  }));
  const servicesKicker = initialContent.servicesKicker?.trim()
    ? initialContent.servicesKicker
    : DEFAULT_SERVICES_KICKER;
  const servicesHeading = initialContent.servicesHeading?.trim()
    ? initialContent.servicesHeading
    : DEFAULT_SERVICES_HEADING;
  const servicesMore = Number.isFinite(Number(initialContent.servicesMore))
    ? Number(initialContent.servicesMore)
    : DEFAULT_SERVICES_MORE;
  const services: ServiceItem[] = (
    Array.isArray(initialContent.services) ? initialContent.services : []
  ).map((s, i) => ({
    id: String(s.id ?? i),
    label: String(s.label ?? ""),
    icon: String(s.icon ?? "Code2"),
  }));
  const workHeading = initialContent.workHeading?.trim()
    ? initialContent.workHeading
    : DEFAULT_WORK_HEADING;
  const workSubtext = initialContent.workSubtext?.trim()
    ? initialContent.workSubtext
    : DEFAULT_WORK_SUBTEXT;
  const works: WorkItem[] = (
    Array.isArray(initialContent.works) ? initialContent.works : []
  ).map((w, i) => ({
    id: String(w.id ?? i),
    title: String(w.title ?? ""),
    text: String(w.text ?? ""),
    image: String(w.image ?? ""),
    tags: Array.isArray(w.tags) ? w.tags.map(String) : [],
  }));
  const faqs = (Array.isArray(initialContent.faqs) ? initialContent.faqs : []).map(
    (f, i) => ({
      id: String(f.id ?? i),
      question: String(f.question ?? ""),
      answer: String(f.answer ?? ""),
    })
  );

  // Section visibility (admin toggles) + footer contact/socials. Stored ""
  // means unset: the footer falls back to the built-in defaults below.
  const visibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(initialContent.sectionVisibility ?? {}),
  };
  const socialVisibility = {
    ...DEFAULT_SOCIAL_VISIBILITY,
    ...(initialContent.socialVisibility ?? {}),
  };
  const showIntro =
    visibility.intro &&
    (introKicker.trim() !== "" || introHeading.trim() !== "" || introStats.length > 0);
  const showServices = visibility.services && services.length > 0;
  const showWork = visibility.work && works.length > 0;
  const showProcess = visibility.process;
  const showTestimonials = visibility.testimonials && testimonials.length > 0;
  const showFaqs = visibility.faqs && faqs.length > 0;
  const contactAddress = initialContent.contactAddress?.trim() || DEFAULT_CONTACT_ADDRESS;
  const contactPhone = initialContent.contactPhone?.trim() || DEFAULT_CONTACT_PHONE;
  const contactEmail = initialContent.contactEmail?.trim() || DEFAULT_CONTACT_EMAIL;
  const telHref = contactPhone.replace(/[^+\d]/g, "");
  const socialFacebook = safeSocialUrl(initialContent.socialFacebook);
  const socialInstagram = safeSocialUrl(initialContent.socialInstagram);
  const socialTiktok = safeSocialUrl(initialContent.socialTiktok);
  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 7);
  const workCategories = ["All", ...Array.from(new Set(works.flatMap((w) => w.tags)))];
  const filteredWorks =
    workFilter === "All" ? works : works.filter((w) => w.tags.includes(workFilter));

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    document.documentElement.classList.add("page-ready");

    revealItems.forEach((item) => {
      const section = item.closest("section, footer");
      const siblings = section
        ? Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"))
        : Array.from(revealItems);
      const localIndex = Math.max(siblings.indexOf(item), 0);
      const delay = item.style.getPropertyValue("--reveal-delay")
        ? item.style.getPropertyValue("--reveal-delay")
        : `${Math.min(localIndex * 70, 420)}ms`;

      item.style.setProperty("--reveal-delay", delay);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [workFilter, works, services, introStats, testimonials, faqs]);

  return (
    <main>
      <section className="hero" data-reveal="up" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
        <nav className="nav" data-reveal="up" style={{ "--reveal-delay": "520ms" } as React.CSSProperties}>
          <a className="brand" href="#">
            <Image
              src={heroLogo}
              alt="One Way Nepal"
              width={132}
              height={44}
              priority
              unoptimized
            />
            One Way Nepal
          </a>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <Link href="/pricing">Pricing</Link>
          </div>
          <button className="pill" onClick={() => setContactOpen(true)}>Contact</button>
          <button
            className="icon-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <button
              className="mobile-menu-contact"
              onClick={() => {
                setMenuOpen(false);
                setContactOpen(true);
              }}
            >
              Contact
            </button>
          </div>
        )}

        <div className="hero-copy">
          <h1 data-reveal="up" style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
            Modern technology 
            <span>applied to your </span>
            <span>daily life</span>
          </h1>
          <p data-reveal="up" style={{ "--reveal-delay": "340ms" } as React.CSSProperties}>
            We believe every new technology should amplify human creativity and expand knowledge. At One Way, we aim to bridge the gap between the complexities of technology and the practical challenges of everyday work.
          </p>
        </div>

        {heroImage && (
          <div className="building" aria-hidden="true" data-reveal="up" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              unoptimized
              sizes="(max-width: 820px) 95vw, 62vw"
            />
          </div>
        )}

        <div className="search-panel" data-reveal="up" style={{ "--reveal-delay": "640ms" } as React.CSSProperties}>
          <div>
            <Building2 size={16} />
            <span>One Way Technology</span>
          </div>
          <div>
            <MapPin size={16} />
            <span>Tikhedebal Marg, Lalitpur</span>
          </div>
          <div>
            <Phone size={16} />
            <span>+977-9828626238</span>
          </div>
          <div>
            <BriefcaseBusiness size={16} />
            <span>IT Solutions & Digital Services</span>
          </div>
          <a
            href="https://api.whatsapp.com/send/?phone=9779828626238&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="search-panel-cta"
          >
            Get in Touch
          </a>
        </div>
      </section>

      {showIntro && (
      <section className="intro" id="about">
        {introKicker ? <p data-reveal="left">{introKicker}</p> : null}
        <div className="intro-content" data-reveal="right">
          {introHeading ? <h2 data-reveal="up">{introHeading}</h2> : null}
          {introStats.length > 0 ? (
            <div className="stats" data-reveal="up">
              {introStats.map((stat) => (
                <div data-reveal key={stat.id}>
                  <strong>
                    <CountUp value={stat.value} />
                  </strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      )}

      {showServices && (
      <section className="services" id="services">
        <p data-reveal="up">{servicesKicker}</p>
        <h2 data-reveal="up">{servicesHeading}</h2>
        <div className="service-bg" aria-hidden="true" />
        <div className="service-grid">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] ?? Code2;
            return (
              <article key={service.id} data-reveal>
                <span className="service-icon">
                  <Icon size={28} strokeWidth={2.4} />
                </span>
                <h3>{service.label}</h3>
              </article>
            );
          })}
          {servicesMore > 0 && (
            <article className="service-more" data-reveal>
              <strong>+{servicesMore}</strong>
              <h3>More</h3>
            </article>
          )}
        </div>
      </section>
      )}

      {showWork && (
      <section className="work" id="work">
        <div className="work-head" data-reveal="left">
          <h2 data-reveal="up">{workHeading}</h2>
          <p data-reveal="up">{workSubtext}</p>
        </div>
        <div className="work-filters" data-reveal="up">
          {workCategories.map((cat) => (
            <button
              key={cat}
              className={`work-filter${workFilter === cat ? " active" : ""}`}
              onClick={() => setWorkFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="work-gallery">
          {filteredWorks.map((work) => (
            <article className="work-card" key={work.title} data-reveal="up">
              {work.image ? (
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  sizes="(max-width: 820px) 100vw, 33vw"
                  className="work-card-img"
                  priority={workFilter === "All" && work === filteredWorks[0]}
                />
              ) : null}
              <div className="work-card-overlay">
                <span className="work-card-badge">{work.tags[0]}</span>
                <div className="work-card-info">
                  <h3>{work.title}</h3>
                  <p>{work.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      <section className="cta-band" id="contact">
        <div data-reveal="left">
          <h2 data-reveal="up">
            Ready to build something great <span>together today?</span>
          </h2>
          <div className="cta-actions" data-reveal="up">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setContactOpen(true);
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
        <div className="crm-art" data-reveal="zoom">
          <Image src="/crm.png" alt="CRM abstract line illustration" fill sizes="50vw" />
        </div>
      </section>

      <ContactSlideOver open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* <section className="revenue">
        <div className="revenue-title" data-reveal="left">
          <h2 data-reveal="up">
            <span>Move</span>
            <span>
              <span className="revenue-image">
                <Image
                  src="/moveforward.png"
                  alt="Revenue dashboard preview"
                  fill
                  sizes="190px"
                />
              </span>
              Forward
            </span>
          </h2>
        </div>
        <div className="revenue-stats" data-reveal="right">
          <article data-reveal="up">
            <strong>
              <CountUp value={100} suffix="+" />
            </strong>
            <p>
              Digital solutions delivered across
              <span> web, app & AI</span>
            </p>
          </article>
          <article data-reveal="up">
            <strong>
              <CountUp value={1} suffix="K +" />
            </strong>
            <p>
              Conversations powered by
              <span>chatbots</span>
            </p>
          </article>
          <article data-reveal="up">
            <strong>
              <CountUp value={99} suffix="%" />
            </strong>
            <p>
              Client satisfaction through reliable 
              <span>digital solutions</span>
            </p>
          </article>
        </div>
      </section> */}

      {showProcess && (
      <section className="process">
        <div className="process-head">
          <h2 data-reveal="left">How We Work</h2>
          <div data-reveal="right">
            <p data-reveal="up">
              We keep things simple, transparent, and focused, turning complex ideas
               into digital solutions that are practical, purposeful, and built for 
               real business needs.
            </p>
            <a href="#" data-reveal="up">Learn more</a>
          </div>
        </div>
        {processSteps.map((step, index) => (
            <article className="process-row" key={step.title} data-reveal="up">
              <div data-reveal="up">
                <span>Step {index + 1}</span>
                <h3>
                  <span className="process-title">{step.title}</span>
                  <ArrowUpRight size={44} strokeWidth={1.8} />
                </h3>
                <p>{step.text}</p>
              </div>
              <div className="process-art" data-reveal="up">
                <Image
                  src={step.image}
                  alt={`${step.title} process preview`}
                  fill
                  sizes="(max-width: 820px) 100vw, 760px"
                />
              </div>
            </article>
          ))}
      </section>
      )}

      {showTestimonials && (
      <section className="testimonials">
        <div className="testimonial-head" data-reveal="up">
          <span>Client Reviews</span>
          <h2>What Our Clients Say?</h2>
        </div>
        <div className="quote-marquee marquee-forward" data-reveal="left">
          <div className="quote-track">
            {[...testimonials.slice(0, Math.ceil(testimonials.length / 2)), ...testimonials.slice(0, Math.ceil(testimonials.length / 2))].map(
              (item, index) => (
                <article key={`top-${index}`}>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <div className="quote-author">
                    <span className="avatar">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={84}
                          height={84}
                          unoptimized
                        />
                      ) : (
                        <span className="avatar-initials" aria-hidden="true">
                          {(item.name || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.role}</small>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
        <div className="quote-marquee marquee-reverse" data-reveal="right">
          <div className="quote-track">
            {(() => {
              const bottom = testimonials.slice(Math.ceil(testimonials.length / 2));
              const items = bottom.length > 0 ? bottom : testimonials.slice(0, Math.ceil(testimonials.length / 2));
              return [...items, ...items].map(
              (item, index) => (
                <article key={`bottom-${index}`}>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <div className="quote-author">
                    <span className="avatar">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={84}
                          height={84}
                          unoptimized
                        />
                      ) : (
                        <span className="avatar-initials" aria-hidden="true">
                          {(item.name || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.role}</small>
                    </div>
                  </div>
                </article>
              )
              );
            })()}
          </div>
        </div>
      </section>
      )}

      {showFaqs && (
      <section className="faq">
        <span data-reveal="up">Support</span>
        <h2 data-reveal="up">Frequently Asked Questions</h2>
        <p data-reveal="up">
          Everything you need to know about One Way Nepal&apos;s digital
          services, project process, and business solutions.
        </p>
        <div className="faq-list" data-reveal="up">
          {visibleFaqs.map((faq, index) => (
            <article
              className={openFaq === index ? "faq-item open" : "faq-item"}
              key={faq.question}
            >
              <button
                aria-expanded={openFaq === index}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                {openFaq === index ? <X size={16} /> : <Plus size={16} />}
              </button>
              <div className="faq-answer" id={`faq-answer-${index}`}>
                <p>{faq.answer}</p>
              </div>
            </article>
          ))}
        </div>
        {!showAllFaqs && (
          <button className="load-more" onClick={() => setShowAllFaqs(true)}>
            Load more <ChevronDown size={14} />
          </button>
        )}
      </section>
      )}

      <footer>
        <div className="footer-brand" data-reveal="up">
          <div className="footer-brand-top">
            <Image
              src="/icon.png"
              alt="One Way Nepal"
              width={500}
              height={500}
            />
            <div className="footer-contact">
            <p>
              <MapPin size={15} />
              <span>{contactAddress}</span>
            </p>
            <p>
              <Phone size={15} />
              <a href={`tel:${telHref}`}>{contactPhone}</a>
            </p>
            <p>
              <Mail size={15} />
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          </div>

            <div className="footer-social-wrap">
              <h3 className="footer-social-title">Stay in touch</h3>
              <div className="footer-socials">
                {socialVisibility.facebook && (
                  <a href={socialFacebook} aria-label="Facebook" {...(socialFacebook !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <Image
                      src="https://s.magecdn.com/social/mw-facebook.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                  </a>
                )}
                {socialVisibility.instagram && (
                  <a href={socialInstagram} aria-label="Instagram" {...(socialInstagram !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <Image
                      src="https://s.magecdn.com/social/mw-instagram.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                  </a>
                )}
                {socialVisibility.tiktok && (
                  <a href={socialTiktok} aria-label="TikTok" {...(socialTiktok !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <Image
                      src="https://s.magecdn.com/social/mw-tiktok.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
          
        </div>
        <div data-reveal="up">
          <h3>Product</h3>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/#services`}>Features</a>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/#contact`}>Pricing</a>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/#work`}>Projects</a>
        </div>
        <div data-reveal="up">
          <h3>Company</h3>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/#about`}>About</a>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/#work`}>Work</a>
          <Link href="/careers">Careers</Link>
        </div>
        <div data-reveal="up">
          <h3>Resources</h3>
          <Link href="/blogs">Blogs</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} OneWayNepal. All rights reserved.</p>
          
        </div>
      </footer>
    </main>
  );
}
