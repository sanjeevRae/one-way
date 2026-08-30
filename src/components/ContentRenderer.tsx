interface ContentRendererProps {
  content: string;
  /** When true, returns { toc, html } so the caller can render a sidebar TOC. */
  rich?: boolean;
}

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

/**
 * Convert inline markdown to HTML:
 *  - `**bold**`, `*italic*`, `` `code` ``
 *  - `[label](url)` links
 *  - bare `https://` URLs
 */
function inline(text: string): string {
  let out = text
    // Escape HTML so raw tags don't inject markup (except the ones we build)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // code spans first (their contents are treated as literal text)
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");

  // links
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // italic
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?![*])/g, "$1<em>$2</em>");

  // bare URLs (avoid ones already inside an href="...")
  const urlRegex = /https?:\/\/[^\s<"]+/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(out)) !== null) {
    const before = out.slice(0, m.index);
    if (before.endsWith('href="')) {
      // Already inside an href attribute — skip it, leaving `last` untouched
      // so the surrounding text (including the <a href=" prefix) is preserved.
      continue;
    }
    parts.push(out.slice(last, m.index));
    parts.push(
      `<a href="${m[0]}" target="_blank" rel="noopener noreferrer">${m[0]}</a>`
    );
    last = m.index + m[0].length;
  }
  if (last < out.length) parts.push(out.slice(last));
  if (parts.length > 0) out = parts.join("");

  return out;
}

/** Generate a URL-safe anchor ID from a heading. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Parse markdown-ish content into HTML + TOC.
 *
 * Supports:
 *  - `#` `##` `###` headings (h2/h3 preferred for TOC)
 *  - `- ` / `* ` bullet lists (consecutive lines merge into one <ul>)
 *  - `1. ` ordered lists
 *  - `> ` blockquotes (consecutive lines merge into one blockquote)
 *  - `![alt](url)` images and `<img src="...">` raw HTML
 *  - `[text](url)` links, `**bold**`, `*italic*`, `` `code` ``
 *  - `---` horizontal rules
 */
export function renderRich(content: string): { toc: TocEntry[]; html: string } {
  const toc: TocEntry[] = [];
  const blocks: string[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let ulBuffer: string[] | null = null;
  let olBuffer: string[] | null = null;
  let quoteBuffer: string[] | null = null;

  const flushUl = () => {
    if (ulBuffer) {
      blocks.push(`<ul>${ulBuffer.join("")}</ul>`);
      ulBuffer = null;
    }
  };
  const flushOl = () => {
    if (olBuffer) {
      blocks.push(`<ol>${olBuffer.join("")}</ol>`);
      olBuffer = null;
    }
  };
  const flushQuote = () => {
    if (quoteBuffer) {
      blocks.push(`<blockquote>${quoteBuffer.join("")}</blockquote>`);
      quoteBuffer = null;
    }
  };
  const flush = () => {
    flushUl();
    flushOl();
    flushQuote();
  };

  for (const raw of lines) {
    const t = raw.trim();

    if (t === "") {
      flush();
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flush();
      blocks.push("<hr />");
      continue;
    }

    // Markdown image on its own line
    const img = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(t);
    if (img) {
      flush();
      blocks.push(
        `<figure><img src="${img[2]}" alt="${img[1]}" loading="lazy" /></figure>`
      );
      continue;
    }

    // Raw HTML image
    if (/^<img\s/i.test(t)) {
      flush();
      blocks.push(t);
      continue;
    }

    // Heading (#, ##, ###)
    const h = /^(#{1,3})\s+(.*)/.exec(t);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2].trim();
      const id = headingId(text);
      toc.push({ level, text, id });
      blocks.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }

    // Bullet list item
    if (/^[-*]\s+/.test(t)) {
      flushOl();
      flushQuote();
      ulBuffer = ulBuffer ?? [];
      ulBuffer.push(`<li>${inline(t.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    // Ordered list item
    if (/^\d+[.)]\s+/.test(t)) {
      flushUl();
      flushQuote();
      olBuffer = olBuffer ?? [];
      olBuffer.push(`<li>${inline(t.replace(/^\d+[.)]\s+/, ""))}</li>`);
      continue;
    }

    // Blockquote
    if (t.startsWith(">")) {
      flushUl();
      flushOl();
      quoteBuffer = quoteBuffer ?? [];
      quoteBuffer.push(`<p>${inline(t.replace(/^>\s?/, ""))}</p>`);
      continue;
    }

    // Regular paragraph
    flush();
    blocks.push(`<p>${inline(t)}</p>`);
  }

  flush();

  return { toc, html: blocks.join("\n") };
}

/**
 * Renders raw text content into structured blocks.
 * When `rich` is true, returns { toc, html } for sidebar TOC use.
 */
export default function ContentRenderer({ content, rich = false }: ContentRendererProps) {
  const { toc, html } = renderRich(content);
  if (rich) return { toc, html };

  return <div className="prose-blocks" dangerouslySetInnerHTML={{ __html: html }} />;
}