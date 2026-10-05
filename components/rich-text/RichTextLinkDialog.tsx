"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, ExternalLink, Trash2 } from "lucide-react";

interface RichTextLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  initialOpenInNewTab?: boolean;
  onSave: (url: string, openInNewTab: boolean) => void;
  onRemove?: () => void;
}

export function RichTextLinkDialog({
  open,
  onOpenChange,
  initialUrl = "",
  initialOpenInNewTab = true,
  onSave,
  onRemove,
}: RichTextLinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setOpenInNewTab(initialOpenInNewTab);
      setError("");
    }
  }, [open, initialUrl, initialOpenInNewTab]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a valid link address.");
      return;
    }

    let normalized = trimmed;
    if (!/^(https?:\/\/|\/|mailto:|tel:)/i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    onSave(normalized, openInNewTab);
    onOpenChange(false);
  };

  const handleTestUrl = () => {
    let testUrl = url.trim();
    if (!testUrl) return;
    if (!/^(https?:\/\/|\/|mailto:|tel:)/i.test(testUrl)) {
      testUrl = `https://${testUrl}`;
    }
    window.open(testUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Link2 className="size-4" />
            </div>
            <div>
              <DialogTitle>{initialUrl ? "Edit Link" : "Insert Link"}</DialogTitle>
              <DialogDescription>
                Add a link to another page, website, or document.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="rich-text-link-url" className="text-xs font-medium text-foreground">
              Link URL
            </label>
            <div className="relative">
              <Input
                id="rich-text-link-url"
                type="text"
                autoFocus
                placeholder="https://example.com/user-guide"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError("");
                }}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {url && (
                <button
                  type="button"
                  onClick={handleTestUrl}
                  title="Test link in new tab"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </button>
              )}
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Tip: If you omit https://, it will be added automatically.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="rich-text-link-new-tab"
              checked={openInNewTab}
              onCheckedChange={(checked) => setOpenInNewTab(Boolean(checked))}
            />
            <label
              htmlFor="rich-text-link-new-tab"
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none"
            >
              Open link in a new browser tab
            </label>
          </div>

          <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-2 border-t pt-4">
            <div>
              {initialUrl && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onRemove();
                    onOpenChange(false);
                  }}
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Remove
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {initialUrl ? "Update link" : "Apply link"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
