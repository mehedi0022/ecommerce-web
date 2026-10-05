"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  RemoveFormatting,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
  Eye,
  PenLine,
  Maximize2,
  Minimize2,
  ChevronDown,
  Type,
  Table as TableIcon,
  Rows3,
  Columns3,
  Plus,
  Trash2,
  Split,
} from "lucide-react";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  uploading?: boolean;
  activeTab: "edit" | "preview";
  onTabChange: (tab: "edit" | "preview") => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenLinkDialog: () => void;
  onInsertImage: () => void;
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border/70 self-center shrink-0" />;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 outline-none select-none",
              "hover:bg-muted hover:text-foreground active:scale-95",
              "focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-35",
              active && "bg-accent font-semibold text-accent-foreground shadow-2xs"
            )}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5} className="flex items-center gap-1.5 px-2 py-1 text-xs">
        <span>{label}</span>
        {shortcut && (
          <kbd className="rounded bg-background/25 px-1 py-0.5 text-[10px] font-mono tracking-tight text-background">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function RichTextToolbar({
  editor,
  disabled = false,
  uploading = false,
  activeTab,
  onTabChange,
  isFullscreen,
  onToggleFullscreen,
  onOpenLinkDialog,
  onInsertImage,
}: RichTextToolbarProps) {
  const isEditing = activeTab === "edit";
  const controlsDisabled = !editor || disabled || uploading || !isEditing;

  // Active Block Label
  const getActiveBlockLabel = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("blockquote")) return "Quote";
    if (editor.isActive("codeBlock")) return "Code block";
    return "Paragraph";
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting options"
      className="flex flex-wrap items-center justify-between gap-1 border-b border-border/80 bg-muted/30 px-2.5 py-1.5 backdrop-blur-xs select-none"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {/* Block Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                disabled={controlsDisabled}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-foreground transition-colors outline-none",
                  "hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-40"
                )}
              />
            }
          >
            <Type className="size-3.5 text-muted-foreground" />
            <span className="w-18 text-left truncate">{getActiveBlockLabel()}</span>
            <ChevronDown className="size-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().setParagraph().run()}
            >
              <Type className="mr-2 size-4 text-muted-foreground" />
              <span>Normal text</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="mr-2 size-4 text-muted-foreground" />
              <span>Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="mr-2 size-4 text-muted-foreground" />
              <span>Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="mr-2 size-4 text-muted-foreground" />
              <span>Quote block</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="mr-2 size-4 text-muted-foreground" />
              <span>Code block</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarDivider />

        {/* Inline Formatting */}
        <ToolbarButton
          icon={<Bold className="size-4" />}
          label="Bold"
          shortcut="Ctrl+B"
          active={editor?.isActive("bold")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic className="size-4" />}
          label="Italic"
          shortcut="Ctrl+I"
          active={editor?.isActive("italic")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<UnderlineIcon className="size-4" />}
          label="Underline"
          shortcut="Ctrl+U"
          active={editor?.isActive("underline")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={<Strikethrough className="size-4" />}
          label="Strikethrough"
          shortcut="Ctrl+Shift+X"
          active={editor?.isActive("strike")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={<Code className="size-4" />}
          label="Inline code"
          active={editor?.isActive("code")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          icon={<RemoveFormatting className="size-4" />}
          label="Clear formatting"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        />

        <ToolbarDivider />

        {/* Lists & Quotes */}
        <ToolbarButton
          icon={<List className="size-4" />}
          label="Bullet list"
          shortcut="Ctrl+Shift+8"
          active={editor?.isActive("bulletList")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<ListOrdered className="size-4" />}
          label="Numbered list"
          shortcut="Ctrl+Shift+7"
          active={editor?.isActive("orderedList")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={<Quote className="size-4" />}
          label="Quote"
          shortcut="Ctrl+Shift+B"
          active={editor?.isActive("blockquote")}
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={<Minus className="size-4" />}
          label="Horizontal divider"
          disabled={controlsDisabled}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarDivider />

        {/* Links & Media */}
        <ToolbarButton
          icon={<Link2 className="size-4" />}
          label="Insert / edit link"
          shortcut="Ctrl+K"
          active={editor?.isActive("link")}
          disabled={controlsDisabled}
          onClick={onOpenLinkDialog}
        />
        <ToolbarButton
          icon={<ImagePlus className="size-4" />}
          label="Insert image"
          disabled={controlsDisabled}
          onClick={onInsertImage}
        />

        {/* Table Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Table options"
                disabled={controlsDisabled}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 outline-none select-none",
                  "hover:bg-muted hover:text-foreground active:scale-95",
                  "focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-35",
                  editor?.isActive("table") && "bg-accent font-semibold text-accent-foreground shadow-2xs"
                )}
              />
            }
          >
            <TableIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {!editor?.isActive("table") ? (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                >
                  <TableIcon className="mr-2 size-4 text-muted-foreground" />
                  <span>Insert 3 × 3 Table</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 4, cols: 2, withHeaderRow: true })
                      .run()
                  }
                >
                  <Rows3 className="mr-2 size-4 text-muted-foreground" />
                  <span>Product Specs (4 × 2)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 5, cols: 4, withHeaderRow: true })
                      .run()
                  }
                >
                  <Columns3 className="mr-2 size-4 text-muted-foreground" />
                  <span>Size Guide (5 × 4)</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().addRowBefore().run()}
                >
                  <Plus className="mr-2 size-4 text-muted-foreground" />
                  <span>Add row above</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                >
                  <Plus className="mr-2 size-4 text-muted-foreground" />
                  <span>Add row below</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  <span>Delete row</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().addColumnBefore().run()}
                >
                  <Plus className="mr-2 size-4 text-muted-foreground" />
                  <span>Add column before</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="mr-2 size-4 text-muted-foreground" />
                  <span>Add column after</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  <span>Delete column</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().mergeOrSplit().run()}
                >
                  <Split className="mr-2 size-4 text-muted-foreground" />
                  <span>Merge / Split cell</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
                >
                  <Rows3 className="mr-2 size-4 text-muted-foreground" />
                  <span>Toggle header row</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().deleteTable().run()}
                  className="text-destructive font-medium focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  <span>Delete table</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarDivider />

        {/* History */}
        <ToolbarButton
          icon={<Undo2 className="size-4" />}
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={controlsDisabled || !editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={<Redo2 className="size-4" />}
          label="Redo"
          shortcut="Ctrl+Y"
          disabled={controlsDisabled || !editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>

      {/* Right Controls: View mode & Fullscreen */}
      <div className="flex items-center gap-1.5 self-center">
        {/* Write / Preview Tab Switcher */}
        <div className="flex items-center rounded-lg border border-border/70 bg-background/80 p-0.5 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => onTabChange("edit")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-all duration-150",
              activeTab === "edit"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PenLine className="size-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("preview")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-all duration-150",
              activeTab === "preview"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="size-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
                onClick={onToggleFullscreen}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150",
                  "hover:bg-muted hover:text-foreground active:scale-95",
                  isFullscreen && "bg-accent text-accent-foreground font-semibold"
                )}
              />
            }
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs">
            {isFullscreen ? "Exit full screen (Esc)" : "Full screen focus mode"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
