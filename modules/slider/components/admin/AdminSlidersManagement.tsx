"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sliders,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Calendar,
  MoveUp,
  MoveDown,
  Loader2,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  useListAdminSlidersQuery,
  useUpdateSliderStatusMutation,
  useReorderSliderMutation,
  useDeleteSliderMutation,
} from "../../sliderApi";
import { SliderFormDialog } from "./SliderFormDialog";
import type { Slider } from "../../types";

export function AdminSlidersManagement() {
  const [activeOnly, setActiveOnly] = useState<"true" | "false">("false");
  const { data, isLoading, refetch } = useListAdminSlidersQuery({
    activeOnly: activeOnly === "true" ? "true" : undefined,
  });

  const [updateStatus] = useUpdateSliderStatusMutation();
  const [reorderSlider] = useReorderSliderMutation();
  const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);

  const sliders = data?.data || [];

  const handleCreate = () => {
    setSelectedSlider(null);
    setIsFormOpen(true);
  };

  const handleEdit = (slider: Slider) => {
    setSelectedSlider(slider);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (slider: Slider) => {
    try {
      await updateStatus({
        id: slider.id,
        isActive: !slider.isActive,
      }).unwrap();
      toast.success(
        `Slider "${slider.title}" ${!slider.isActive ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleMoveOrder = async (slider: Slider, delta: number) => {
    const newOrder = Math.max(0, (slider.sortOrder || 0) + delta);
    try {
      await reorderSlider({ id: slider.id, sortOrder: newOrder }).unwrap();
      toast.success("Slider order updated.");
    } catch {
      toast.error("Failed to update order.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to permanently delete slider "${title}"?`)) {
      try {
        await deleteSlider(id).unwrap();
        toast.success("Slider deleted successfully.");
      } catch {
        toast.error("Failed to delete slider.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sliders className="size-6 text-primary" />
            Storefront Banners & Sliders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage dynamic homepage hero carousels, seasonal sale banners, and promotional links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border bg-background p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveOnly("false")}
              className={`px-3 py-1 rounded-md transition ${
                activeOnly === "false"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Sliders ({sliders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveOnly("true")}
              className={`px-3 py-1 rounded-md transition ${
                activeOnly === "true"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Only
            </button>
          </div>

          <Button onClick={handleCreate} size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" /> Add Slider
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm">Loading storefront banners...</span>
        </div>
      ) : sliders.length === 0 ? (
        <Card className="border-dashed py-12 text-center shadow-xs">
          <CardContent className="space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No Sliders Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your first interactive promotional slider to attract customers on the homepage.
            </p>
            <Button onClick={handleCreate} size="sm" className="mt-2">
              <Plus className="size-4 mr-1.5" /> Create First Slider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <Card
              key={slider.id}
              className={`overflow-hidden shadow-xs border transition-all hover:shadow-md ${
                !slider.isActive ? "opacity-70 bg-muted/20" : "bg-card"
              }`}
            >
              {/* Image Preview Banner */}
              <div className="relative aspect-[16/7] w-full bg-muted overflow-hidden border-b">
                {slider.imageUrl ? (
                  <img
                    src={slider.imageUrl}
                    alt={slider.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageIcon className="size-8" />
                    <span className="text-[11px]">No Banner Image</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge
                    variant={slider.isActive ? "default" : "secondary"}
                    className="text-[10px] font-bold shadow-xs"
                  >
                    {slider.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                  <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                    Order: #{slider.sortOrder}
                  </span>
                </div>

                {slider.mobileImage && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                    📱 Mobile Ready
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm tracking-tight line-clamp-1">
                    {slider.title}
                  </h3>
                  {slider.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {slider.subtitle}
                    </p>
                  )}
                </div>

                {/* Button Link */}
                {slider.buttonText && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <ExternalLink className="size-3" />
                    <span>
                      {slider.buttonText} ➔ {slider.buttonUrl || "/"}
                    </span>
                  </div>
                )}

                {/* Scheduling */}
                {(slider.startsAt || slider.endsAt) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t">
                    <Calendar className="size-3 text-primary shrink-0" />
                    <span>
                      {slider.startsAt ? new Date(slider.startsAt).toLocaleDateString() : "Anytime"}
                      {" - "}
                      {slider.endsAt ? new Date(slider.endsAt).toLocaleDateString() : "Permanent"}
                    </span>
                  </div>
                )}

                {/* Actions & Reordering Toolbar */}
                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => handleMoveOrder(slider, -1)}
                      title="Move up"
                    >
                      <MoveUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => handleMoveOrder(slider, 1)}
                      title="Move down"
                    >
                      <MoveDown className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slider.isActive}
                      onCheckedChange={() => handleToggleStatus(slider)}
                      title="Toggle active status"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(slider)}
                      title="Edit slider"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(slider.id, slider.title)}
                      title="Delete slider"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SliderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        slider={selectedSlider}
      />
    </div>
  );
}
