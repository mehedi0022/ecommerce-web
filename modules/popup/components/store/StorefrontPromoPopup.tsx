"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useListPublicPopupsQuery } from "../../popupApi";
import type { Popup } from "../../types";

export function StorefrontPromoPopup() {
  const { data } = useListPublicPopupsQuery();
  const popups = data?.data || [];

  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (popups.length === 0 || isOpen) return;

    // Find the first eligible popup based on frequency constraints
    const now = Date.now();

    const eligible = popups.find((p) => {
      if (!p.isActive) return false;

      // Schedule check
      if (p.startsAt && new Date(p.startsAt).getTime() > now) return false;
      if (p.endsAt && new Date(p.endsAt).getTime() < now) return false;

      // Frequency check
      if (p.frequency === "ONCE") {
        const seen = localStorage.getItem(`ecom_popup_seen_${p.id}`);
        if (seen) return false;
      } else if (p.frequency === "DAILY") {
        const lastSeen = localStorage.getItem(`ecom_popup_time_${p.id}`);
        if (lastSeen) {
          const diff = now - Number(lastSeen);
          if (diff < 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });

    if (!eligible) return;

    let timer: NodeJS.Timeout | null = null;

    if (eligible.displayType === "ON_LOAD") {
      timer = setTimeout(() => {
        setActivePopup(eligible);
        setIsOpen(true);
      }, 600);
    } else if (eligible.displayType === "AFTER_DELAY") {
      const delayMs = Math.max(1, eligible.delaySeconds || 3) * 1000;
      timer = setTimeout(() => {
        setActivePopup(eligible);
        setIsOpen(true);
      }, delayMs);
    } else if (eligible.displayType === "EXIT_INTENT") {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 20) {
          setActivePopup(eligible);
          setIsOpen(true);
          document.removeEventListener("mouseleave", handleMouseLeave);
        }
      };

      document.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [popups, isOpen]);

  const handleDismiss = () => {
    if (activePopup) {
      if (activePopup.frequency === "ONCE") {
        localStorage.setItem(`ecom_popup_seen_${activePopup.id}`, "true");
      } else if (activePopup.frequency === "DAILY") {
        localStorage.setItem(`ecom_popup_time_${activePopup.id}`, String(Date.now()));
      }
    }
    setIsOpen(false);
  };

  if (!activePopup || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 shadow-2xl rounded-2xl bg-card">
        {activePopup.imageUrl && (
          <div className="relative aspect-[16/9] w-full bg-neutral-900 overflow-hidden">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Special Offer
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-snug">
              {activePopup.title}
            </h2>
            {activePopup.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {activePopup.description}
              </p>
            )}
          </div>

          <div className="pt-2 space-y-2">
            {activePopup.buttonText && (
              <Link
                href={activePopup.buttonUrl || "/products"}
                onClick={handleDismiss}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                {activePopup.buttonText} <ArrowRight className="size-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition underline cursor-pointer pt-1"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
