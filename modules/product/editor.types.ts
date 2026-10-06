import type { Product, ProductImage, ProductStatus, ProductVariant } from "./types";

export interface InventorySnapshot { quantity: number; reservedQuantity: number; availableQuantity: number; lowStockThreshold: number }
export interface EditorInitial { product: Product; variants: ProductVariant[]; images: ProductImage[]; inventory: Record<number, InventorySnapshot | null> }
export interface AttributeOption { id: number; name: string; isRequired: boolean; values: { id: number; value: string }[] }
export interface VariantRow {
  key: string; id?: number; sku: string; price: string; compareAtPrice: string; costPrice: string;
  selections: Record<number, number>; isActive: boolean; stock: string; threshold: string;
  inventory?: InventorySnapshot;
}
export interface EditorImage {
  key: string; id?: number; file?: File; url: string; altText: string; isPrimary: boolean; attributeValueIds: number[];
}
export interface EditorForm {
  name: string; shortDescription: string; description: string; brandId: string;
  categoryIds: number[]; primaryCategoryId: string; isFeatured: boolean; status: ProductStatus;
  isFreeShipping: boolean;
  isCodAvailable: boolean;
  requiresAdvancePayment: boolean;
  advancePaymentAmount: string;
  variants: VariantRow[]; images: EditorImage[];
}
export type SaveStep = "details" | "variants" | "inventory" | "images" | "publish";
export interface SaveProgress { step: SaveStep; label: string; completed: number; total: number }
export interface SavedItem { id: number; fingerprint?: string }
export interface SaveJournal {
  productId?: number; details?: string; status?: ProductStatus;
  variants: Record<string, SavedItem>; images: Record<string, SavedItem>;
  stock: Record<string, InventorySnapshot>; removedVariants: number[]; removedImages: number[];
  needsReview?: boolean;
}

export const blankVariant = (key: string): VariantRow => ({ key, sku: "", price: "", compareAtPrice: "", costPrice: "", selections: {}, isActive: true, stock: "0", threshold: "5" });
export const newJournal = (initial?: EditorInitial): SaveJournal => ({ productId: initial?.product.id, status: initial?.product.status, variants: {}, images: {}, stock: {}, removedVariants: [], removedImages: [] });
export function initialForm(initial?: EditorInitial): EditorForm {
  const product = initial?.product;
  return {
    name: product?.name ?? "", shortDescription: product?.shortDescription ?? "", description: product?.description ?? "",
    brandId: product?.brandId ? String(product.brandId) : "", categoryIds: product?.categories.map(c => c.categoryId) ?? [],
    primaryCategoryId: String(product?.categories.find(c => c.isPrimary)?.categoryId ?? ""),
    isFeatured: product?.isFeatured ?? false, status: product?.status ?? "DRAFT",
    isFreeShipping: product?.isFreeShipping ?? false,
    isCodAvailable: product?.isCodAvailable ?? true,
    requiresAdvancePayment: product?.requiresAdvancePayment ?? false,
    advancePaymentAmount: product?.advancePaymentAmount != null ? String(product.advancePaymentAmount) : "",
    variants: initial?.variants.length ? initial.variants.map(v => ({
      key: `variant-${v.id}`, id: v.id, sku: v.sku, price: String(v.price), compareAtPrice: v.compareAtPrice ?? "", costPrice: v.costPrice ?? "",
      selections: Object.fromEntries((v.attributeValues ?? []).map(x => [x.attributeValue.attributeId, x.attributeValue.id])),
      isActive: v.isActive, stock: "0", threshold: "5", inventory: initial.inventory[v.id] ?? undefined,
    })) : [blankVariant("initial")],
    images: initial?.images.map(i => ({ key: `image-${i.id}`, id: i.id, url: i.imageUrl, altText: i.altText ?? "", isPrimary: i.isPrimary, attributeValueIds: i.attributeValues?.map(v => v.attributeValueId) ?? [] })) ?? [],
  };
}
