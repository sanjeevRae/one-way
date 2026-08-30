"use client";

import { useRef } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

type SelResult = { value: string; selStart: number; selEnd: number };

function lineBounds(text: string, start: number, end: number) {
  const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  let lineEnd = text.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = text.length;
  return { lineStart, lineEnd };
}

/**
 * Markdown editor used in the admin panel.
 *
 * Renders a small formatting toolbar above a plain <textarea>. Every action
 * inserts the matching markdown syntax at the current cursor / selection,
 * so the admin never has to type markdown by hand.
 */
export default function MarkdownEditor({
  value,
  onChange,
  rows = 10,
  placeholder,
}: MarkdownEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  function apply(fn: (v: string, start: number, end: number) => SelResult) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const res = fn(value, start, end);
    onChange(res.value);
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(res.selStart, res.selEnd);
      }
    });
  }

  function wrap(before: string, after: string, placeholderText = "text") {
    apply((v, s, e) => {
      const sel = v.slice(s, e);
      if (sel) {
        return {
          value: v.slice(0, s) + before + sel + after + v.slice(e),
          selStart: s + before.length,
          selEnd: s + before.length + sel.length,
        };
      }
      return {
        value: v.slice(0, s) + before + placeholderText + after + v.slice(e),
        selStart: s + before.length,
        selEnd: s + before.length + placeholderText.length,
      };
    });
  }

  /** Toggles a line-level prefix (headings, bullets, quotes, numbers). */
  function linePrefixToggle(opts: {
    bullet?: boolean;
    numbered?: boolean;
    quote?: boolean;
    hash?: string;
  }) {
    apply((v, s, e) => {
      const { lineStart, lineEnd } = lineBounds(v, s, e);
      const block = v.slice(lineStart, lineEnd);
      const lines = block.split("\n");

      const pattern = opts.bullet
        ? /^(\s*)[-*]\s+/
        : opts.numbered
          ? /^(\s*)\d+[.)]\s+/
          : opts.quote
            ? /^(\s*)>\s?/
            : new RegExp(`^(\\s*)${opts.hash}\\s+`);

      const allMatch = lines.every((ln) => !ln.trim() || pattern.test(ln));

      const out = lines
        .map((ln, i) => {
          if (!ln.trim()) return ln;
          if (allMatch) return ln.replace(pattern, "");
          if (opts.quote) return `> ${ln.trim()}`;
          if (opts.bullet) return `- ${ln.trim()}`;
          if (opts.numbered) return `${i + 1}. ${ln.trim()}`;
          return `${opts.hash} ${ln.trim()}`;
        })
        .join("\n");

      return {
        value: v.slice(0, lineStart) + out + v.slice(lineEnd),
        selStart: lineStart,
        selEnd: lineStart + out.length,
      };
    });
  }

  function insertBlockOnNewLine(block: string) {
    apply((v, s, e) => {
      const before = s === 0 || v.endsWith("\n") ? "" : "\n";
      const nv = v.slice(0, s) + before + block + "\n" + v.slice(e);
      return { value: nv, selStart: s + before.length, selEnd: s + before.length + block.length };
    });
  }

  const addLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    wrap("[", `](${url})`, "link text");
  };

  const addImage = () => {
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    const alt = window.prompt("Image description (alt text)", "image") || "image";
    insertBlockOnNewLine(`![${alt}](${url})`);
  };

  const addHr = () => insertBlockOnNewLine("---");

  return (
    <div className="md-editor">
      <div className="md-toolbar" role="toolbar" aria-label="Formatting tools">
        <div className="md-tool-group">
          <ToolButton label="Heading 2" title="Heading (## )" onClick={() => linePrefixToggle({ hash: "##" })}>
            <Heading2 size={15} />
          </ToolButton>
          <ToolButton label="Heading 3" title="Sub heading (### )" onClick={() => linePrefixToggle({ hash: "###" })}>
            <Heading3 size={15} />
          </ToolButton>
        </div>
        <div className="md-tool-group">
          <ToolButton label="Bold" title="Bold (**text**)" onClick={() => wrap("**", "**", "bold text")}>
            <Bold size={15} />
          </ToolButton>
          <ToolButton label="Italic" title="Italic (*text*)" onClick={() => wrap("*", "*", "italic text")}>
            <Italic size={15} />
          </ToolButton>
          <ToolButton label="Inline code" title="Code (`text`)" onClick={() => wrap("`", "`", "code")}>
            <Code size={15} />
          </ToolButton>
        </div>
        <div className="md-tool-group">
          <ToolButton label="Bullet list" title="Bullet list" onClick={() => linePrefixToggle({ bullet: true })}>
            <List size={15} />
          </ToolButton>
          <ToolButton label="Numbered list" title="Numbered list" onClick={() => linePrefixToggle({ numbered: true })}>
            <ListOrdered size={15} />
          </ToolButton>
          <ToolButton label="Quote" title="Quote (> )" onClick={() => linePrefixToggle({ quote: true })}>
            <Quote size={15} />
          </ToolButton>
          <ToolButton label="Divider" title="Divider (---)" onClick={addHr}>
            <Minus size={15} />
          </ToolButton>
        </div>
        <div className="md-tool-group">
          <ToolButton label="Link" title="Insert link" onClick={addLink}>
            <Link2 size={15} />
          </ToolButton>
          <ToolButton label="Image" title="Insert image" onClick={addImage}>
            <ImageIcon size={15} />
          </ToolButton>
        </div>
      </div>
      <textarea
        ref={taRef}
        className="admin-textarea md-textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ToolButton({
  label,
  title,
  onClick,
  children,
}: {
  label: string;
  title?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="md-tool-btn"
      title={title || label}
      aria-label={label}
      // Keep focus/selection inside the textarea
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}