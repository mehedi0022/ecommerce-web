"use client";

import { useState, useMemo } from "react";
import {
  FolderTree,
  Folder,
  ChevronRight,
  Check,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Pencil,
  RotateCcw,
  Layers,
  Lock,
  Plus,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Category } from "@/modules/category/types";

export interface CategorySelectorProps {
  categories: Category[];
  primaryCategoryId: string;
  categoryIds: number[];
  disabled?: boolean;
  error?: string;
  onSelectPrimary: (categoryId: string) => void;
  onToggleAdditional: (categoryId: number) => void;
}

export function CategorySelector({
  categories,
  primaryCategoryId,
  categoryIds,
  disabled = false,
  error,
  onSelectPrimary,
  onToggleAdditional,
}: CategorySelectorProps) {
  // Cascader drill-down state: array of selected category IDs at each depth level
  const [selectedPathIds, setSelectedPathIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [additionalSearch, setAdditionalSearch] = useState("");

  // 1. Build lookup maps and hierarchy
  const categoriesById = useMemo(() => {
    return new Map<number, Category>(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Identify all categories that have at least one child (non-leaf)
  const parentIdSet = useMemo(() => {
    const set = new Set<number>();
    for (const c of categories) {
      if (c.parentId !== null && c.parentId !== undefined) {
        set.add(c.parentId);
      }
    }
    return set;
  }, [categories]);

  // Helper: check if a category is a leaf (no children)
  const isLeafNode = (id: number) => !parentIdSet.has(id);

  // Group children by parentId (null/undefined for root categories)
  const childrenByParent = useMemo(() => {
    const map = new Map<number | "root", Category[]>();
    for (const c of categories) {
      const key = c.parentId === null || c.parentId === undefined ? "root" : c.parentId;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    // Sort each group by sortOrder asc, then name asc
    for (const list of map.values()) {
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
    }
    return map;
  }, [categories]);

  // Helper: compute full breadcrumb path array for any category ID
  const getBreadcrumbs = (id: number): Category[] => {
    const path: Category[] = [];
    let curr = categoriesById.get(id);
    const visited = new Set<number>();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      path.unshift(curr);
      if (curr.parentId === null || curr.parentId === undefined) break;
      curr = categoriesById.get(curr.parentId);
    }
    return path;
  };

  // Currently selected primary category object
  const primaryCategory = useMemo(() => {
    if (!primaryCategoryId) return null;
    return categoriesById.get(Number(primaryCategoryId)) ?? null;
  }, [primaryCategoryId, categoriesById]);

  // Breadcrumbs for currently selected primary category
  const primaryBreadcrumbs = useMemo(() => {
    if (!primaryCategory) return [];
    return getBreadcrumbs(primaryCategory.id);
  }, [primaryCategory]);

  // Additional categories (excluding primary category)
  const additionalCategories = useMemo(() => {
    const primId = Number(primaryCategoryId);
    return categoryIds
      .filter((id) => id !== primId)
      .map((id) => categoriesById.get(id))
      .filter(Boolean) as Category[];
  }, [categoryIds, primaryCategoryId, categoriesById]);

  // Filtered search results for quick leaf finding
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return categories
      .filter((c) => {
        const fullPath = c.path ?? getBreadcrumbs(c.id).map((b) => b.name).join(" / ");
        return (
          c.name.toLowerCase().includes(q) ||
          fullPath.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
        );
      })
      .map((c) => ({
        category: c,
        isLeaf: isLeafNode(c.id),
        breadcrumbs: getBreadcrumbs(c.id),
      }))
      .slice(0, 15);
  }, [categories, searchQuery]);

  // Filtered list of categories for "Additional Categories" selection
  const filteredAdditionalOptions = useMemo(() => {
    const primId = Number(primaryCategoryId);
    const q = additionalSearch.toLowerCase().trim();
    return categories
      .filter((c) => c.id !== primId)
      .filter((c) => {
        if (!q) return true;
        const fullPath = c.path ?? getBreadcrumbs(c.id).map((b) => b.name).join(" / ");
        return c.name.toLowerCase().includes(q) || fullPath.toLowerCase().includes(q);
      });
  }, [categories, primaryCategoryId, additionalSearch]);

  // Handle drill-down node click
  const handleNodeClick = (category: Category, levelIndex: number) => {
    const isLeaf = isLeafNode(category.id);
    const nextPath = [...selectedPathIds.slice(0, levelIndex), category.id];
    setSelectedPathIds(nextPath);

    if (isLeaf) {
      // Reached leaf! Select as primary category
      onSelectPrimary(String(category.id));
      setIsChangingCategory(false);
      setSearchQuery("");
    }
  };

  // Determine cascading columns to display
  // Level 0: root categories
  // Level 1: children of selectedPathIds[0], etc.
  const cascadingLevels = useMemo(() => {
    const levels: { parentName: string; options: Category[] }[] = [];

    // Level 0: Roots
    const roots = childrenByParent.get("root") ?? [];
    levels.push({ parentName: "Main Departments", options: roots });

    // Levels 1..N based on selectedPathIds
    for (let i = 0; i < selectedPathIds.length; i++) {
      const parentId = selectedPathIds[i];
      const parentCat = categoriesById.get(parentId);
      const children = childrenByParent.get(parentId);
      if (children && children.length > 0) {
        levels.push({
          parentName: parentCat?.name ?? `Level ${i + 1}`,
          options: children,
        });
      }
    }

    return levels;
  }, [selectedPathIds, childrenByParent, categoriesById]);

  // Reset drill-down
  const handleResetDrillDown = () => {
    setSelectedPathIds([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* ── SECTION 1: PRIMARY CATEGORY SELECTION ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FolderTree className="size-3.5 text-primary" />
            <span>Primary Category</span>
            <span className="text-destructive">*</span>
          </label>

          {primaryCategory && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsChangingCategory(!isChangingCategory);
                handleResetDrillDown();
              }}
              className="h-7 text-xs text-primary hover:text-primary/80 gap-1 px-2"
            >
              <Pencil className="size-3" />
              {isChangingCategory ? "Keep Current" : "Change Category"}
            </Button>
          )}
        </div>

        {/* State A: Primary Category Already Selected & Not in Edit Mode */}
        {primaryCategory && !isChangingCategory ? (
          <div
            className={cn(
              "rounded-xl border bg-card p-3.5 shadow-2xs transition-all",
              disabled ? "border-muted bg-muted/20" : "border-emerald-500/30 bg-emerald-500/[0.02]"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Breadcrumb Path */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  {primaryBreadcrumbs.map((crumb, idx) => {
                    const isLast = idx === primaryBreadcrumbs.length - 1;
                    return (
                      <div key={crumb.id} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />}
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5",
                            isLast
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                              : "text-muted-foreground font-medium"
                          )}
                        >
                          {crumb.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Slug: <span className="font-mono">/{primaryCategory.slug}</span>
                  {" · "}
                  Variant attributes (Size, Color, etc.) are inherited from this category.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] gap-1 font-semibold"
                >
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Primary Leaf
                </Badge>

                {disabled && (
                  <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
                    <Lock className="size-2.5" />
                    Locked (Variants saved)
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* State B: No Category Selected OR User is Changing Category */
          <div className="rounded-xl border bg-card p-4 space-y-4 shadow-2xs">
            {/* Quick Search or Instructions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between border-b pb-3.5">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  Select a Leaf Category (Child Category)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Drill down step-by-step or search directly by name below.
                </p>
              </div>

              {/* Instant Search Box */}
              <div className="relative min-w-[220px] max-w-xs">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Quick search category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* View 1: Search Results (if typing in search) */}
            {searchQuery.trim() ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {searchResults.length > 0 ? (
                  searchResults.map(({ category, isLeaf, breadcrumbs }) => (
                    <button
                      key={category.id}
                      type="button"
                      disabled={!isLeaf}
                      onClick={() => {
                        onSelectPrimary(String(category.id));
                        setIsChangingCategory(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer",
                        isLeaf
                          ? "hover:border-primary hover:bg-primary/5 bg-background"
                          : "opacity-50 cursor-not-allowed bg-muted/40"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {breadcrumbs.map((b, i) => (
                            <span key={b.id} className="flex items-center gap-1 text-muted-foreground">
                              {i > 0 && <ChevronRight className="size-3 opacity-60" />}
                              <span className={i === breadcrumbs.length - 1 ? "font-bold text-foreground" : ""}>
                                {b.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {isLeaf ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] shrink-0"
                        >
                          Select Leaf
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                          Parent Group
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-muted-foreground">
                    No matching categories found for &quot;{searchQuery}&quot;.
                  </p>
                )}
              </div>
            ) : (
              /* View 2: Cascading Multi-Column / Step Selector */
              <div className="space-y-3">
                {/* Active path trail */}
                {selectedPathIds.length > 0 && (
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 rounded-lg text-xs border">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-muted-foreground font-medium">Selecting:</span>
                      {selectedPathIds.map((id, idx) => {
                        const cat = categoriesById.get(id);
                        return (
                          <span key={id} className="flex items-center gap-1 font-semibold text-primary">
                            {idx > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
                            {cat?.name}
                          </span>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDrillDown}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                  </div>
                )}

                {/* Cascading Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-x-auto pb-1">
                  {cascadingLevels.map((level, levelIdx) => (
                    <div
                      key={levelIdx}
                      className="rounded-xl border bg-background/50 p-2 flex flex-col h-56 shadow-2xs"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between px-2 py-1.5 border-b mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>
                          {levelIdx === 0
                            ? "1. Parent Category"
                            : levelIdx === 1
                            ? "2. Subcategory"
                            : `${levelIdx + 1}. Child Level`}
                        </span>
                        <span className="text-[10px] font-normal">{level.options.length} items</span>
                      </div>

                      {/* Options list */}
                      <div className="flex-1 overflow-y-auto space-y-1 p-0.5">
                        {level.options.map((option) => {
                          const isSelected = selectedPathIds[levelIdx] === option.id;
                          const isLeaf = isLeafNode(option.id);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleNodeClick(option, levelIdx)}
                              className={cn(
                                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-1.5 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "hover:bg-muted text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {isLeaf ? (
                                  <span
                                    className={cn(
                                      "size-1.5 rounded-full shrink-0",
                                      isSelected ? "bg-white" : "bg-emerald-500"
                                    )}
                                  />
                                ) : (
                                  <Folder
                                    className={cn(
                                      "size-3.5 shrink-0",
                                      isSelected ? "text-primary-foreground" : "text-primary"
                                    )}
                                  />
                                )}
                                <span className="truncate">{option.name}</span>
                              </div>

                              {isLeaf ? (
                                <span
                                  className={cn(
                                    "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0",
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  )}
                                >
                                  Leaf
                                </span>
                              ) : (
                                <ChevronRight
                                  className={cn(
                                    "size-3.5 shrink-0",
                                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                                  )}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* ── SECTION 2: ADDITIONAL CATEGORIES ── */}
      {Boolean(primaryCategoryId) && (
        <Card className="border shadow-none overflow-hidden bg-card/60">
          <CardContent className="p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-primary" />
                    Additional Categories (Optional)
                  </h4>
                  {additionalCategories.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {additionalCategories.length} selected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Select any other categories where this product should also appear in the store (e.g. Hot Deals, Trending, Seasonal Promotions).
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdditional(!showAdditional)}
                className="h-7 text-xs px-2.5 gap-1 shrink-0"
              >
                {showAdditional ? "Close Selector" : "Manage Categories"}
              </Button>
            </div>

            {/* Selected Pills Display */}
            {additionalCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t">
                <span className="text-[10px] text-muted-foreground font-medium mr-1">
                  Visible in:
                </span>
                {additionalCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground border shadow-2xs"
                  >
                    <Tag className="size-3 text-muted-foreground" />
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleAdditional(cat.id)}
                      className="ml-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={`Remove ${cat.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Additional Categories Selector Drawer */}
            {showAdditional && (
              <div className="border rounded-xl p-3 bg-background space-y-2.5 mt-2">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search additional categories..."
                    value={additionalSearch}
                    onChange={(e) => setAdditionalSearch(e.target.value)}
                    className="pl-8 text-xs h-8 bg-background"
                  />
                  {additionalSearch && (
                    <button
                      type="button"
                      onClick={() => setAdditionalSearch("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border rounded-lg p-2">
                  {filteredAdditionalOptions.length > 0 ? (
                    filteredAdditionalOptions.map((cat) => {
                      const isChecked = categoryIds.includes(cat.id);
                      const path = cat.path ?? getBreadcrumbs(cat.id).map((b) => b.name).join(" / ");

                      return (
                        <label
                          key={cat.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors border",
                            isChecked
                              ? "bg-primary/5 border-primary/30 text-foreground font-semibold"
                              : "hover:bg-muted/50 border-transparent text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleAdditional(cat.id)}
                              className="size-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="text-foreground">{cat.name}</span>
                              <span className="text-[10px] text-muted-foreground ml-2 truncate">
                                ({path})
                              </span>
                            </div>
                          </div>

                          {isChecked && (
                            <Check className="size-3.5 text-primary shrink-0" />
                          )}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No categories found matching &quot;{additionalSearch}&quot;.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
