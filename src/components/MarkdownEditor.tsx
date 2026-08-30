"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderRich } from "@/components/ContentRenderer";
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
  Redo2,
  Type,
  Undo2,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

/* ---------- Markdown serialization (DOM → markdown) ---------- */

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").replace(/\u00a0/g, " ");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const kids = () => Array.from(el.childNodes).map(serializeInline).join("");

  switch (el.tagName) {
    case "BR":
      return "\n";
    case "STRONG":
    case "B": {
      const t = kids().trim();
      return t ? `**${t}**` : "";
    }
    case "EM":
    case "I": {
      const t = kids().trim();
      return t ? `*${t}*` : "";
    }
    case "CODE":
      return `\`${kids()}\``;
    case "A": {
      const t = kids().trim();
      const href = el.getAttribute("href") ?? "";
      return t ? `[${t}](${href})` : "";
    }
    case "IMG": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") || "image";
      return src ? `![${alt}](${src})` : "";
    }
    default:
      // SPAN, FONT, U, and any formatting junk from pasted content is unwrapped
      return kids();
  }
}

function serializeBlocks(container: Node): string {
  let out = "";

  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent ?? "").trim();
      if (t) out += t + "\n\n";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    switch (el.tagName) {
      case "H1":
        out += `# ${serializeInline(el).trim()}\n\n`;
        break;
      case "H2":
        out += `## ${serializeInline(el).trim()}\n\n`;
        break;
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        out += `### ${serializeInline(el).trim()}\n\n`;
        break;
      case "UL":
        Array.from(el.children).forEach((li) => {
          if ((li as HTMLElement).tagName === "LI")
            out += `- ${serializeInline(li).trim()}\n`;
        });
        out += "\n";
        break;
      case "OL": {
        let n = 1;
        Array.from(el.children).forEach((li) => {
          if ((li as HTMLElement).tagName === "LI")
            out += `${n++}. ${serializeInline(li).trim()}\n`;
        });
        out += "\n";
        break;
      }
      case "BLOCKQUOTE": {
        const t = serializeInline(el).trim();
        if (t) {
          t.split("\n").forEach((ln) => {
            out += `> ${ln.trim()}\n`;
          });
          out += "\n";
        }
        break;
      }
      case "HR":
        out += "---\n\n";
        break;
      default: {
        // P, DIV and anything unknown is treated as a paragraph
        const t = serializeInline(el).trim();
        if (t) out += t + "\n\n";
      }
    }
  });

  return out.replace(/\n{3,}/g, "\n\n").trim();
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  /** The markdown string the editable DOM currently reflects. */
  const syncedValue = useRef<string | null>(null);

  const previewHtml = useMemo(
    () => (mode === "preview" ? renderRich(value).html : ""),
    [mode, value]
  );

  // Load content into the editable area when it changes from the outside
  // (e.g. opening a different post) — but never while the user is typing,
  // which would reset their cursor.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (syncedValue.current === value) return;
    el.innerHTML = value.trim() ? renderRich(value).html : "";
    syncedValue.current = value;
  }, [value]);

  /** Read the editable area and push the markdown up to the parent. */
  function emit() {
    const el = editorRef.current;
    if (!el) return;
    const md = serializeBlocks(el);
    syncedValue.current = md;
    onChange(md);
  }

  function exec(cmd: string, arg?: string) {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(cmd, false, arg);
    emit();
  }

  /** Tag name of the block the caret currently sits in. */
  function currentBlock(): string {
    let node = window.getSelection()?.anchorNode ?? null;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName;
        if (
          ["H1", "H2", "H3", "H4", "H5", "H6", "P", "DIV", "BLOCKQUOTE", "LI"].includes(
            tag
          )
        )
          return tag;
      }
      node = node.parentNode;
    }
    return "P";
  }

  /** Applies a block format, or reverts to normal text if already active. */
  function toggleBlock(tag: string) {
    exec("formatBlock", currentBlock() === tag ? "p" : tag);
  }

  const wrapCode = () => {
    const t = window.getSelection()?.toString() ?? "";
    exec("insertHTML", `<code>${t || "code"}</code>`);
  };

  const addLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      exec("insertHTML", `<a href="${url}">${url}</a>`);
    } else {
      exec("createLink", url);
    }
  };

  const addImage = () => {
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    const alt = window.prompt("Image description (alt text)", "image") || "image";
    exec("insertHTML", `<img src="${url}" alt="${alt}" />`);
  };

  return (
    <div className="md-editor">
      <div className="md-topbar">
        <div className="md-mode" role="tablist" aria-label="Editor mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            className={mode === "write" ? "active" : ""}
            onClick={() => setMode("write")}
          >
            <PenLine size={14} /> Write
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={mode === "preview" ? "active" : ""}
            onClick={() => setMode("preview")}
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        {mode === "write" && (
          <div className="md-toolbar" role="toolbar" aria-label="Formatting tools">
            <div className="md-tool-group">
              <ToolButton label="Undo" title="Undo" onClick={() => exec("undo")}>
                <Undo2 size={15} />
              </ToolButton>
              <ToolButton label="Redo" title="Redo" onClick={() => exec("redo")}>
                <Redo2 size={15} />
              </ToolButton>
            </div>
            <div className="md-tool-group">
              <ToolButton label="Normal text" title="Normal paragraph text" onClick={() => exec("formatBlock", "p")}>
                <Type size={15} />
              </ToolButton>
              <ToolButton label="Heading 2" title="Section heading — appears in the table of contents" onClick={() => toggleBlock("h2")}>
                <Heading2 size={15} />
              </ToolButton>
              <ToolButton label="Heading 3" title="Sub heading" onClick={() => toggleBlock("h3")}>
                <Heading3 size={15} />
              </ToolButton>
            </div>
            <div className="md-tool-group">
              <ToolButton label="Bold" title="Bold" onClick={() => exec("bold")}>
                <Bold size={15} />
              </ToolButton>
              <ToolButton label="Italic" title="Italic" onClick={() => exec("italic")}>
                <Italic size={15} />
              </ToolButton>
              <ToolButton label="Inline code" title="Code" onClick={wrapCode}>
                <Code size={15} />
              </ToolButton>
            </div>
            <div className="md-tool-group">
              <ToolButton label="Bullet list" title="Bullet list" onClick={() => exec("insertUnorderedList")}>
                <List size={15} />
              </ToolButton>
              <ToolButton label="Numbered list" title="Numbered list" onClick={() => exec("insertOrderedList")}>
                <ListOrdered size={15} />
              </ToolButton>
              <ToolButton label="Quote" title="Quote" onClick={() => toggleBlock("blockquote")}>
                <Quote size={15} />
              </ToolButton>
              <ToolButton label="Divider" title="Divider line" onClick={() => exec("insertHorizontalRule")}>
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
        )}
      </div>

      {mode === "write" ? (
        <div
          ref={editorRef}
          className="md-content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Content editor"
          data-placeholder={placeholder}
          onInput={emit}
        />
      ) : value.trim() ? (
        <div
          className="prose-blocks md-preview"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <div className="md-preview md-preview-empty">
          Nothing to preview yet — switch back to Write and add some content.
        </div>
      )}
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