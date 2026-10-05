"use client";

import { useMemo, useSyncExternalStore } from "react";
import DOMPurify from "dompurify";

export const richTextClass = [
  "break-words leading-relaxed text-foreground/90",
  "[&_p]:my-2.5 [&_p]:leading-relaxed",
  "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground first:[&_h2]:mt-0",
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground first:[&_h3]:mt-0",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5",
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5",
  "[&_li]:leading-relaxed",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_em]:italic",
  "[&_u]:underline [&_u]:underline-offset-3",
  "[&_s]:line-through [&_s]:text-muted-foreground",
  "[&_code]:rounded-md [&_code]:bg-muted/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:font-medium [&_code]:text-foreground",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/70 [&_blockquote]:bg-muted/20 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:italic [&_blockquote]:rounded-r-lg [&_blockquote]:text-muted-foreground",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:font-medium hover:[&_a]:text-primary/80 transition-colors",
  "[&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border/60 [&_img]:shadow-xs",
  "[&_hr]:my-6 [&_hr]:border-t [&_hr]:border-border/70",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border [&_th]:border-border [&_th]:bg-muted/80 [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground",
  "[&_td]:border [&_td]:border-border/70 [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-foreground/90",
  "[&_tr:nth-child(even)]:bg-muted/25 hover:[&_tr]:bg-muted/40 transition-colors",
  "[&_.selectedCell]:bg-primary/10 [&_.selectedCell]:border-primary/60",
  "[&_.column-resize-handle]:w-1 [&_.column-resize-handle]:bg-primary [&_.column-resize-handle]:pointer-events-none",
  "[&_.is-editor-empty:first-child::before]:text-muted-foreground/45 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0",
  "[&_.is-empty::before]:text-muted-foreground/45 [&_.is-empty::before]:content-[attr(data-placeholder)] [&_.is-empty::before]:float-left [&_.is-empty::before]:pointer-events-none [&_.is-empty::before]:h-0",
].join(" ");

export function cleanRichText(value: string) {
  if (!value) return "";

  // If plain text without any HTML tags, format newlines as clean paragraphs
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return value
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  const fragment = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "del",
      "strike",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "hr",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "colgroup",
      "col",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "target",
      "rel",
      "class",
      "colspan",
      "rowspan",
      "colwidth",
      "style",
      "scope",
    ],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: true,
  });

  if (!(fragment instanceof HTMLElement)) return "";

  // Ensure tables are wrapped in a horizontally scrollable container if needed
  for (const table of fragment.querySelectorAll("table")) {
    if (table.parentElement && !table.parentElement.classList.contains("overflow-x-auto")) {
      const wrapper = fragment.ownerDocument.createElement("div");
      wrapper.className = "my-4 w-full overflow-x-auto rounded-xl border border-border shadow-2xs";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }

  for (const image of fragment.querySelectorAll("img")) {
    const src = image.getAttribute("src") ?? "";
    if (!/^(https?:\/\/|\/(?!\/))/i.test(src)) {
      image.remove();
    }
  }

  for (const link of fragment.querySelectorAll("a")) {
    const href = link.getAttribute("href") ?? "";
    if (!/^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(href)) {
      link.removeAttribute("href");
    } else {
      link.setAttribute("rel", "noopener noreferrer");
      if (!link.getAttribute("target")) {
        link.setAttribute("target", "_blank");
      }
    }
  }

  return fragment.innerHTML;
}

const subscribe = () => () => {};

export function RichTextContent({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const html = useMemo(
    () => (mounted ? cleanRichText(value) : ""),
    [mounted, value],
  );

  return (
    <div
      className={`${richTextClass} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
