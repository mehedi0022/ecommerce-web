"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { richTextClass } from "./RichTextContent";
import { Button } from "@/components/ui/button";
import { ImageCropModal } from "@/components/media/ImageCropModal";

import type { ImageKind } from "@/components/media/image-crop";

export function RichTextEditor({ imageTitle, imageKind, value, onChange, uploadImage, disabled = false, onBusyChange, id = "rich-text" }: { imageTitle?: string; imageKind?: ImageKind; value: string; onChange: (html: string) => void; uploadImage: (file: File) => Promise<string>; disabled?: boolean; onBusyChange?: (busy: boolean) => void; id?: string }) {
  const [file, setFile] = useState<File>(); const [error, setError] = useState(""); const [uploading, setUploading] = useState(false); const fileInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({ extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }), Image.configure({ allowBase64: false })], content: value, immediatelyRender: false, shouldRerenderOnTransaction: true, editable: !disabled, editorProps: { attributes: { id, role: "textbox", "aria-label": "Product description", "aria-multiline": "true", class: `min-h-52 p-4 outline-none ${richTextClass}` } }, onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()) });
  useEffect(() => { editor?.setEditable(!disabled && !uploading, false); }, [editor, disabled, uploading]);
  useEffect(() => { if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) editor.commands.setContent(value, { emitUpdate: false }); }, [value, editor]);
  const controls: [string, string, (editor: Editor) => void][] = [["Bold", "bold", e => { e.chain().focus().toggleBold().run(); }], ["Italic", "italic", e => { e.chain().focus().toggleItalic().run(); }], ["Heading", "heading", e => { e.chain().focus().toggleHeading({ level: 2 }).run(); }], ["Bullet list", "bulletList", e => { e.chain().focus().toggleBulletList().run(); }], ["Numbered list", "orderedList", e => { e.chain().focus().toggleOrderedList().run(); }], ["Quote", "blockquote", e => { e.chain().focus().toggleBlockquote().run(); }]];
  return <div className="overflow-hidden rounded-xl border bg-background"><div className="flex flex-wrap gap-1 border-b bg-muted/30 p-2" role="toolbar" aria-label="Description formatting">{controls.map(([label, node, action]) => <Button key={label} type="button" size="sm" variant={editor?.isActive(node) ? "secondary" : "ghost"} aria-pressed={editor?.isActive(node) ?? false} disabled={!editor || disabled || uploading} onClick={() => editor && action(editor)}>{label}</Button>)}<Button type="button" size="sm" variant="ghost" disabled={!editor || disabled || uploading} onClick={() => fileInput.current?.click()}>Insert image</Button><Button type="button" size="sm" variant="ghost" disabled={disabled || uploading || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>Undo</Button><Button type="button" size="sm" variant="ghost" disabled={disabled || uploading || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>Redo</Button></div>
    <EditorContent editor={editor}/><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Description image" onChange={event => { const selected = event.target.files?.[0]; event.target.value = ""; if (!selected) return; if (!selected.size || selected.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(selected.type)) { setError("Choose a JPG, PNG or WebP image up to 20 MB."); return; } setError(""); setFile(selected); onBusyChange?.(true); }}/>
    <p className="border-t px-3 py-2 text-xs text-muted-foreground">Images are cropped and uploaded before insertion. Up to 10,000 characters including formatting.</p>{error && <p role="alert" className="p-3 text-sm text-destructive">{error}</p>}
    {file && <ImageCropModal title={imageTitle} kind={imageKind} file={file} aspect={4 / 3} onCancel={() => { setFile(undefined); onBusyChange?.(false); }} onConfirm={async cropped => { setUploading(true); try { const url = await uploadImage(cropped); if (!/^https?:\/\//i.test(url) && !/^\/(?!\/)/.test(url)) throw new Error("The upload returned an invalid image URL."); if (editor) editor.chain().focus().insertContentAt(editor.state.selection.to, { type: "image", attrs: { src: url, alt: file.name.replace(/\.[^.]+$/, "") } }).run(); setFile(undefined); onBusyChange?.(false); } finally { setUploading(false); } }}/ >}
  </div>;
}

