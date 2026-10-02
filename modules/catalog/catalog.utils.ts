import type { Category } from "@/modules/category/types";

export function flattenCategories(categories: Category[]): Array<Category & { depth: number; path: string; isLeaf: boolean }> {
  const result: Array<Category & { depth: number; path: string; isLeaf: boolean }> = [];
  const seen = new Set<number>();
  function visit(rows: Category[], depth: number, parents: string[]) {
    for (const row of rows) {
      if (seen.has(row.id)) continue; seen.add(row.id);
      const names = [...parents, row.name];
      result.push({ ...row, depth, path: row.path ?? names.join(" / "), isLeaf: row.isLeaf ?? !row.children?.length });
      visit(row.children ?? [], depth + 1, names);
    }
  }
  visit(categories, 0, []); return result;
}
export function eligibleParents(categories: Category[], id?: number) {
  if (!id) return categories;
  const excluded = new Set([id]); let changed = true;
  while (changed) { changed = false; for (const row of categories) if (row.parentId !== null && excluded.has(row.parentId) && !excluded.has(row.id)) { excluded.add(row.id); changed = true; } }
  return categories.filter(row => !excluded.has(row.id));
}
export function mediaUrl(value: string | null | undefined) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:")) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "")}${value}`;
  return "";
}
