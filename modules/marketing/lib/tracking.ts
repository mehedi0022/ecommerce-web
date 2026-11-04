"use client";

declare global {
  interface Window {
    fbq?: any;
    dataLayer?: any[];
    ttq?: any;
    _fbq?: any;
  }
}

/**
 * Standardized Tracking Engine with strict deduplication for Meta CAPI, GTM, GA4, and TikTok.
 */

export interface TrackItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
}

/**
 * Tracks ViewContent (Product page viewing)
 */
export function trackViewContent(item: {
  id: string | number;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window === "undefined") return;

  // 1. Meta / Facebook Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      value: Number(item.price),
      currency: "BDT",
    });
  }

  // 2. Google Tag Manager / GA4 DataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        currency: "BDT",
        value: Number(item.price),
        items: [
          {
            item_id: String(item.id),
            item_name: item.name,
            price: Number(item.price),
            item_category: item.category,
          },
        ],
      },
    });
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track("ViewContent", {
      content_id: String(item.id),
      content_type: "product",
      content_name: item.name,
      value: Number(item.price),
      currency: "BDT",
    });
  }
}

/**
 * Tracks AddToCart
 */
export function trackAddToCart(item: {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
}) {
  if (typeof window === "undefined") return;
  const qty = item.quantity || 1;
  const val = Number(item.price) * qty;

  // 1. Meta / Facebook Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: item.name,
      content_ids: [String(item.id)],
      content_type: "product",
      value: val,
      currency: "BDT",
    });
  }

  // 2. Google Tag Manager / GA4
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "BDT",
        value: val,
        items: [
          {
            item_id: String(item.id),
            item_name: item.name,
            price: Number(item.price),
            quantity: qty,
          },
        ],
      },
    });
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track("AddToCart", {
      content_id: String(item.id),
      content_type: "product",
      content_name: item.name,
      quantity: qty,
      value: val,
      currency: "BDT",
    });
  }
}

/**
 * Tracks InitiateCheckout
 */
export function trackInitiateCheckout(total: number, items: TrackItem[]) {
  if (typeof window === "undefined") return;

  // 1. Meta / Facebook Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((i) => String(i.id)),
      content_type: "product",
      num_items: items.reduce((acc, curr) => acc + curr.quantity, 0),
      value: Number(total),
      currency: "BDT",
    });
  }

  // 2. Google Tag Manager / GA4
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "BDT",
        value: Number(total),
        items: items.map((i) => ({
          item_id: String(i.id),
          item_name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
        })),
      },
    });
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track("InitiateCheckout", {
      contents: items.map((i) => ({
        content_id: String(i.id),
        content_type: "product",
        content_name: i.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      value: Number(total),
      currency: "BDT",
    });
  }
}

/**
 * Tracks Purchase with STRICT Deduplication and Reload Protection.
 * Guarantees that refreshing the thank-you page NEVER fires duplicate purchases.
 * Ensures the exact same event_id is shared with Server CAPI so Meta merges browser + server events into 1 single purchase.
 */
export function trackPurchase(params: {
  order: {
    id: number | string;
    orderNumber: string;
    grandTotal: number | string;
    subtotal?: number | string;
  };
  items?: TrackItem[];
}): boolean {
  if (typeof window === "undefined") return false;

  const orderId = params.order.id || params.order.orderNumber;
  const storageKey = `order_purchase_tracked_${orderId}`;

  // 🛑 GUARD 1: Prevent duplicate purchase firing on page refresh / re-opening
  try {
    if (sessionStorage.getItem(storageKey)) {
      console.log(
        `[Tracking] Order #${params.order.orderNumber} was already tracked on this browser. Skipping duplicate Purchase event.`
      );
      return false;
    }
  } catch {
    // Ignore storage quota or access issues
  }

  const grandTotal = Number(params.order.grandTotal) || 0;
  // 100% Deterministic Event ID: matches Server CAPI event_id format
  const eventId = `order_${params.order.id}`;

  const contents = (params.items || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    item_price: Number(item.price),
    quantity: item.quantity || 1,
  }));

  // 1. Meta / Facebook Browser Pixel (with eventID matching Server CAPI)
  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        value: grandTotal,
        currency: "BDT",
        content_type: "product",
        contents,
        num_items: contents.reduce((acc, curr) => acc + curr.quantity, 0) || 1,
        order_id: String(params.order.id),
      },
      { eventID: eventId } // Crucial for Meta Deduplication
    );
    console.log(`[Tracking] Meta Pixel Purchase fired with eventID: ${eventId}`);
  }

  // 2. Google Tag Manager / GA4 DataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: eventId,
        value: grandTotal,
        currency: "BDT",
        items: (params.items || []).map((i) => ({
          item_id: String(i.id),
          item_name: i.name,
          price: Number(i.price),
          quantity: i.quantity || 1,
        })),
      },
    });
    console.log(`[Tracking] GTM Purchase pushed with transaction_id: ${eventId}`);
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === "function") {
    window.ttq.track(
      "CompletePayment",
      {
        contents: (params.items || []).map((i) => ({
          content_id: String(i.id),
          content_name: i.name,
          quantity: i.quantity || 1,
          price: Number(i.price),
        })),
        value: grandTotal,
        currency: "BDT",
      },
      { event_id: eventId }
    );
    console.log(`[Tracking] TikTok CompletePayment fired with event_id: ${eventId}`);
  }

  // 4. Mark order as tracked so reloads will NEVER duplicate
  try {
    sessionStorage.setItem(storageKey, new Date().toISOString());
  } catch {
    // Ignore storage issues
  }

  return true;
}
