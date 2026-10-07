"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Calendar,
  Loader2,
  Clock,
  Zap,
  Repeat,
  CheckCircle2,
  X,
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useListAdminPopupsQuery,
  useUpdatePopupStatusMutation,
  useDeletePopupMutation,
} from "../../popupApi";
import { PopupFormDialog } from "./PopupFormDialog";
import type { Popup } from "../../types";

export function AdminPopupsManagement() {
  const [activeOnly, setActiveOnly] = useState<"true" | "false">("false");
  const { data, isLoading } = useListAdminPopupsQuery({
    activeOnly: activeOnly === "true" ? "true" : undefined,
  });

  const [updateStatus] = useUpdatePopupStatusMutation();
  const [deletePopup, { isLoading: isDeleting }] = useDeletePopupMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);

  const popups = data?.data || [];

  const handleCreate = () => {
    setSelectedPopup(null);
    setIsFormOpen(true);
  };

  const handleEdit = (popup: Popup) => {
    setSelectedPopup(popup);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (popup: Popup) => {
    try {
      await updateStatus({
        id: popup.id,
        isActive: !popup.isActive,
      }).unwrap();
      toast.success(
        `Popup "${popup.title}" ${!popup.isActive ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Permanently delete promo popup "${title}"?`)) {
      try {
        await deletePopup(id).unwrap();
        toast.success("Popup deleted successfully.");
      } catch {
        toast.error("Failed to delete popup.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            Promotional Popups & Modals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Display welcome discounts, exit-intent offers, and flash coupon announcements to visitors.
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
              All Popups ({popups.length})
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
            <Plus className="size-4" /> Create Popup
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm">Loading promo popups...</span>
        </div>
      ) : popups.length === 0 ? (
        <Card className="border-dashed py-12 text-center shadow-xs">
          <CardContent className="space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No Popups Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create an exit-intent or delayed welcome modal to convert visiting shoppers into buyers.
            </p>
            <Button onClick={handleCreate} size="sm" className="mt-2">
              <Plus className="size-4 mr-1.5" /> Create First Popup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popups.map((popup) => (
            <Card
              key={popup.id}
              className={`overflow-hidden shadow-xs border transition-all hover:shadow-md ${
                !popup.isActive ? "opacity-75 bg-muted/20" : "bg-card"
              }`}
            >
              {/* Graphic Banner */}
              {popup.imageUrl && (
                <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden border-b">
                  <img
                    src={popup.imageUrl}
                    alt={popup.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge
                      variant={popup.isActive ? "default" : "secondary"}
                      className="text-[10px] font-bold shadow-xs"
                    >
                      {popup.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                {!popup.imageUrl && (
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={popup.isActive ? "default" : "secondary"}
                      className="text-[10px] font-bold"
                    >
                      {popup.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-sm tracking-tight line-clamp-1">
                    {popup.title}
                  </h3>
                  {popup.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {popup.description}
                    </p>
                  )}
                </div>

                {/* Trigger & Frequency Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    <Zap className="size-3" />
                    {popup.displayType === "ON_LOAD"
                      ? "On Load"
                      : popup.displayType === "EXIT_INTENT"
                      ? "Exit Intent"
                      : `After ${popup.delaySeconds}s`}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                    <Repeat className="size-3 text-muted-foreground" />
                    {popup.frequency}
                  </span>
                </div>

                {/* Button Action */}
                {popup.buttonText && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <ExternalLink className="size-3" />
                    <span className="truncate">
                      {popup.buttonText} ➔ {popup.buttonUrl || "/"}
                    </span>
                  </div>
                )}

                {/* Scheduling */}
                {(popup.startsAt || popup.endsAt) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t">
                    <Calendar className="size-3 text-primary shrink-0" />
                    <span>
                      {popup.startsAt ? new Date(popup.startsAt).toLocaleDateString() : "Anytime"}
                      {" - "}
                      {popup.endsAt ? new Date(popup.endsAt).toLocaleDateString() : "Permanent"}
                    </span>
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setPreviewPopup(popup)}
                  >
                    <Eye className="size-3" /> Test Preview
                  </Button>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={popup.isActive}
                      onCheckedChange={() => handleToggleStatus(popup)}
                      title="Toggle active status"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(popup)}
                      title="Edit popup"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(popup.id, popup.title)}
                      title="Delete popup"
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

      {/* Edit/Create Form Dialog */}
      <PopupFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        popup={selectedPopup}
      />

      {/* Interactive Customer Preview Modal */}
      {previewPopup && (
        <Dialog open={Boolean(previewPopup)} onOpenChange={() => setPreviewPopup(null)}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 shadow-2xl">
            {previewPopup.imageUrl && (
              <div className="relative aspect-[16/9] w-full bg-muted">
                <img
                  src={previewPopup.imageUrl}
                  alt={previewPopup.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {previewPopup.title}
                </h2>
                {previewPopup.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {previewPopup.description}
                  </p>
                )}
              </div>

              {previewPopup.buttonText && (
                <Button className="w-full font-bold shadow-md h-11" size="lg">
                  {previewPopup.buttonText}
                </Button>
              )}

              <p className="text-[11px] text-muted-foreground">
                [Preview Mode: Triggered by {previewPopup.displayType}, Frequency: {previewPopup.frequency}]
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
