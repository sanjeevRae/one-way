"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";

const services: Array<[string, LucideIcon]> = 
[
  ["Web Development", Code2],
  ["Mobile App Development", Smartphone],
  ["AI Solutions", Bot],
  ["UI/UX Design", PenTool],
  ["Graphic Design", Palette],
  ["Branding", Gem],
  ["Digital Analytics", Megaphone],
  
];

const works = [
  {
    title: "Branding Design",
    text: "Create distinctive brand identities with thoughtful visuals, memorable direction, and a consistent look across every touchpoint.",
    image: "/brand.png",
    tags: ["Branding", "Strategy", "Creative"],
  },
  {
    title: "Application Design",
    text: "Design intuitive and engaging mobile experiences that combine clean interfaces, smooth interactions, and user-focused functionality.",
    image: "/app.png",
    tags: ["UI/UX", "Mobile", "Digital"],
  },
  {
    title: "AI-Powered Chatbots",
    text: "Build intelligent AI chatbots that answer questions, engage customers, capture leads, automate support, and deliver personalized experiences across your website, WhatsApp, and digital platforms.",
    image: "/ai.png",
    tags: ["AI", "Automation", "Support"],
  },
  {
    title: "Packaging Design",
    text: "Create eye-catching packaging that communicates your brand clearly while making your products stand out on the shelf and online.",
    image: "/pack.png",
    tags: ["Packaging", "Branding", "Creative"],
  },
  {
    title: "Website Design",
    text: "Build modern, responsive websites that combine strong visual design, intuitive experiences, and clear communication for your business.",
    image: "/web2.png",
    tags: ["Web", "Design", "Strategy"],
  },
];

const faqs = [
  {
    question: "What services does One Way Nepal provide?",
    answer:
      "We provide complete digital solutions, including website design and development, UI/UX design, mobile app design and development, graphic design, branding, and AI-powered chatbot solutions for businesses.",
  },
  {
    question: "Do you build custom websites?",
    answer:
      "Yes. We create modern, responsive websites tailored to your business goals, brand identity, and specific requirements.",
  },
  {
    question: "Do you provide AI chatbot solutions for businesses?",
    answer:
      "Yes. We build AI-powered chatbots that can answer customer questions, provide business information, generate leads, assist with customer support, and automate repetitive tasks.",
  },
  {
    question: "Can an AI chatbot be added to my existing website?",
    answer:
      "Yes. We can integrate an AI chatbot into your existing website without requiring you to rebuild the entire site.",
  },
  {
    question: "Can your AI chatbots answer questions about my business?",
    answer:
      "Yes. Chatbots can be configured with your business information, services, products, FAQs, documents, and other relevant content so they can provide useful, business-specific responses.",
  },
  {
    question: "Do you design websites as well as develop them?",
    answer:
      "Yes. We offer both UI/UX and website design as well as complete website development. We can take your project from initial concept and design through to a fully functional website.",
  },
  {
    question: "Do you develop mobile applications?",
    answer:
      "Yes. We design and develop modern mobile applications based on your business or product requirements.",
  },
  {
    question: "What graphic design services do you offer?",
    answer:
      "We provide graphic design for social media, marketing materials, promotional campaigns, business profiles, advertisements, and other digital and print materials.",
  },
  {
    question: "Can you help with branding?",
    answer:
      "Yes. We help businesses create a consistent and professional brand identity, including logo design, colors, typography, and other visual brand assets.",
  },
  {
    question: "How long does a project take?",
    answer:
      "The timeline depends on the project's scope, features, and complexity. After understanding your requirements, we'll provide an estimated timeline before starting.",
  },
  {
    question: "How much do your services cost?",
    answer:
      "Pricing depends on the type of service, project requirements, features, and complexity. Contact us with your requirements and we'll provide a suitable quotation.",
  },
  {
    question: "Do you work with businesses outside Lalitpur?",
    answer:
      "Yes. We work with businesses across Nepal and can collaborate remotely with clients from other locations.",
  },
  {
    question: "How can I get started with One Way Nepal?",
    answer:
      "Contact us with your idea or requirements. We'll understand your needs, recommend the right digital solution, and guide you through the next steps.",
  },
  {
    question: "Where is One Way Nepal located?",
    answer:
      "We are located at Area Chowk, Tikhedebal Marg, Lalitpur 44600, Nepal.",
  },
  {
    question: "How can I contact One Way Nepal?",
    answer:
      "Call us at +977-9828626238 to discuss your project, request a quotation, or learn more about our digital solutions.",
  },
];

