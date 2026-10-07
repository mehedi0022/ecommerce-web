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
import { Loader2, Upload, ImageIcon, Link as LinkIcon, Calendar } from "lucide-react";
import {
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useUploadSliderImageMutation,
  useUploadSliderMobileImageMutation,
} from "../../sliderApi";
import type { Slider, CreateSliderInput } from "../../types";

interface SliderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slider?: Slider | null;
}

export function SliderFormDialog({
  open,
  onOpenChange,
  slider,
}: SliderFormDialogProps) {
  const [createSlider, { isLoading: isCreating }] = useCreateSliderMutation();
  const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadSliderImageMutation();
  const [uploadMobileImage, { isLoading: isUploadingMobile }] = useUploadSliderMobileImageMutation();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

  const isEditing = Boolean(slider);
  const isLoading = isCreating || isUpdating || isUploadingImage || isUploadingMobile;

  useEffect(() => {
    if (slider) {
      setTitle(slider.title || "");
      setSubtitle(slider.subtitle || "");
      setImageUrl(slider.imageUrl || "");
      setMobileImage(slider.mobileImage || "");
      setButtonText(slider.buttonText || "");
      setButtonUrl(slider.buttonUrl || "");
      setIsActive(slider.isActive ?? true);
      setSortOrder(slider.sortOrder ?? 0);
      setStartsAt(slider.startsAt ? slider.startsAt.split("T")[0] : "");
      setEndsAt(slider.endsAt ? slider.endsAt.split("T")[0] : "");
    } else {
      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setMobileImage("");
      setButtonText("Shop Now");
      setButtonUrl("/products");
      setIsActive(true);
      setSortOrder(0);
      setStartsAt("");
      setEndsAt("");
    }
    setDesktopFile(null);
    setMobileFile(null);
  }, [slider, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a slider title.");
      return;
    }

    try {
      const payload: CreateSliderInput = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        imageUrl: imageUrl.trim() || null,
        mobileImage: mobileImage.trim() || null,
        buttonText: buttonText.trim() || null,
        buttonUrl: buttonUrl.trim() || null,
        isActive,
        sortOrder: Number(sortOrder) || 0,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      };

      let targetId = slider?.id;

      if (isEditing && slider) {
        await updateSlider({ id: slider.id, data: payload }).unwrap();
        toast.success("Slider updated successfully!");
      } else {
        const res = await createSlider(payload).unwrap();
        targetId = res.data.id;
        toast.success("New slider created successfully!");
      }

      // If local files were selected for upload:
      if (targetId && desktopFile) {
        try {
          await uploadImage({ id: targetId, file: desktopFile }).unwrap();
          toast.success("Desktop image uploaded successfully!");
        } catch {
          toast.error("Failed to upload desktop image file.");
        }
      }

      if (targetId && mobileFile) {
        try {
          await uploadMobileImage({ id: targetId, file: mobileFile }).unwrap();
          toast.success("Mobile image uploaded successfully!");
        } catch {
          toast.error("Failed to upload mobile image file.");
        }
      }

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save slider.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Slider: ${slider?.title}` : "Create Promotional Banner / Slider"}
          </DialogTitle>
          <DialogDescription>
            Configure high-converting hero sliders, sale banners, and links for your storefront.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Banner Headline / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mega Summer Flash Sale 2026"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle" className="text-xs font-semibold">
              Subtitle / Description
            </Label>
            <Textarea
              id="subtitle"
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Up to 40% OFF on premium headphones and lifestyle essentials."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="buttonText" className="text-xs font-semibold">
                CTA Button Text
              </Label>
              <Input
                id="buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Shop Flash Deals"
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
                placeholder="e.g. /products or /category/electronics"
              />
            </div>
          </div>

          {/* Image Settings */}
          <div className="p-3.5 rounded-xl border bg-muted/30 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ImageIcon className="size-4 text-primary" /> Desktop & Mobile Banners
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs">
                Desktop Banner Image (1600 × 600px recommended)
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/desktop-banner.jpg"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 font-medium">Or upload file:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="mobileImage" className="text-xs">
                Mobile Banner Image (800 × 800px or 4:3 recommended)
              </Label>
              <Input
                id="mobileImage"
                value={mobileImage}
                onChange={(e) => setMobileImage(e.target.value)}
                placeholder="https://example.com/mobile-banner.jpg"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 font-medium">Or upload file:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            <div className="space-y-1.5">
              <Label htmlFor="sortOrder" className="text-xs font-semibold">
                Sort Order (Index)
              </Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div>
              <p className="text-xs font-bold text-foreground">Slider Active Status</p>
              <p className="text-[11px] text-muted-foreground">
                Immediately show or hide this slider on the customer storefront.
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
              {isEditing ? "Update Slider" : "Create Slider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
