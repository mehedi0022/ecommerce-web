import type { ProductInput, ProductStatus, VariantInput } from "./types";
import type { AttributeOption, EditorForm, EditorImage, EditorInitial, InventorySnapshot, SaveJournal, SaveProgress, VariantRow } from "./editor.types";

export const variantEntered = (row: VariantRow) => Boolean(row.id || row.sku.trim() || row.price || row.compareAtPrice || row.costPrice || Object.values(row.selections).some(Boolean) || row.stock !== "0");
export const selectedValues = (row: VariantRow) => Object.values(row.selections).filter(Boolean).sort((a, b) => a - b);
const money = (value: string) => /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(value);
const quantity = (value: string) => /^\d+$/.test(value) && Number(value) <= 2147483647;

export function validateEditor(form: EditorForm, attributes: AttributeOption[], target: ProductStatus): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Give your product a name.";
  if (form.name.trim().length > 250) errors.name = "Use 250 characters or fewer.";
  if (form.shortDescription.length > 500) errors.shortDescription = "Use 500 characters or fewer.";
  if (form.description.length > 10000) errors.description = "Use 10,000 characters or fewer.";
  if (form.requiresAdvancePayment && form.advancePaymentAmount) {
    if (!money(form.advancePaymentAmount) || Number(form.advancePaymentAmount) <= 0) {
      errors.advancePaymentAmount = "Enter a valid advance amount (e.g. 150.00).";
    }
  }
  const rows = form.variants.filter(variantEntered);
  if ((target === "ACTIVE" || rows.length) && !form.primaryCategoryId) errors.category = "Choose a primary category before adding variants.";
  if (target === "ACTIVE" && !rows.some(row => row.isActive)) errors.variants = "Add at least one active variant with a SKU and price.";
  const skus = new Set<string>();
  const combinations = new Set<string>();
  for (const row of rows) {
    const field = `variant-${row.key}`;
    if (!row.sku.trim() || row.sku.trim().length > 100) errors[`${field}-sku`] = "Enter a SKU (1–100 characters).";
    else if (skus.has(row.sku.trim())) errors[`${field}-sku`] = "Each variant needs a different SKU.";
    skus.add(row.sku.trim());
    if (!money(row.price)) errors[`${field}-price`] = "Enter a valid price with up to 2 decimal places.";
    if (row.compareAtPrice && (!money(row.compareAtPrice) || Number(row.compareAtPrice) < Number(row.price))) errors[`${field}-compareAtPrice`] = "Compare-at price must be at least the selling price.";
    if (row.costPrice && !money(row.costPrice)) errors[`${field}-costPrice`] = "Enter a valid cost with up to 2 decimal places.";
    if (!row.inventory && (!quantity(row.stock) || !quantity(row.threshold))) errors[`${field}-stock`] = "Stock and low-stock alert must be whole numbers, zero or more.";
    for (const attr of attributes) {
      const selection = row.selections[attr.id];
      if (attr.isRequired && !selection) errors[`${field}-attribute-${attr.id}`] = `Choose ${attr.name.toLowerCase()}.`;
      else if (selection && !attr.values.some(v => v.id === selection)) errors[`${field}-attribute-${attr.id}`] = `Choose an available ${attr.name.toLowerCase()}.`;
    }
    if (Object.entries(row.selections).some(([id, value]) => value && !attributes.some(a => a.id === Number(id)))) errors[`${field}-attributes`] = "This variant has options outside the primary category. Remove it or restore the category.";
    const combination = selectedValues(row).join(",");
    if (combinations.has(combination)) errors[`${field}-attributes`] = "This option combination already exists. Choose a different combination.";
    combinations.add(combination);
  }
  if (target === "ACTIVE" && !form.images.some(image => image.isPrimary && !image.attributeValueIds.length)) errors.images = "Choose a general product photo as the cover before publishing.";
  if (form.images.filter(image => image.isPrimary).length > 1) errors.images = "Choose only one cover photo.";
  for (const image of form.images) {
    if (image.altText.length > 500) errors.images = "Photo descriptions must be 500 characters or fewer.";
    if (image.isPrimary && image.attributeValueIds.length) errors.images = "The cover must be a general product photo.";
    if (image.attributeValueIds.length && !rows.some(row => image.attributeValueIds.every(id => selectedValues(row).includes(id)))) errors.images = "A photo is linked to a variant that no longer exists. Choose another variant or make it a general photo.";
  }
  return errors;
}

