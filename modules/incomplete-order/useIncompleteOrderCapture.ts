"use client";

import { useEffect, useRef } from "react";
import { useCaptureIncompleteOrderMutation } from "./incompleteOrderApi";
import type { IncompleteCartItem, IncompleteOrderAddress } from "./types";

interface UseIncompleteOrderCaptureParams {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  shippingAddress?: IncompleteOrderAddress | null;
  cartItems: IncompleteCartItem[];
  subtotal?: number | string;
  shippingFee?: number | string;
  totalAmount?: number | string;
  source?: string;
  enabled?: boolean;
}

export function useIncompleteOrderCapture({
  customerName,
  customerPhone,
  customerEmail,
  shippingAddress,
  cartItems,
  subtotal,
  shippingFee,
  totalAmount,
  source = "CHECKOUT",
  enabled = true,
}: UseIncompleteOrderCaptureParams) {
  const [captureMutation] = useCaptureIncompleteOrderMutation();
  const sessionRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      let s = sessionStorage.getItem("incomplete_order_session");
      if (!s) {
        s = "ios_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
        sessionStorage.setItem("incomplete_order_session", s);
      }
      sessionRef.current = s;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const cleanPhone = (customerPhone || "").trim().replace(/[^0-9]/g, "");

    // Must have at least a valid phone number (11 digits for BD) and items in cart
    if (!cleanPhone || cleanPhone.length < 11 || cartItems.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      const sessionId = sessionRef.current || ("ios_" + Date.now());
      void captureMutation({
        sessionId,
        customerName: customerName?.trim() || null,
        customerPhone: cleanPhone,
        customerEmail: customerEmail?.trim() || null,
        shippingAddress: shippingAddress || null,
        cartItems,
        subtotal: subtotal !== undefined ? String(subtotal) : "0",
        shippingFee: shippingFee !== undefined ? String(shippingFee) : "0",
        totalAmount: totalAmount !== undefined ? String(totalAmount) : "0",
        source,
      })
        .unwrap()
        .catch(() => {
          // Silent background capture; never interrupt the user
        });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress?.district,
    shippingAddress?.addressLine1,
    shippingAddress?.division,
    shippingAddress?.upazila,
    cartItems,
    subtotal,
    shippingFee,
    totalAmount,
    source,
    enabled,
    captureMutation,
  ]);
}
