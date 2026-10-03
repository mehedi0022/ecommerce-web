"use client";
import { useMemo, useSyncExternalStore } from "react";
import DOMPurify from "dompurify";
export const richTextClass = "[&_p]:my-2 [&_h2]:my-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_a]:text-primary [&_a]:underline [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_pre]:overflow-auto [&_pre]:bg-muted [&_pre]:p-3 break-words";
export function cleanRichText(value: string) {
  const fragment = DOMPurify.sanitize(value, { ALLOWED_TAGS: ["p", "br", "strong", "em", "s", "u", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img", "hr", "pre", "code"], ALLOWED_ATTR: ["href", "src", "alt", "title"], ALLOW_DATA_ATTR: false, RETURN_DOM: true });
  if (!(fragment instanceof HTMLElement)) return "";
  for (const image of fragment.querySelectorAll("img")) if (!/^(https?:\/\/|\/(?!\/))/i.test(image.getAttribute("src") ?? "")) image.remove();
  return fragment.innerHTML;
}
const subscribe = () => () => {};
export function RichTextContent({ value }: { value: string }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const html = useMemo(() => mounted ? cleanRichText(value) : "", [mounted, value]);
  return <div className={richTextClass} dangerouslySetInnerHTML={{ __html: html }}/>;
}
