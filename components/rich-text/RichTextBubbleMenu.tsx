"use client";

import { useEffect, useState, useRef } from "react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  Heading2,
  Heading3,
  Quote,
} from "lucide-react";
import { cn } from "cn";

interface RichTextBubbleMenuProps {
  editor: Editor | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  onOpenLink: () => void;
}

export function RichTextBubbleMenu({
  editor,
  containerRef,
  disabled = false,
  onOpenLink,
}: RichTextBubbleMenuProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || disabled) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      if (
        !editor.isFocused ||
        editor.state.selection.empty ||
        !containerRef.current
      ) {
        setCoords(null);
        return;
      }

      const { from, to } = editor.state.selection;
      try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const containerRect = containerRef.current.getBoundingClientRect();

        const midX = (start.left + end.right) / 2 - containerRect.left;
        const topY = start.top - containerRect.top - 46;

        const clampedX = Math.max(130, Math.min(midX, containerRect.width - 130));
        const finalY = topY < 36 ? end.bottom - containerRect.top + 8 : topY;

        setCoords({ x: clampedX, y: finalY });
      } catch {
        setCoords(null);
      }
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);

    const handleBlur = () => {
      setTimeout(() => {
        if (!bubbleRef.current?.contains(document.activeElement)) {
          setCoords(null);
        }
      }, 180);
    };

    editor.on("blur", handleBlur);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", handleBlur);
    };
  }, [editor, containerRef, disabled]);

  if (!editor || !coords || disabled) return null;

  const items = [
    {
      label: "Bold",
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
      icon: <Bold className="size-3.5" />,
    },
    {
      label: "Italic",
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
      icon: <Italic className="size-3.5" />,
    },
    {
      label: "Underline",
      active: editor.isActive("underline"),
      action: () => editor.chain().focus().toggleUnderline().run(),
      icon: <UnderlineIcon className="size-3.5" />,
    },
    {
      label: "Strikethrough",
      active: editor.isActive("strike"),
      action: () => editor.chain().focus().toggleStrike().run(),
      icon: <Strikethrough className="size-3.5" />,
    },
    {
      label: "Link",
      active: editor.isActive("link"),
      action: onOpenLink,
      icon: <Link2 className="size-3.5" />,
    },
    {
      label: "Heading 2",
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: <Heading2 className="size-3.5" />,
    },
    {
      label: "Heading 3",
      active: editor.isActive("heading", { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      icon: <Heading3 className="size-3.5" />,
    },
    {
      label: "Quote",
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
      icon: <Quote className="size-3.5" />,
    },
  ];

  return (
    <div
      ref={bubbleRef}
      data-bubble-menu="true"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        transform: "translateX(-50%)",
      }}
      className="absolute z-40 flex items-center gap-0.5 rounded-full border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          title={item.label}
          onMouseDown={(e) => {
            // Prevent editor blur
            e.preventDefault();
            item.action();
          }}
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
            item.active
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
