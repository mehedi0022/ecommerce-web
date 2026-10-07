"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, Zap, Clock, ShieldCheck } from "lucide-react";
import {
  useCreatePopupMutation,
  useUpdatePopupMutation,
  useUploadPopupImageMutation,
} from "../../popupApi";
import type { Popup, CreatePopupInput, PopupDisplayType, PopupFrequency } from "../../types";

interface PopupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup?: Popup | null;
}

export function PopupFormDialog({
  open,
  onOpenChange,
  popup,
}: PopupFormDialogProps) {
  const [createPopup, { isLoading: isCreating }] = useCreatePopupMutation();
  const [updatePopup, { isLoading: isUpdating }] = useUpdatePopupMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadPopupImageMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [displayType, setDisplayType] = useState<PopupDisplayType>("AFTER_DELAY");
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [frequency, setFrequency] = useState<PopupFrequency>("ONCE");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditing = Boolean(popup);
  const isLoading = isCreating || isUpdating || isUploadingImage;

  useEffect(() => {
    if (popup) {
      setTitle(popup.title || "");
      setDescription(popup.description || "");
      setImageUrl(popup.imageUrl || "");
      setButtonText(popup.buttonText || "");
      setButtonUrl(popup.buttonUrl || "");
      setDisplayType(popup.displayType || "AFTER_DELAY");
      setDelaySeconds(popup.delaySeconds || 3);
      setFrequency(popup.frequency || "ONCE");
      setIsActive(popup.isActive ?? true);
      setStartsAt(popup.startsAt ? popup.startsAt.split("T")[0] : "");
      setEndsAt(popup.endsAt ? popup.endsAt.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setImageUrl("");
      setButtonText("Claim Offer Now");
      setButtonUrl("/products");
      setDisplayType("AFTER_DELAY");
      setDelaySeconds(3);
      setFrequency("ONCE");
      setIsActive(true);
      setStartsAt("");
      setEndsAt("");
    }
    setImageFile(null);
  }, [popup, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a popup title.");
      return;
    }

    try {
      const payload: CreatePopupInput = {
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        buttonText: buttonText.trim() || null,
        buttonUrl: buttonUrl.trim() || null,
        displayType,
        delaySeconds: displayType === "AFTER_DELAY" ? Number(delaySeconds) || 3 : 0,
        frequency,
        isActive,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      };

      let targetId = popup?.id;

      if (isEditing && popup) {
        await updatePopup({ id: popup.id, data: payload }).unwrap();
        toast.success("Popup updated successfully!");
      } else {
        const res = await createPopup(payload).unwrap();
        targetId = res.data.id;
        toast.success("New popup created successfully!");
      }

      if (targetId && imageFile) {
        try {
          await uploadImage({ id: targetId, file: imageFile }).unwrap();
          toast.success("Banner image uploaded successfully!");
        } catch {
          toast.error("Failed to upload image file.");
        }
      }

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save popup.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Promo Popup: ${popup?.title}` : "Create Promotional Popup Modal"}
          </DialogTitle>
          <DialogDescription>
            Show high-converting discount vouchers, newsletter popups, or flash sale announcements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Popup Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🎉 Get FLAT 15% OFF On Your First Order!"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Offer Message & Promo Details
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Use coupon code WELCOME15 at checkout to enjoy instant 15% discount. Valid for all new customers."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="buttonText" className="text-xs font-semibold">
                Action Button Text
              </Label>
              <Input
                id="buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Claim 15% Discount"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buttonUrl" className="text-xs font-semibold">
                Destination Link URL
              </Label>
              <Input
                id="buttonUrl"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="e.g. /products or /checkout"
              />
            </div>
          </div>

          {/* Banner Graphic */}
          <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2">
            <Label htmlFor="imageUrl" className="text-xs font-semibold flex items-center gap-1.5">
              <ImageIcon className="size-4 text-primary" /> Promotional Image Banner (Optional)
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/promo-banner.jpg"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="shrink-0 font-medium">Or upload file:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-semibold"
              />
            </div>
          </div>

          {/* Trigger Condition & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border bg-card">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trigger Display Mode</Label>
              <select
                value={displayType}
                onChange={(e) => setDisplayType(e.target.value as PopupDisplayType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="AFTER_DELAY">After Delay (Seconds on page)</option>
                <option value="ON_LOAD">Immediate on Page Load</option>
                <option value="EXIT_INTENT">Exit Intent (When cursor leaves page)</option>
              </select>
            </div>

            {displayType === "AFTER_DELAY" && (
              <div className="space-y-1.5">
                <Label htmlFor="delaySeconds" className="text-xs font-semibold">
                  Delay Before Showing (Seconds)
                </Label>
                <Input
                  id="delaySeconds"
                  type="number"
                  min={1}
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Display Frequency</Label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PopupFrequency)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="ONCE">Once (Customer sees it only once)</option>
                <option value="DAILY">Daily (Max once every 24 hours)</option>
                <option value="ALWAYS">Always (On every visit)</option>
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" className="text-xs font-semibold">
                Start Date (Optional)
              </Label>
              <Input
                id="startsAt"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endsAt" className="text-xs font-semibold">
                End Date (Optional)
              </Label>
              <Input
                id="endsAt"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div>
              <p className="text-xs font-bold text-foreground">Active Status</p>
              <p className="text-[11px] text-muted-foreground">
                Enable or disable this popup from appearing on the storefront.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Update Popup" : "Create Popup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
