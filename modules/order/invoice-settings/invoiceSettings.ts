"use client";

export type ShippingLabelSize = "A4" | "4x6" | "80mm";

export interface InvoiceSettings {
  // Store Identity
  storeName: string;
  storeTagline: string;
  logoUrl?: string;
  binNumber: string;

  // Contact & Return Address
  storeAddress: string;
  supportPhone: string;
  supportEmail: string;
  websiteUrl: string;

  // Invoice Specific Settings
  termsAndConditions: string;
  footerNote: string;
  showCustomerSignature: boolean;
  showAuthorizedSignature: boolean;

  // Shipping Label Specific Settings
  defaultLabelSize: ShippingLabelSize;
  defaultDispatchNote: string;
  showMerchantReturn: boolean;
  showItemsSummary: boolean;
  showBarcodes: boolean;
}

export const STORAGE_KEY = "ecom_store_invoice_settings_v1";
export const SETTINGS_CHANGE_EVENT = "ecom_invoice_settings_changed";

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  storeName: "NEXTGEN STORE",
  storeTagline: "Official Order Invoice & Delivery Packing Slip",
  logoUrl: "",
  binNumber: "002948192-0102",

  storeAddress: "House #12, Road #4, Dhanmondi, Dhaka - 1205, Bangladesh",
  supportPhone: "+880 1876-346433",
  supportEmail: "support@nextgen-shop.com",
  websiteUrl: "www.nextgen-shop.com",

  termsAndConditions: `1. Please inspect the parcel and verify all items in front of the delivery agent.
2. If any discrepancy or damaged product is found, please notify customer support within 24 hours.
3. Retain this invoice copy for warranty claims and hassle-free exchange.`,
  footerNote: "This is a computer-generated tax invoice and packing slip. No physical stamp required.",
  showCustomerSignature: true,
  showAuthorizedSignature: true,

  defaultLabelSize: "A4",
  defaultDispatchNote: "FRAGILE - HANDLE WITH CARE",
  showMerchantReturn: true,
  showItemsSummary: true,
  showBarcodes: true,
};

export function getInvoiceSettings(): InvoiceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_INVOICE_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INVOICE_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INVOICE_SETTINGS, ...parsed };
  } catch (err) {
    console.error("Failed to parse invoice settings from localStorage:", err);
    return DEFAULT_INVOICE_SETTINGS;
  }
}

export function saveInvoiceSettings(
  updated: Partial<InvoiceSettings>
): InvoiceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_INVOICE_SETTINGS;
  }
  try {
    const current = getInvoiceSettings();
    const merged = { ...current, ...updated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(
      new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: merged })
    );
    return merged;
  } catch (err) {
    console.error("Failed to save invoice settings to localStorage:", err);
    return DEFAULT_INVOICE_SETTINGS;
  }
}

export function resetInvoiceSettings(): InvoiceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_INVOICE_SETTINGS;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(SETTINGS_CHANGE_EVENT, {
        detail: DEFAULT_INVOICE_SETTINGS,
      })
    );
    return DEFAULT_INVOICE_SETTINGS;
  } catch (err) {
    console.error("Failed to reset invoice settings:", err);
    return DEFAULT_INVOICE_SETTINGS;
  }
}