const processSteps = [
  {
    title: "Discover",
    text: "We understand your business, goals, audience, and what you need to achieve.",
    image: "/discover.png",
  },
  {
    title: "Design",
    text: "We create clean, intuitive designs and refine them with your feedback.",
    image: "/design.png",
  },
  {
    title: "Build",
    text: "We develop your solution with modern technology, testing, and regular updates.",
    image: "/build.png",
  },
  {
    title: "Launch & Support",
    text: "We launch your product and provide ongoing support to keep everything running smoothly.",
    image: "/lunch&support.png",
  },
];

const testimonials = [
  {
    quote: "Love how you can take raw footage and turn it into a professional video with AI.",
    name: "Ram Sherpa",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "It makes video editing much, much easier.",
    name: "Kiran",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "Having spent years editing video, Capsule is absolutely mindblowing.",
    name: "xitiz shrestha",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "Would have saved a day in Adobe and looks better in less than half the time.",
    name: "Raj lama",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "Capsule checks all the boxes for creating engaging videos at scale.",
    name: "Shivam Shresthas",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "Capsule significantly improves the time it takes to create video.",
    name: "Bishnu Shrestha",
    role: "Founder of",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "There is Apple and then there's Capsule's UX and UI. This is world-class execution.",
    name: "Kiran Thapa",
    role: "Founder ",
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=160&q=80",
  },
  {
    quote: "Great job making this tech accessible!",
    name: "Eslin rai",
    role: "Founder",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
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

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 7);

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
  }, []);

  return (
    <main>
      <section className="hero" data-reveal="up" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
        <nav className="nav" data-reveal="up" style={{ "--reveal-delay": "520ms" } as React.CSSProperties}>
          <a className="brand" href="#">
            <Image
              src="/logo-transparent.png"
              alt="One Way Nepal"
              width={132}
              height={44}
              priority
            />
            One Way Nepal
          </a>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#contact">Pricing</a>
          </div>
          <button className="pill">Contact</button>
          <button className="icon-button" aria-label="Contact Us">
            <Menu size={18} />
          </button>
        </nav>

        <div className="hero-copy">
          <h1 data-reveal="up" style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
            Modern technology 
            <span>applied to your daily life</span>
          </h1>
          <p data-reveal="up" style={{ "--reveal-delay": "340ms" } as React.CSSProperties}>
            We believe every new technology should amplify human creativity and expand knowledge. At One Way, we aim to bridge the gap between the complexities of technology and the practical challenges of everyday work.
          </p>
        </div>

        <div className="building" aria-hidden="true" data-reveal="up" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
          <Image
            src="/building.avif"
            alt=""
            fill
            priority
            sizes="(max-width: 820px) 95vw, 62vw"
          />
        </div>

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
          <button>Get in Touch</button>
        </div>
      </section>

      <section className="intro" id="about">
        <p data-reveal="left">We are…</p>
        <div className="intro-content" data-reveal="right">
          <h2 data-reveal="up">
           A company with a simple conviction: technology 
           should bring order, not chaos. We believe
            that the digital spaces we build should be clean,
             purposeful, and intuitive, freeing you to focus 
             on what matters most-growing your business and
              serving your community.
          </h2>
          <div className="stats" data-reveal="up">
            <div data-reveal>
              <strong>
                <CountUp value={100}/>
              </strong>
              <span>Digital Ideas</span>
            </div>
             <div data-reveal>
              <strong>
                <CountUp value={6} />
              </strong>
              <span>Core Services</span>
            </div>
            <div data-reveal>
              <strong>
                <CountUp value={52} />
              </strong>
              <span>Solutions</span>
            </div>
            <div data-reveal>
              <strong>
                <CountUp value={14} />
              </strong>
              <span>Industries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <p data-reveal="up">Our Services</p>
        <h2 data-reveal="up">We aim to provide solutions for businesses worldwide.</h2>
        <div className="service-bg" aria-hidden="true" />
        <div className="service-grid">
          {services.map(([label, Icon]) => (
            <article key={label} data-reveal>
              <span className="service-icon">
                <Icon size={28} strokeWidth={2.4} />
              </span>
              <h3>{label}</h3>
            </article>
          ))}
          <article className="service-more" data-reveal>
            <strong>+4</strong>
            <h3>More</h3>
          </article>
        </div>
      </section>

      <section className="work" id="work">
        <div className="work-head" data-reveal="left">
          <h2 data-reveal="up">Selected work!</h2>
          <p data-reveal="up">
            We&apos;ve loved working with many fantastic companies, and are
            really proud of what we&apos;ve achieved together.
          </p>
        </div>
        {works.map((work, i) => {
          const copy = (
            <div className="work-copy" data-reveal="up">
              <h2 data-reveal="up">{work.title}</h2>
              <p data-reveal="up">{work.text}</p>
              <div className="tags" data-reveal="up">
                {work.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          );
          const media = (
            <div className="work-media" data-reveal="up">
              <Image src={work.image} alt={work.title} fill sizes="(max-width: 820px) 100vw, 52vw" />
              <button aria-label={`Open ${work.title}`}>
                <ArrowUpRight size={17} />
              </button>
            </div>
          );
          return (
            <article className="work-row" key={work.title} data-reveal="up">
              {i % 2 === 0 ? (
                <>
                  {copy}
                  {media}
                </>
              ) : (
                <>
                  {media}
                  {copy}
                </>
              )}
            </article>
          );
        })}
      </section>

      <section className="cta-band" id="contact">
        <div data-reveal="left">
          <h2 data-reveal="up">
            Ready to build something great <span>together today?</span>
          </h2>
          <div className="cta-actions" data-reveal="up">
            <a href="#">Contact Us</a>
          </div>
        </div>
        <div className="crm-art" data-reveal="zoom">
          <Image src="/crm.png" alt="CRM abstract line illustration" fill sizes="50vw" />
        </div>
      </section>

      <section className="revenue">
        <div className="revenue-title" data-reveal="left">
          <h2 data-reveal="up">
            <span>Move</span>
            <span>
              <span className="revenue-image">
                <Image
                  src="/driven reneview.png"
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
      </section>

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

      <section className="testimonials">
        <div className="testimonial-head" data-reveal="up">
          <span>Client Reviews</span>
          <h2>What Our Clients Say?</h2>
        </div>
        <div className="quote-marquee marquee-forward" data-reveal="left">
          <div className="quote-track">
            {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map(
              (item, index) => (
                <article key={`top-${index}`}>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <div className="quote-author">
                    <span className="avatar">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={84}
                        height={84}
                      />
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
            {[...testimonials.slice(4), ...testimonials.slice(4)].map(
              (item, index) => (
                <article key={`bottom-${index}`}>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <div className="quote-author">
                    <span className="avatar">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={84}
                        height={84}
                      />
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
      </section>

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
              <span>Tikhedebal Marg, Lalitpur</span>
            </p>
            <p>
              <Phone size={15} />
              <span>+977-9828626238</span>
            </p>
            <p>
              <Mail size={15} />
              <span>info@onewaynepal.com</span>
            </p>
          </div>

            <div className="footer-social-wrap">
              <h3 className="footer-social-title">Stay in touch</h3>
              <div className="footer-socials">
                <a href="#" aria-label="Facebook">
                  <Image
                    src="https://s.magecdn.com/social/mw-facebook.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </a>
                <a href="#" aria-label="Instagram">
                  <Image
                    src="https://s.magecdn.com/social/mw-instagram.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </a>
                <a href="#" aria-label="TikTok">
                  <Image
                    src="https://s.magecdn.com/social/mw-tiktok.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </a>
              </div>
            </div>
          </div>
          
        </div>
        <div data-reveal="up">
          <h3>Product</h3>
          <a>Features</a>
          <a>Pricing</a>
          <a>Projects</a>
        </div>
        <div data-reveal="up">
          <h3>Company</h3>
          <a>About</a>
          <a>Work</a>
          <a>Careers</a>
        </div>
        <div data-reveal="up">
          <h3>Resources</h3>
          <a>Blogs</a>
          <a>Privacy Policy</a>
          <a>Terms & Conditions</a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 OneWayNepal. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
