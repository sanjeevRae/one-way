"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import emailjs from "@emailjs/browser";
import { ArrowRight, X } from "lucide-react";

interface ContactSlideOverProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in "Contact us" panel.
 *
 * - Covers the right 50% of the screen; the page behind it is blurred.
 * - Sends the message through EmailJS using NEXT_PUBLIC_EMAILJS_* env vars.
 * - If the env vars are not configured yet, a clear notice is shown instead
 *   of silently failing.
 */
export default function ContactSlideOver({ open, onClose }: ContactSlideOverProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  // Portals need the DOM — only render after the client has mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const configured = Boolean(
    serviceId && templateId && publicKey &&
    !serviceId.startsWith("your_") && !templateId.startsWith("your_") && !publicKey.startsWith("your_")
  );

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus(null);
    try {
      if (!configured) {
        throw new Error(
          "Email service is not configured yet. Add NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY to .env.local."
        );
      }
      await emailjs.send(
        serviceId as string,
        templateId as string,
        { from_name: name, from_email: email, reply_to: email, message },
        { publicKey: publicKey as string }
      );
      setStatus({
        kind: "success",
        text: "Thanks! Your message has been sent — we'll get back to you soon.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({
        kind: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Blur + dim the page behind the panel */}
      <div
        className={`contact-veil${open ? " open" : ""}`}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        className={`contact-panel${open ? " open" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-label="Contact us"
        aria-hidden={!open}
      >
        <div className="contact-panel-head">
          <span className="contact-kicker">Let&apos;s talk</span>
          <button className="contact-close" aria-label="Close contact form" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="contact-panel-body">
          <h2>
            Tell us about your
            <br />
            next project
          </h2>
          <p className="contact-sub">
            Share a few details and our team will reach out with the best next
            steps for your idea, product, or redesign.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-row">
              <div className="contact-field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="contact-email">Your Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Tell us more about your project</label>
              <textarea
                id="contact-message"
                required
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Something about your great idea"
              />
            </div>

            {status && (
              <p className={`contact-status ${status.kind}`} role="status">
                {status.text}
              </p>
            )}
          </form>
        </div>

        <div className="contact-panel-foot">
          {/* <p className="contact-our-email">
            Our Email <a href="mailto:info@onewaynepal.com">info@onewaynepal.com</a>
          </p> */}
          <button
            className="contact-submit"
            type="button"
            disabled={sending}
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>(".contact-form");
              form?.requestSubmit();
            }}
          >
            {sending ? "Sending…" : "Submit the request"} <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
}