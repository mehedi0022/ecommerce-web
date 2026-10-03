import { blankVariant, type AttributeOption, type VariantRow } from "./editor.types";
import { selectedValues, variantEntered } from "./editor-workflow";

export function duplicateSelection(rows: VariantRow[], key: string, selections: Record<number, number>) {
  const signature = Object.values(selections).filter(Boolean).sort((a, b) => a - b).join(",");
  return rows.some(row => row.key !== key && variantEntered(row) && selectedValues(row).join(",") === signature);
}
export function generateVariants(attributes: AttributeOption[], existing: VariantRow[], skuPrefix: string, key: () => string = () => crypto.randomUUID()): VariantRow[] {
  if (!attributes.length) throw new Error("Assign attributes to the category before generating variants.");
  if (attributes.some(attr => !attr.values.length)) throw new Error("Every attribute needs an active value before generating combinations.");
  const count = attributes.reduce((n, attr) => n * attr.values.length, 1);
  if (count > 200) throw new Error(`This creates ${count} combinations. Generate at most 200 combinations at a time by reducing the category's active values.`);
  let combinations: Record<number, number>[] = [{}];
  for (const attr of attributes) combinations = combinations.flatMap(row => attr.values.map(value => ({ ...row, [attr.id]: value.id })));
  const kept = existing.filter(variantEntered); const skus = new Set(kept.map(row => row.sku));
  const prefix = skuPrefix.trim().replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 40).toUpperCase() || "PRODUCT";
  const template = existing.find(row => row.price !== "");
  for (const selections of combinations) {
    if (duplicateSelection(kept, "", selections)) continue;
    let sku = `${prefix}-${Object.values(selections).join("-")}`.slice(0, 90); let suffix = 1; const base = sku;
    while (skus.has(sku)) sku = `${base}-${suffix++}`;
    skus.add(sku);
    kept.push({ ...blankVariant(key()), selections, sku, price: template?.price ?? "", compareAtPrice: template?.compareAtPrice ?? "", costPrice: template?.costPrice ?? "" });
  }
  return kept;
}
