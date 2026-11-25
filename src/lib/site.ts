/**
 * Shared site-settings definitions: footer contact fallbacks, social-link
 * validation and homepage section visibility.
 *
 * This module is pure (no fs / no server-only imports) so it can be used by
 * the server store, the API route, the admin panel and the homepage alike —
 * one source of truth for defaults and validation rules.
 */

export interface SectionVisibility {
  intro: boolean;
  services: boolean;
  work: boolean;
  process: boolean;
  testimonials: boolean;
  faqs: boolean;
}

export const SECTION_KEYS: Array<keyof SectionVisibility> = [
  "intro",
  "services",
  "work",
  "process",
  "testimonials",
  "faqs",
];

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  intro: true,
  services: true,
  work: true,
  process: true,
  testimonials: true,
  faqs: true,
};

/** Footer values shown when the admin has not set his own. */
export const DEFAULT_CONTACT_ADDRESS = "Tikhedebal Marg, Lalitpur";
export const DEFAULT_CONTACT_PHONE = "+977-9828626238";
export const DEFAULT_CONTACT_EMAIL = "info@onewaynepal.com";

/** Raised when admin-supplied content fails validation; the API maps it to 400. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** A social link is only ever rendered if it parses as a plain http(s) URL. */
export function isValidSocialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

/** Render-time guard: anything that is not a valid http(s) URL becomes "#". */
export function safeSocialUrl(value: string | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "#";
  return isValidSocialUrl(v) ? v : "#";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Coerces unknown input into a complete SectionVisibility object.
 * Only an explicit `false` hides a section — a missing key means visible,
 * so content stored before this feature existed keeps showing everything.
 */
export function normalizeSectionVisibility(input: unknown): SectionVisibility {
  const src =
    input && typeof input === "object"
      ? (input as Partial<SectionVisibility>)
      : {};
  const out: SectionVisibility = { ...DEFAULT_SECTION_VISIBILITY };
  for (const key of SECTION_KEYS) {
    out[key] = src[key] !== false;
  }
  return out;
}

export interface BrandingFields {
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  sectionVisibility: SectionVisibility;
}

const MAX_SHORT = 200;
const MAX_PHONE = 50;

/**
 * Trims, length-caps and validates the admin-editable branding fields in
 * place. Throws ValidationError with an admin-readable message on the first
 * problem, so a bad value is never stored. Empty always means "unset" and is
 * allowed — the footer falls back to the defaults at render time.
 */
export function validateAndNormalizeBranding(fields: BrandingFields): void {
  // Tolerate payloads from older clients that lack the new fields entirely.
  fields.contactAddress =
    typeof fields.contactAddress === "string" ? fields.contactAddress : "";
  fields.contactPhone =
    typeof fields.contactPhone === "string" ? fields.contactPhone : "";
  fields.contactEmail =
    typeof fields.contactEmail === "string" ? fields.contactEmail : "";
  fields.socialFacebook =
    typeof fields.socialFacebook === "string" ? fields.socialFacebook : "";
  fields.socialInstagram =
    typeof fields.socialInstagram === "string" ? fields.socialInstagram : "";
  fields.socialTiktok =
    typeof fields.socialTiktok === "string" ? fields.socialTiktok : "";

  fields.contactAddress = fields.contactAddress.trim();
  fields.contactPhone = fields.contactPhone.trim();
  fields.contactEmail = fields.contactEmail.trim();
  fields.socialFacebook = fields.socialFacebook.trim();
  fields.socialInstagram = fields.socialInstagram.trim();
  fields.socialTiktok = fields.socialTiktok.trim();

  if (fields.contactAddress.length > MAX_SHORT) {
    throw new ValidationError("Footer address is too long (max 200 characters).");
  }
  if (fields.contactPhone.length > MAX_PHONE) {
    throw new ValidationError("Footer phone number is too long (max 50 characters).");
  }
  if (fields.contactEmail.length > MAX_SHORT) {
    throw new ValidationError("Footer email is too long (max 200 characters).");
  }
  if (
    fields.socialFacebook.length > MAX_SHORT ||
    fields.socialInstagram.length > MAX_SHORT ||
    fields.socialTiktok.length > MAX_SHORT
  ) {
    throw new ValidationError("A social link is too long (max 200 characters).");
  }

  if (fields.contactEmail && !isValidEmail(fields.contactEmail)) {
    throw new ValidationError("Footer email is not a valid email address.");
  }

  if (fields.contactPhone) {
    const digits = fields.contactPhone.replace(/\D/g, "");
    if (!/^\+?[\d\s\-()]+$/.test(fields.contactPhone) || digits.length < 7) {
      throw new ValidationError("Footer phone number looks invalid.");
    }
  }

  const socials: Array<[string, string]> = [
    ["Facebook", fields.socialFacebook],
    ["Instagram", fields.socialInstagram],
    ["TikTok", fields.socialTiktok],
  ];
  for (const [name, value] of socials) {
    if (value && !isValidSocialUrl(value)) {
      throw new ValidationError(
        `${name} link is not a valid URL — paste the full https:// link or leave it empty.`
      );
    }
  }

  fields.sectionVisibility = normalizeSectionVisibility(fields.sectionVisibility);
}