export interface SaveOperations {
  createProduct(body: ProductInput): Promise<{ id: number }>;
  updateProduct(id: number, body: Partial<ProductInput>): Promise<unknown>;
  createVariant(productId: number, body: VariantInput): Promise<{ id: number }>;
  updateVariant(productId: number, id: number, body: VariantInput): Promise<unknown>;
  deleteVariant(productId: number, id: number): Promise<unknown>;
  getInventory(id: number): Promise<InventorySnapshot | null>;
  initializeInventory(id: number, quantity: number, lowStockThreshold: number): Promise<InventorySnapshot>;
  uploadImage(productId: number, image: EditorImage, sortOrder: number): Promise<{ id: number }>;
  updateImage(productId: number, imageId: number, image: EditorImage, sortOrder: number): Promise<unknown>;
  deleteImage(productId: number, id: number): Promise<unknown>;
  setStatus(id: number, status: ProductStatus): Promise<unknown>;
}
const ambiguous = (error: unknown) => {
  const status = (error as { status?: number | string })?.status;
  return typeof status === "string" || typeof status === "number" && status >= 500;
};

/** Journal is updated immediately after each acknowledged write, before the next operation.
 * Unknown POST outcomes deliberately block replay; a human must reload/reconcile the saved record.
 */
export async function saveEditor(
  form: EditorForm, target: ProductStatus, journal: SaveJournal, initial: EditorInitial | undefined,
  api: SaveOperations, progress: (value: SaveProgress) => void, checkpoint: () => void,
) {
  if (journal.needsReview) throw new Error("The last request could not be confirmed. Review the saved product before making another save.");
  const rows = form.variants.filter(variantEntered);
  const details: ProductInput = {
    name: form.name.trim(), shortDescription: form.shortDescription.trim() || null, description: form.description.trim() || null,
    brandId: form.brandId ? Number(form.brandId) : null, isFeatured: form.isFeatured,
    isFreeShipping: form.isFreeShipping ?? false,
    isCodAvailable: form.isCodAvailable ?? true,
    requiresAdvancePayment: form.requiresAdvancePayment ?? false,
    advancePaymentAmount:
      form.requiresAdvancePayment && form.advancePaymentAmount
        ? Number(form.advancePaymentAmount)
        : null,
    categories: form.categoryIds.map((categoryId, sortOrder) => ({ categoryId, isPrimary: categoryId === Number(form.primaryCategoryId), sortOrder })),
  };
  const post = async <T,>(operation: () => Promise<T>): Promise<T> => {
    try { return await operation(); }
    catch (error) { if (ambiguous(error)) { journal.needsReview = true; checkpoint(); } throw error; }
  };
  progress({ step: "details", label: "Saving product details", completed: 0, total: 5 });
  const fingerprint = JSON.stringify(details);
  if (!journal.productId) {
    const created = await post(() => api.createProduct({ ...details, status: "DRAFT" }));
    journal.productId = created.id; journal.status = "DRAFT"; journal.details = fingerprint; checkpoint();
  } else if (journal.details !== fingerprint) {
    await api.updateProduct(journal.productId, details);
    journal.details = fingerprint; checkpoint();
  }
  const id = journal.productId;
  // Remove photos before variants, so their old attribute links do not outlive an explicitly removed row.
  const imageIds = new Set(form.images.map(image => image.id ?? journal.images[image.key]?.id));
  const knownImages = new Set([...(initial?.images.map(image => image.id) ?? []), ...Object.values(journal.images).map(image => image.id)]);
  for (const imageId of knownImages) if (!imageIds.has(imageId) && !journal.removedImages.includes(imageId)) {
    await api.deleteImage(id, imageId); journal.removedImages.push(imageId); checkpoint();
  }
  progress({ step: "variants", label: "Saving variants", completed: 1, total: 5 });
  const variantIds = new Set(rows.map(row => row.id ?? journal.variants[row.key]?.id));
  const knownVariants = new Set([...(initial?.variants.map(row => row.id) ?? []), ...Object.values(journal.variants).map(row => row.id)]);
  for (const variantId of knownVariants) if (!variantIds.has(variantId) && !journal.removedVariants.includes(variantId)) {
    await api.deleteVariant(id, variantId); journal.removedVariants.push(variantId); checkpoint();
  }
  for (const [sortOrder, row] of rows.entries()) {
    const body: VariantInput = { sku: row.sku.trim(), price: Number(row.price), compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null, costPrice: row.costPrice ? Number(row.costPrice) : null, isActive: row.isActive, sortOrder, attributeValueIds: selectedValues(row) };
    const fingerprint = JSON.stringify(body);
    const saved = journal.variants[row.key] ?? (row.id ? { id: row.id } : undefined);
    if (saved?.fingerprint === fingerprint) continue;
    if (saved) await api.updateVariant(id, saved.id, body);
    else {
      const created = await post(() => api.createVariant(id, body));
      journal.variants[row.key] = { id: created.id }; checkpoint();
    }
    journal.variants[row.key] = { id: saved?.id ?? journal.variants[row.key].id, fingerprint }; checkpoint();
  }
  progress({ step: "inventory", label: "Setting up opening stock", completed: 2, total: 5 });
  for (const row of rows) {
    if (row.inventory || journal.stock[row.key]) continue;
    const variantId = journal.variants[row.key].id;
    // Read first: a previous initialization may have committed before its response was lost.
    const existing = await api.getInventory(variantId);
    if (existing) journal.stock[row.key] = existing;
    else {
      try { journal.stock[row.key] = await api.initializeInventory(variantId, Number(row.stock), Number(row.threshold)); }
      catch (error) {
        const reconciled = await api.getInventory(variantId).catch(() => null);
        if (!reconciled) throw error;
        journal.stock[row.key] = reconciled;
      }
    }
    checkpoint();
  }
  progress({ step: "images", label: "Saving product photos", completed: 3, total: 5 });
  // Save the cover last; changing it cannot be undone by a later metadata update.
  const ordered = form.images.map((image, sortOrder) => ({ image, sortOrder })).sort((a, b) => Number(a.image.isPrimary) - Number(b.image.isPrimary));
  for (const { image, sortOrder } of ordered) {
    const fingerprint = JSON.stringify([image.altText, image.isPrimary, image.attributeValueIds, sortOrder]);
    const saved = journal.images[image.key] ?? (image.id ? { id: image.id } : undefined);
    if (saved?.fingerprint === fingerprint) continue;
    if (saved) await api.updateImage(id, saved.id, image, sortOrder);
    else {
      const created = await post(() => api.uploadImage(id, image, sortOrder));
      journal.images[image.key] = { id: created.id }; checkpoint();
    }
    journal.images[image.key] = { id: saved?.id ?? journal.images[image.key].id, fingerprint }; checkpoint();
  }
  progress({ step: "publish", label: target === "ACTIVE" ? "Publishing product" : "Finishing your save", completed: 4, total: 5 });
  if (journal.status !== target) { await api.setStatus(id, target); journal.status = target; checkpoint(); }
  progress({ step: "publish", label: target === "ACTIVE" ? "Product published" : "Product saved", completed: 5, total: 5 });
  return id;
}
