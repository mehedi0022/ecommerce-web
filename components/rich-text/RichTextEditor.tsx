"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { RichTextContent, richTextClass } from "./RichTextContent";
import { RichTextToolbar } from "./RichTextToolbar";
import { RichTextBubbleMenu } from "./RichTextBubbleMenu";
import { RichTextLinkDialog } from "./RichTextLinkDialog";
import { ImageCropModal } from "@/components/media/ImageCropModal";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  LoaderCircle,
  AlertCircle,
  X,
  Minimize2,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "cn";
import type { ImageKind } from "@/components/media/image-crop";

export interface RichTextEditorProps {
  imageTitle?: string;
  imageKind?: ImageKind;
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string>;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  id?: string;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  imageTitle,
  imageKind,
  value,
  onChange,
  uploadImage,
  disabled = false,
  onBusyChange,
  id = "rich-text",
  placeholder,
  maxLength = 10000,
  minHeight = "min-h-56",
  className,
}: RichTextEditorProps) {
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Validate and stage an image for cropping and upload
  const handleStagedFile = useCallback(
    (selected: File) => {
      if (disabled || uploading) return;
      if (
        !selected.size ||
        selected.size > 20 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(selected.type)
      ) {
        setError("Please choose a JPG, PNG or WebP image up to 20 MB.");
        return;
      }
      setError("");
      setFile(selected);
      onBusyChange?.(true);
    },
    [disabled, uploading, onBusyChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "table-fixed border-collapse w-full my-4 border border-border/80 rounded-xl overflow-hidden text-sm",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-xl border border-border/70 my-4 max-w-full shadow-xs",
        },
      }),
      Placeholder.configure({
        placeholder:
          placeholder ||
          "Craft a compelling product description... Highlight key features, craftsmanship, materials, dimensions, and styling ideas.",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled && !uploading && activeTab === "edit",
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-label": "Product description",
        "aria-multiline": "true",
        class: cn(
          "w-full p-4 sm:p-5 outline-none select-text transition-colors",
          minHeight,
          richTextClass
        ),
      },
      handleKeyDown: (_view, event) => {
        // Ctrl+K / Cmd+K shortcut for hyperlink dialog
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
          event.preventDefault();
          setLinkDialogOpen(true);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith("image/")) {
            const pastedFile = item.getAsFile();
            if (pastedFile) {
              event.preventDefault();
              handleStagedFile(pastedFile);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const droppedFiles = event.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
          const droppedImage = droppedFiles[0];
          if (droppedImage.type.startsWith("image/")) {
            event.preventDefault();
            handleStagedFile(droppedImage);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  // Keep editor editable state in sync
  useEffect(() => {
    editor?.setEditable(!disabled && !uploading && activeTab === "edit", false);
  }, [editor, disabled, uploading, activeTab]);

  // Sync external content value updates
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Escape key exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  // Link dialog actions
  const handleSaveLink = (url: string, openInNewTab: boolean) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: openInNewTab ? "_blank" : null,
      })
      .run();
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  // Metrics
  const charCount = value ? value.length : 0;
  const rawText = editor ? editor.getText() : "";
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const isNearLimit = charCount > maxLength * 0.85;
  const isOverLimit = charCount > maxLength;

  // The core editor element
  const editorBody = (
    <div
      ref={editorContainerRef}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) handleStagedFile(dropped);
      }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xs transition-all duration-200",
        "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
        isFullscreen ? "h-full flex-1 border-0 shadow-none rounded-none" : "",
        className
      )}
    >
      {/* Top Toolbar */}
      <RichTextToolbar
        editor={editor}
        disabled={disabled}
        uploading={uploading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onOpenLinkDialog={() => setLinkDialogOpen(true)}
        onInsertImage={() => fileInput.current?.click()}
      />

      {/* Floating Selection Bubble Menu */}
      {activeTab === "edit" && (
        <RichTextBubbleMenu
          editor={editor}
          containerRef={editorContainerRef}
          disabled={disabled || uploading}
          onOpenLink={() => setLinkDialogOpen(true)}
        />
      )}

      {/* Uploading Progress Notification */}
      {uploading && (
        <div className="flex items-center gap-2.5 border-b border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary animate-in fade-in duration-150">
          <LoaderCircle className="size-3.5 animate-spin" />
          <span>Uploading and optimizing image, please wait…</span>
        </div>
      )}

      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 p-6 text-center backdrop-blur-xs animate-in fade-in duration-150">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <UploadCloud className="size-7 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Drop image here to optimize & insert
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or WebP up to 20 MB
          </p>
        </div>
      )}

      {/* Main Content Area: Edit vs Preview */}
      <div className={cn("relative flex-1 overflow-y-auto", isFullscreen ? "p-4 sm:p-8" : "")}>
        {activeTab === "edit" ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" /> Storefront Preview
              </span>
              <span>Shows how shoppers will see your product copy</span>
            </div>

            {value ? (
              <RichTextContent value={value} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Info className="mb-2.5 size-7 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                  Your description is currently empty
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Switch back to the "Write" tab to compose your product story, specifications, and details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 border-t border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-destructive/15 text-destructive transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-2">
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span className="text-border">•</span>
          <span
            className={cn(
              "transition-colors",
              isOverLimit
                ? "font-semibold text-destructive"
                : isNearLimit
                ? "font-medium text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          >
            {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground/80">
          <span>Drag & drop or paste images</span>
          <span className="text-border">•</span>
          <span>Markdown shortcuts supported</span>
        </div>
      </div>

      {/* Hidden File Picker */}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Description image"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (selected) handleStagedFile(selected);
        }}
      />

      {/* Link Dialog */}
      <RichTextLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={editor?.getAttributes("link").href || ""}
        initialOpenInNewTab={editor?.getAttributes("link").target === "_blank"}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
      />

      {/* Crop & Image Upload Modal */}
      {file && (
        <ImageCropModal
          title={imageTitle}
          kind={imageKind}
          file={file}
          aspect={4 / 3}
          onCancel={() => {
            setFile(undefined);
            onBusyChange?.(false);
          }}
          onConfirm={async (cropped) => {
            setUploading(true);
            try {
              const url = await uploadImage(cropped);
              if (!/^https?:\/\//i.test(url) && !/^\/(?!\/)/.test(url)) {
                throw new Error("The upload returned an invalid image URL.");
              }
              if (editor) {
                editor
                  .chain()
                  .focus()
                  .insertContentAt(editor.state.selection.to, {
                    type: "image",
                    attrs: {
                      src: url,
                      alt: file.name.replace(/\.[^.]+$/, ""),
                    },
                  })
                  .run();
              }
              setFile(undefined);
              onBusyChange?.(false);
            } catch (uploadErr) {
              setError(
                uploadErr instanceof Error
                  ? uploadErr.message
                  : "Image upload failed. Please try again."
              );
            } finally {
              setUploading(false);
            }
          }}
        />
      )}
    </div>
  );

  // If Fullscreen, wrap in an immersive focus backdrop
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in duration-150">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              {imageTitle ? `${imageTitle} — Description` : "Product Description"}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Focus Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to exit
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Minimize2 className="size-3.5" />
              <span>Exit focus</span>
            </Button>
          </div>
        </div>

        {/* Fullscreen Body */}
        <div className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto p-3 sm:p-6">
          <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xl">
            {editorBody}
          </div>
        </div>
      </div>
    );
  }

  return editorBody;
}
